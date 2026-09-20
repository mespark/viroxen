import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Reveal, RevealStagger, RevealItem } from "@/components/motion/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — VIROXEN" },
      {
        name: "description",
        content:
          "VIROXEN is an independent cybersecurity company focused on security assessments, in-house products, and applied research — with a strict ethical stance.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About"
        title="A cybersecurity company built for the long term."
        description="VIROXEN exists to make credible, structured security engineering available to teams of every size — without fear-based marketing, without inflated findings, and without shortcuts."
      />

      <section className="border-b border-border/60 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal className="grid gap-12 md:grid-cols-3">
            <div>
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Vision</h2>
            </div>
            <div className="md:col-span-2">
              <p className="text-lg text-foreground/90">
                To become a globally trusted cybersecurity company delivering world-class
                security assessments, dependable security products, and practical cybersecurity
                research.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border/60 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal className="grid gap-12 md:grid-cols-3">
            <div>
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Mission</h2>
            </div>
            <div className="md:col-span-2 space-y-4 text-foreground/90">
              <p>
                Help engineering teams reduce risk before it reaches production — by combining
                manual verification with modern tooling, and by publishing findings that
                developers can act on directly.
              </p>
              <p>
                Build a small, sustainable catalog of in-house security products that improve
                over time and stay accessible to the community that grows around them.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border/60 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                Three pillars
              </h2>
            </div>
            <RevealStagger className="md:col-span-2 grid gap-6 sm:grid-cols-3">
              <RevealItem className="card-lift rounded-xl border border-border/60 bg-card p-5">
                <p className="text-sm font-semibold">Security Services</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Structured audits with reproducible findings and CVSS-scored severity.
                </p>
              </RevealItem>
              <RevealItem className="card-lift rounded-xl border border-border/60 bg-card p-5">
                <p className="text-sm font-semibold">Security Products</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Free and paid tooling maintained by our engineers and released publicly.
                </p>
              </RevealItem>
              <RevealItem className="card-lift rounded-xl border border-border/60 bg-card p-5">
                <p className="text-sm font-semibold">Security Research</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Applied analysis and secure coding notes — grounded, calm, and honest.
                </p>
              </RevealItem>
            </RevealStagger>
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal className="grid gap-12 md:grid-cols-3">
            <div>
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                Ethical stance
              </h2>
            </div>
            <div className="md:col-span-2 space-y-3 text-foreground/90">
              <p>We work strictly within authorized scope. Non-negotiables:</p>
              <ul className="ml-5 list-disc space-y-2 text-muted-foreground">
                <li>No unauthorized access or testing outside a signed scope.</li>
                <li>No creation or distribution of malicious software.</li>
                <li>No fear-based marketing or exaggerated security claims.</li>
                <li>No fabricated or embellished findings — ever.</li>
                <li>No hidden dependencies or undocumented data collection in our tools.</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight">Ready to talk?</h2>
          <p className="mt-4 text-muted-foreground">
            We reply to every inquiry personally. Tell us what you're building.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/contact">
              <Button size="lg" variant="outline">
                Send an inquiry
              </Button>
            </Link>
            <Link to="/book">
              <Button size="lg">Request an audit</Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}