// Shared Gmail SMTP mailer for all Viroxen Supabase edge functions.
// deno-lint-ignore-file no-explicit-any
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const user = Deno.env.get("GMAIL_ADDRESS");
  const pass = Deno.env.get("GMAIL_APP_PASSWORD");
  if (!user || !pass) throw new Error("Missing Gmail credentials");

  const client = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 465,
      tls: true,
      auth: { username: user, password: pass.replace(/\s+/g, "") },
    },
  });

  try {
    await client.send({
      from: `VIROXEN <${user}>`,
      to: opts.to,
      subject: opts.subject,
      content: opts.text ?? opts.html.replace(/<[^>]+>/g, ""),
      html: opts.html,
    });
  } finally {
    try { await client.close(); } catch { /* ignore */ }
  }
}

export function baseTemplate(title: string, bodyHtml: string) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#0b0b0d;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#e6e6e6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0b0d;padding:32px 0;">
      <tr><td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;background:#121216;border:1px solid #1f1f24;border-radius:14px;overflow:hidden;">
          <tr><td style="padding:28px 32px;border-bottom:1px solid #1f1f24;">
            <div style="font-size:14px;letter-spacing:0.24em;color:#8a8a94;">VIROXEN</div>
          </td></tr>
          <tr><td style="padding:32px;">
            <h1 style="margin:0 0 16px;font-size:20px;color:#ffffff;font-weight:600;">${title}</h1>
            <div style="font-size:14px;line-height:1.65;color:#c8c8d0;">${bodyHtml}</div>
          </td></tr>
          <tr><td style="padding:20px 32px;border-top:1px solid #1f1f24;font-size:12px;color:#6a6a74;">
            Evidence-based security engineering.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function createAdmin() {
  // Lazy import to keep worker cold-start light
  return import("https://esm.sh/@supabase/supabase-js@2.45.0").then(
    ({ createClient }) => {
      const url = Deno.env.get("SUPABASE_URL")!;
      const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      return createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    },
  );
}
