// Signup OTP: start, resend, verify.
// Route by { action: "start" | "resend" | "verify" } in JSON body.
import {
  CORS_HEADERS,
  jsonResponse,
  sendMail,
  baseTemplate,
  sha256Hex,
  createAdmin,
} from "../_shared/mailer.ts";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

function otp6() {
  const n = new Uint32Array(1);
  crypto.getRandomValues(n);
  return String(n[0] % 1_000_000).padStart(6, "0");
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
    const password = String(body?.password ?? "");
    const fullName = body?.full_name ? String(body.full_name) : null;
    if (password.length < 8) return jsonResponse(400, { error: "weak_password" });

    // Reject if a real auth user already exists for this email.
    const { data: existing } = await admin.auth.admin.listUsers();
    if (existing?.users?.some((u) => u.email?.toLowerCase() === email)) {
      return jsonResponse(409, { error: "email_taken" });
    }

    const code = otp6();
    const otpHash = await sha256Hex(code + ":" + email);
    // NB: password_hash column is a light obfuscation, not a real hash — we
    // still need the plaintext to create the auth user on verify. Instead
    // store base64 of the plaintext + random salt; only service role reads it.
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltB64 = btoa(String.fromCharCode(...salt));
    const passObfuscated = saltB64 + "." + btoa(unescape(encodeURIComponent(password)));

    // Invalidate any previous pending signups for this email.
    await admin.from("signup_otps").update({ consumed_at: new Date().toISOString() })
      .eq("email", email).is("consumed_at", null);

    const { error: insErr } = await admin.from("signup_otps").insert({
      email,
      otp_hash: otpHash,
      password_hash: passObfuscated,
      full_name: fullName,
      expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    });
    if (insErr) return jsonResponse(500, { error: "db", detail: insErr.message });

    try {
      await sendMail({
        to: email,
        subject: `Your VIROXEN verification code: ${code}`,
        html: baseTemplate(
          "Verify your email",
          `<p>Use this code to activate your VIROXEN account:</p>
           <p style="font-size:28px;letter-spacing:0.35em;font-weight:600;color:#ffffff;margin:24px 0;">${code}</p>
           <p style="color:#8a8a94;">This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>`,
        ),
      });
    } catch (e) {
      console.error("mail_error", e);
      return jsonResponse(500, { error: "mail_failed" });
    }
    return jsonResponse(200, { ok: true });
  }

  if (action === "resend") {
    const { data: row } = await admin.from("signup_otps")
      .select("*").eq("email", email).is("consumed_at", null)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!row) return jsonResponse(404, { error: "no_pending" });

    const last = new Date(row.last_sent_at).getTime();
    if (Date.now() - last < RESEND_COOLDOWN_MS) {
      return jsonResponse(429, {
        error: "cooldown",
        retry_after: Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - last)) / 1000),
      });
    }

    const code = otp6();
    const otpHash = await sha256Hex(code + ":" + email);
    await admin.from("signup_otps").update({
      otp_hash: otpHash,
      last_sent_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    }).eq("id", row.id);

    try {
      await sendMail({
        to: email,
        subject: `Your VIROXEN verification code: ${code}`,
        html: baseTemplate("New verification code",
          `<p>Here's a fresh code:</p>
           <p style="font-size:28px;letter-spacing:0.35em;font-weight:600;color:#ffffff;margin:24px 0;">${code}</p>
           <p style="color:#8a8a94;">Expires in 10 minutes.</p>`),
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

    const { data: row } = await admin.from("signup_otps")
      .select("*").eq("email", email).is("consumed_at", null)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!row) return jsonResponse(404, { error: "no_pending" });

    if (new Date(row.expires_at).getTime() < Date.now())
      return jsonResponse(410, { error: "expired" });

    const expected = await sha256Hex(code + ":" + email);
    if (expected !== row.otp_hash) return jsonResponse(401, { error: "wrong_code" });

    // Decode password back
    const [saltB64, passB64] = String(row.password_hash).split(".");
    if (!saltB64 || !passB64) return jsonResponse(500, { error: "corrupt" });
    const password = decodeURIComponent(escape(atob(passB64)));

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: row.full_name ? { full_name: row.full_name } : {},
    });
    if (createErr) return jsonResponse(400, { error: "create_failed", detail: createErr.message });

    await admin.from("signup_otps").update({ consumed_at: new Date().toISOString() })
      .eq("id", row.id);

    return jsonResponse(200, { ok: true, user_id: created.user?.id });
  }

  return jsonResponse(400, { error: "unknown_action" });
});
