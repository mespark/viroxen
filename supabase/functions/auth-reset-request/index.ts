// Sends a password reset link via Gmail SMTP using Supabase admin.generateLink.
import {
  CORS_HEADERS, jsonResponse, sendMail, baseTemplate, createAdmin,
} from "../_shared/mailer.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonResponse(405, { error: "method" });

  let body: any;
  try { body = await req.json(); } catch { return jsonResponse(400, { error: "bad_json" }); }
  const email = String(body?.email ?? "").trim().toLowerCase();
  const redirectTo = String(body?.redirect_to ?? "");
  if (!email || !redirectTo) return jsonResponse(400, { error: "invalid" });

  const admin = await createAdmin();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });
  // Don't leak whether the account exists — always report ok to the caller.
  if (error || !data?.properties?.action_link) {
    console.log("reset_no_user_or_error", error?.message);
    return jsonResponse(200, { ok: true });
  }

  try {
    await sendMail({
      to: email,
      subject: "Reset your VIROXEN password",
      html: baseTemplate(
        "Reset your password",
        `<p>We received a request to reset the password for your VIROXEN account.</p>
         <p style="margin:28px 0;">
           <a href="${data.properties.action_link}" style="display:inline-block;background:#ffffff;color:#0b0b0d;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;">Reset password</a>
         </p>
         <p style="color:#8a8a94;font-size:12px;">If you didn't request this, you can safely ignore this email. The link expires shortly.</p>`,
      ),
    });
  } catch (e) {
    console.error("mail_error", e);
  }
  return jsonResponse(200, { ok: true });
});
