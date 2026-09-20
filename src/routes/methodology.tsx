import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { methodology } from "@/lib/site-data";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Audit Methodology — VIROXEN" },
      {
        name: "description",
        content:
          "The six-phase VIROXEN security audit methodology: scoping, reconnaissance, automated analysis, manual testing, risk scoring, and retest.",
      },
      { property: "og:title", content: "Audit Methodology — VIROXEN" },
      {
        property: "og:description",
        content:
          "How VIROXEN runs a security audit: six documented phases aligned with OWASP ASVS and CVSS 3.1.",
      },
      { property: "og:url", content: "/methodology" },
    ],
    links: [{ rel: "canonical", href: "/methodology" }],
  }),
  component: Methodology,
});

function Methodology() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="How we work"
        title="A repeatable, documented audit methodology."
        description="Every VIROXEN engagement follows the same six phases. Nothing is skipped, nothing is improvised, and every finding is traceable to a step in this process."
      />

      <section className="border-b border-border/60 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ol className="space-y-6">
            {methodology.map((p) => (
              <li
                key={p.n}
                className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8"
              >
                <div className="flex flex-col gap-6 sm:flex-row">
                  <div className="sm:w-32 shrink-0">
                    <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                      Phase {p.n}
                    </div>
                    <div className="mt-2 h-px w-10 bg-primary/60" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                      {p.name}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">{p.goal}</p>

                    <div className="mt-5 grid gap-6 md:grid-cols-2">
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                          Activities
                        </h3>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                          {p.activities.map((a) => (
                            <li key={a} className="flex gap-2">
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                          Deliverable
                        </h3>
                        <p className="mt-3 text-sm text-muted-foreground">{p.output}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to scope your engagement?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Share your targets and constraints — we'll come back with a fixed plan and timeline.
            </p>
          </div>
          <Link to="/book">
            <Button size="lg" className="font-medium">
              Request an Audit <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}