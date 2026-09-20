import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Reveal, RevealStagger, RevealItem } from "@/components/motion/Reveal";
import { addonsQuery, plansQuery } from "@/lib/queries";
import { includedInAllPaid } from "@/lib/site-data";

type Plan = {
  slug: string;
  name: string;
  price: string;
  price_note: string | null;
  audience: string;
  delivery: string;
  popular: boolean;
  includes: string[];
  not_included: string[];
  cta: string;
};

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Security Audit Services — VIROXEN" },
      {
        name: "description",
        content:
          "Structured web application, API and infrastructure security assessments. Aligned with OWASP Top 10, OWASP ASVS Level 2, and CVSS 3.1 scoring.",
      },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: Services,
});

function Services() {
  const { data: plans = [], isLoading } = useQuery(plansQuery);
  const { data: addons = [] } = useQuery(addonsQuery);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Pillar 01 · Services"
        title="Security audits engineered for delivery teams."
        description="Manual + automated assessments, reproducible findings, CVSS-scored severity, and remediation guidance you can hand directly to a developer."
      />

      <section className="border-b border-border/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {[0,1,2].map(i => <div key={i} className="h-96 animate-pulse rounded-2xl border border-border/60 bg-card/50" />)}
            </div>
          ) : (
            <>
              <RevealStagger className="grid gap-6 lg:grid-cols-3 lg:items-start">
                {plans.slice(0, 3).map((p) => (
                  <RevealItem key={p.slug}><PlanCard plan={p as Plan} /></RevealItem>
                ))}
              </RevealStagger>
              <RevealStagger className="mt-6 grid gap-6 lg:grid-cols-2">
                {plans.slice(3).map((p) => (
                  <RevealItem key={p.slug}><PlanCard plan={p as Plan} /></RevealItem>
                ))}
              </RevealStagger>
            </>
          )}
        </div>
      </section>

      <section className="border-b border-border/60 bg-muted/10 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Every paid plan includes</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">A consistent, structured deliverable.</h2>
          </Reveal>
          <RevealStagger as="ul" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" stagger={0.05}>
            {includedInAllPaid.map((i) => (
              <RevealItem as="li" key={i} className="card-lift flex items-start gap-3 rounded-lg border border-border/60 bg-card p-4">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm">{i}</span>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      <section className="border-b border-border/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Add-on services</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Extend any engagement, à la carte.</h2>
          <div className="mt-8 overflow-hidden rounded-xl border border-border/60">
            <table className="min-w-full divide-y divide-border/60 text-sm">
              <thead className="bg-muted/20 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Service</th>
                  <th className="px-5 py-3 text-right font-medium">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 bg-card">
                {addons.map((a) => (
                  <tr key={a.id}>
                    <td className="px-5 py-3 text-foreground">{a.name}</td>
                    <td className="px-5 py-3 text-right font-medium text-muted-foreground">{a.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight">Not sure where to start?</h2>
          <p className="mt-4 text-muted-foreground">
            Tell us what you're building and we'll recommend the right tier — or a custom scope if your environment calls for it.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/contact"><Button size="lg" variant="outline">Talk to us</Button></Link>
            <Link to="/book"><Button size="lg">Request an Audit</Button></Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={`relative flex h-full flex-col rounded-2xl border p-7 transition-colors ${
        plan.popular ? "border-primary/60 bg-card shadow-brand" : "border-border/60 bg-card hover:border-primary/40"
      }`}
    >
      {plan.popular && (
        <Badge className="absolute -top-3 left-6 gap-1 rounded-full px-3 py-1 text-[10px] uppercase tracking-wider">
          <Sparkles className="h-3 w-3" /> Most popular
        </Badge>
      )}
      <div>
        <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{plan.audience}</p>
      </div>
      <div className="mt-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
          {plan.price_note && (
            <span className="text-xs uppercase tracking-wider text-muted-foreground">{plan.price_note}</span>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Delivery: {plan.delivery}</p>
      </div>
      <ul className="mt-6 flex-1 space-y-2.5 text-sm">
        {plan.includes.map((i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-foreground/90">{i}</span>
          </li>
        ))}
        {plan.not_included?.map((i) => (
          <li key={i} className="flex items-start gap-2.5 text-muted-foreground line-through">
            <X className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{i}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Link to="/book" search={{ plan: plan.slug }}>
          <Button className="w-full" variant={plan.popular ? "default" : "outline"}>{plan.cta}</Button>
        </Link>
      </div>
    </div>
  );
}
