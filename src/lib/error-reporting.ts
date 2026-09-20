// Local error logging helper.
export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof console === "undefined") return;
  console.error("[app error]", error, context);
}
