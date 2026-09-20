// Password reset via 6-digit OTP.
// Actions: "start" -> send code, "verify" -> return reset_token, "set_password" -> update password.
import {
  CORS_HEADERS, jsonResponse, sendMail, baseTemplate, sha256Hex, createAdmin,
} from "../_shared/mailer.ts";

const OTP_TTL_MS = 10 * 60 * 1000;
const TOKEN_TTL_MS = 15 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

function otp6() {
  const n = new Uint32Array(1);
  crypto.getRandomValues(n);
  return String(n[0] % 1_000_000).padStart(6, "0");
}

function randomToken() {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
}

async function findUserIdByEmail(admin: any, email: string): Promise<string | null> {
  let page = 1;
  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return null;
    const hit = data.users.find((u: any) => (u.email ?? "").toLowerCase() === email);
    if (hit) return hit.id;
    if (data.users.length < 200) return null;
    page++;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonResponse(405, { error: "method" });

  let body: any;
  try { body = await req.json(); } catch { return jsonResponse(400, { error: "bad_json" }); }
  const action = body?.action as string;
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return jsonResponse(400, { error: "invalid_email" });

  const admin = await createAdmin();

  if (action === "start") {
    // Don't leak whether the account exists — always report ok.
    const userId = await findUserIdByEmail(admin, email);

    // Cooldown check on any recent row
    const { data: recent } = await admin.from("reset_otps")
      .select("last_sent_at").eq("email", email).is("consumed_at", null)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (recent) {
      const gap = Date.now() - new Date(recent.last_sent_at).getTime();
      if (gap < RESEND_COOLDOWN_MS) {
        return jsonResponse(200, { ok: true, retry_after: Math.ceil((RESEND_COOLDOWN_MS - gap) / 1000) });
      }
    }

    if (!userId) return jsonResponse(200, { ok: true });

    // Invalidate previous pending resets
    await admin.from("reset_otps").update({ consumed_at: new Date().toISOString() })
      .eq("email", email).is("consumed_at", null);

    const code = otp6();
    const otpHash = await sha256Hex(code + ":" + email);
    const { error: insErr } = await admin.from("reset_otps").insert({
      email, otp_hash: otpHash,
      expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    });
    if (insErr) return jsonResponse(500, { error: "db", detail: insErr.message });

    try {
      await sendMail({
        to: email,
        subject: `Your VIROXEN password reset code: ${code}`,
        html: baseTemplate("Reset your password",
          `<p>Use this code to reset your VIROXEN password:</p>
           <p style="font-size:28px;letter-spacing:0.35em;font-weight:600;color:#ffffff;margin:24px 0;">${code}</p>
           <p style="color:#8a8a94;">Expires in 10 minutes. If you didn't request this, you can ignore this email.</p>`),
      });
    } catch (e) {
      console.error("mail_error", e);
      return jsonResponse(500, { error: "mail_failed" });
    }
    return jsonResponse(200, { ok: true });
  }

  if (action === "verify") {
    const code = String(body?.otp ?? "").trim();
    if (!/^\d{6}$/.test(code)) return jsonResponse(400, { error: "invalid_otp" });

    const { data: row } = await admin.from("reset_otps")
      .select("*").eq("email", email).is("consumed_at", null)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!row) return jsonResponse(404, { error: "no_pending" });

    if (new Date(row.expires_at).getTime() < Date.now())
      return jsonResponse(410, { error: "expired" });

    const expected = await sha256Hex(code + ":" + email);
    if (expected !== row.otp_hash) return jsonResponse(401, { error: "wrong_code" });

    const token = randomToken();
    const tokenHash = await sha256Hex(token + ":" + email);
    await admin.from("reset_otps").update({
      verified_at: new Date().toISOString(),
      reset_token_hash: tokenHash,
      expires_at: new Date(Date.now() + TOKEN_TTL_MS).toISOString(),
    }).eq("id", row.id);

    return jsonResponse(200, { ok: true, reset_token: token });
  }

  if (action === "set_password") {
    const token = String(body?.reset_token ?? "");
    const password = String(body?.password ?? "");
    if (!token) return jsonResponse(400, { error: "missing_token" });
    if (password.length < 8) return jsonResponse(400, { error: "weak_password" });

    const tokenHash = await sha256Hex(token + ":" + email);
    const { data: row } = await admin.from("reset_otps")
      .select("*").eq("email", email).eq("reset_token_hash", tokenHash)
      .is("consumed_at", null).order("created_at", { ascending: false })
      .limit(1).maybeSingle();
    if (!row || !row.verified_at) return jsonResponse(401, { error: "invalid_token" });
    if (new Date(row.expires_at).getTime() < Date.now())
      return jsonResponse(410, { error: "expired" });

    const userId = await findUserIdByEmail(admin, email);
    if (!userId) return jsonResponse(404, { error: "no_user" });

    const { error: updErr } = await admin.auth.admin.updateUserById(userId, { password });
    if (updErr) return jsonResponse(400, { error: "update_failed", detail: updErr.message });

    await admin.from("reset_otps").update({ consumed_at: new Date().toISOString() })
      .eq("id", row.id);

    return jsonResponse(200, { ok: true });
  }

  return jsonResponse(400, { error: "unknown_action" });
});
