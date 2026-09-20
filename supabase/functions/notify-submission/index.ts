// Sends internal + confirmation emails after a contact/booking insert.
import {
  CORS_HEADERS, jsonResponse, sendMail, baseTemplate,
} from "../_shared/mailer.ts";

function escapeHtml(v: unknown) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!
  ));
}

function fieldRows(fields: Record<string, unknown>) {
  return Object.entries(fields)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `<tr>
      <td style="padding:8px 12px;color:#8a8a94;white-space:nowrap;vertical-align:top;">${escapeHtml(k)}</td>
      <td style="padding:8px 12px;color:#e6e6e6;">${escapeHtml(v)}</td>
    </tr>`).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonResponse(405, { error: "method" });

  let body: any;
  try { body = await req.json(); } catch { return jsonResponse(400, { error: "bad_json" }); }

  const type = String(body?.type ?? ""); // "inquiry" | "booking"
  const fields = (body?.fields ?? {}) as Record<string, unknown>;
  const submitterEmail = String(fields?.email ?? "").trim();
  const submitterName = String(fields?.name ?? "").trim();
  const notifyTo = Deno.env.get("NOTIFY_TO") ?? Deno.env.get("GMAIL_ADDRESS") ?? "";

  const label = type === "booking" ? "New audit request" : "New inquiry";
  const subject = type === "booking" ? "[VIROXEN] New Booking" : "[VIROXEN] New Inquiry";

  const table = `<table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;border:1px solid #1f1f24;border-radius:10px;overflow:hidden;">${fieldRows(fields)}</table>`;

  const results = await Promise.allSettled([
    notifyTo ? sendMail({
      to: notifyTo,
      subject,
      html: baseTemplate(label, `<p>A new submission was received on viroxen.co.</p>${table}`),
    }) : Promise.resolve(),
    submitterEmail ? sendMail({
      to: submitterEmail,
      subject: type === "booking"
        ? "We received your VIROXEN audit request"
        : "We received your VIROXEN inquiry",
      html: baseTemplate(
        type === "booking" ? "Audit request received" : "Inquiry received",
        `<p>${submitterName ? `Hi ${escapeHtml(submitterName)},` : "Hello,"}</p>
         <p>Thank you for reaching out. We've received your ${type === "booking" ? "audit request" : "inquiry"} and a member of our team will respond within one business day.</p>
         <p style="color:#8a8a94;font-size:12px;">This is an automated confirmation from VIROXEN. Please do not reply — we'll be in touch shortly.</p>`,
      ),
    }) : Promise.resolve(),
  ]);

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length) console.error("notify errors:", failed.map((r: any) => r.reason?.message));
  return jsonResponse(200, { ok: true, sent: results.length - failed.length });
});
