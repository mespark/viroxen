// Brute-force protection: check if email is locked; record success/failure.
// action: "check" | "record"
import { CORS_HEADERS, jsonResponse, createAdmin } from "../_shared/mailer.ts";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonResponse(405, { error: "method" });

  let body: any;
  try { body = await req.json(); } catch { return jsonResponse(400, { error: "bad_json" }); }

  const action = body?.action as string;
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!email) return jsonResponse(400, { error: "email_required" });

  const admin = await createAdmin();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || null;
  const since = new Date(Date.now() - WINDOW_MS).toISOString();

  if (action === "check") {
    const { count } = await admin.from("login_attempts")
      .select("*", { count: "exact", head: true })
      .eq("email", email).eq("success", false).gte("attempted_at", since);
    if ((count ?? 0) >= MAX_FAILS) {
      // Find the newest failure time
      const { data: last } = await admin.from("login_attempts")
        .select("attempted_at").eq("email", email).eq("success", false)
        .order("attempted_at", { ascending: false }).limit(1).maybeSingle();
      const oldest = last ? new Date(last.attempted_at).getTime() : Date.now();
      const remaining = Math.max(0, WINDOW_MS - (Date.now() - oldest));
      return jsonResponse(423, { locked: true, retry_after: Math.ceil(remaining / 1000) });
    }
    return jsonResponse(200, { locked: false });
  }

  if (action === "record") {
    const success = Boolean(body?.success);
    await admin.from("login_attempts").insert({ email, ip, success });
    if (success) {
      // Clear the counter on success by expiring old rows (delete window failures)
      await admin.from("login_attempts").delete().eq("email", email).eq("success", false);
    }
    return jsonResponse(200, { ok: true });
  }

  return jsonResponse(400, { error: "unknown_action" });
});
