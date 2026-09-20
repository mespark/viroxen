import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { SUPPORT_EMAIL } from "@/lib/site-data";
import { plansQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/book")({
  validateSearch: (search: Record<string, unknown>) => ({
    plan: typeof search.plan === "string" ? search.plan : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Request an Audit — VIROXEN" },
      {
        name: "description",
        content:
          "Request a VIROXEN security audit. Tell us about your scope and we'll respond within one business day.",
      },
      { property: "og:url", content: "/book" },
    ],
    links: [{ rel: "canonical", href: "/book" }],
  }),
  component: Book,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Invalid email").max(255),
  company: z.string().trim().max(160).optional(),
  targets: z.string().trim().min(1, "Targets are required").max(500),
  scope: z.string().trim().min(1, "Scope summary is required").max(500),
  timeline: z.string().trim().max(160).optional(),
  notes: z.string().trim().max(4000).optional(),
});

function Book() {
  const { plan: planParam } = Route.useSearch();
  const { data: plans = [] } = useQuery(plansQuery);
  const initial = plans.find((p) => p.slug === planParam)?.name ?? "Professional";
  const [plan, setPlan] = useState<string>(initial);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  // Sync default plan once plans arrive if we didn't have them yet
  if (plans.length && plan === "Professional" && planParam) {
    const match = plans.find((p) => p.slug === planParam)?.name;
    if (match && match !== plan) setPlan(match);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      company: fd.get("company") || undefined,
      targets: fd.get("targets"),
      scope: fd.get("scope"),
      timeline: fd.get("timeline") || undefined,
      notes: fd.get("notes") || undefined,
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setBusy(true);
    try {
      const planRow = plans.find((p) => p.name === plan);
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("bookings").insert({
        user_id: userData.user?.id ?? null,
        plan_slug: planRow?.slug ?? "custom",
        plan_name: plan,
        name: parsed.data.name,
        email: parsed.data.email,
        company: parsed.data.company ?? null,
        targets: parsed.data.targets,
        scope_summary: parsed.data.scope,
        timeline: parsed.data.timeline ?? null,
        notes: parsed.data.notes ?? null,
      });
      if (error) throw error;
      try {
        await supabase.functions.invoke("notify-submission", {
          body: {
            type: "booking",
            fields: {
              plan: plan,
              plan_slug: planRow?.slug ?? "custom",
              name: parsed.data.name,
              email: parsed.data.email,
              company: parsed.data.company ?? "",
              targets: parsed.data.targets,
              scope_summary: parsed.data.scope,
              timeline: parsed.data.timeline ?? "",
              notes: parsed.data.notes ?? "",
            },
          },
        });
      } catch (e) { console.warn("notify failed", e); }
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send your request");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <SiteLayout>
        <PageHeader eyebrow="Request received" title="Thanks — we'll be in touch." description="You'll receive a reply within one business day." />
        <section className="py-16">
          <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
            <div className="rounded-2xl border border-border/60 bg-card p-8">
              <CheckCircle2 className="mx-auto h-12 w-12 text-primary" strokeWidth={1.4} />
              <h2 className="mt-4 text-xl font-semibold">Audit request submitted</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We've received your request for the {plan} plan. Our team will reach out shortly.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link to="/"><Button variant="outline">Back to home</Button></Link>
                <Link to="/dashboard"><Button>View my requests</Button></Link>
              </div>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Book an audit"
        title="Request a VIROXEN security audit."
        description="Share your scope and constraints. We reply with next steps within one business day."
      />
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <form className="space-y-5 rounded-2xl border border-border/60 bg-card p-6 sm:p-8" onSubmit={onSubmit}>
            <div>
              <Label>Plan</Label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.slug} value={p.name}>{p.name} — {p.price}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required className="mt-2" />
              </div>
              <div>
                <Label htmlFor="email">Work email</Label>
                <Input id="email" name="email" type="email" required className="mt-2" />
              </div>
            </div>
            <div>
              <Label htmlFor="company">Company (optional)</Label>
              <Input id="company" name="company" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="targets">Target domain(s) or application(s)</Label>
              <Input id="targets" name="targets" required placeholder="app.example.com, api.example.com" className="mt-2" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="scope">Scope summary</Label>
                <Input id="scope" name="scope" required placeholder="e.g. SaaS with 3 user roles" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="timeline">Desired timeline</Label>
                <Input id="timeline" name="timeline" placeholder="e.g. within 2 weeks" className="mt-2" />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Additional notes</Label>
              <Textarea id="notes" name="notes" rows={5} className="mt-2" />
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={busy}>
              {busy ? "Sending…" : "Send audit request"}
            </Button>
            <p className="text-xs text-muted-foreground">
              We only test against systems you own or are authorized to assess. Your request is stored securely — an email copy is also on its way to {SUPPORT_EMAIL}.
            </p>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
