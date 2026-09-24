import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileCheck2, Fingerprint, Layers, Radar, ShieldCheck, Terminal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal, RevealStagger, RevealItem } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { HeroShield } from "@/components/motion/HeroShield";
import { HeroBackdrop, WordsReveal, Magnetic, ClientOnlyFX } from "@/components/motion/HeroFX";
import { formatPostDate, posts, SITE_URL } from "@/lib/site-data";
import { listAuditedClients, listTools } from "@/lib/admin.functions";
import { publishedPostsQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VIROXEN — Evidence-based cybersecurity for engineering teams" },
      {
        name: "description",
        content:
          "Security audits, in-house security products, and applied research. Aligned with OWASP and CVSS. No fear, no hype — just findings you can act on.",
      },
      { property: "og:url", content: `${SITE_URL}/` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      <Hero />
      <TrustStrip />
      <Pillars />
      <WhyVX />
      <AuditedClients />
      <OurTools />
      <Research />
      <CaseStudies />
      <CTA />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="grid-bg absolute inset-0 opacity-40" aria-hidden="true" />
      <ClientOnlyFX>
        <HeroBackdrop />
      </ClientOnlyFX>
      <HeroShield />
      <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal y={12} duration={0.5}>
            <Badge
              variant="outline"
              className="mb-6 rounded-full border-border/80 bg-background/60 px-3 py-1 text-xs font-medium tracking-wider text-muted-foreground backdrop-blur"
            >
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              Independent cybersecurity engineering
            </Badge>
          </Reveal>
          <WordsReveal
            text="Reduce risk before it reaches production."
            highlight="production."
            className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl"
          />
          <Reveal y={14} duration={0.5} delay={0.12}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              VIROXEN delivers structured security assessments, in-house security tooling, and
              applied research — with reports engineered for engineers, not marketing decks.
            </p>
          </Reveal>
          <Reveal y={12} duration={0.5} delay={0.2}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Magnetic>
                <Link to="/book">
                  <Button
                    size="lg"
                    className="group relative w-full overflow-hidden shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-primary)_35%,transparent),0_10px_40px_-10px_color-mix(in_oklab,var(--color-primary)_60%,transparent)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-primary)_60%,transparent),0_18px_60px_-12px_color-mix(in_oklab,var(--color-primary)_80%,transparent)] sm:w-auto"
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    Request a Security Audit
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </Magnetic>
              <Magnetic strength={0.25}>
                <a
                  href="#tools"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("tools")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-border/70 bg-background/40 backdrop-blur transition-all duration-300 hover:scale-[1.03] hover:border-primary/60 hover:bg-background/70 hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-primary)_35%,transparent),0_10px_30px_-10px_color-mix(in_oklab,var(--color-primary)_50%,transparent)] sm:w-auto"
                  >
                    Explore our tools
                  </Button>
                </a>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = ["OWASP", "ASVS L2", "CVSS 3.1", "CWE", "PTES", "ISO 27001 aware"];
  return (
    <section className="border-b border-border/60 bg-muted/20 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal y={8} duration={0.4}>
          <p className="mb-5 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Methodologies we align with
          </p>
        </Reveal>
        <RevealStagger
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
          stagger={0.06}
        >
          {items.map((i) => (
            <RevealItem
              key={i}
              as="span"
              className="text-sm font-medium tracking-wide text-muted-foreground"
            >
              {i}
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

function Pillars() {
  const p = [
    {
      icon: ShieldCheck,
      title: "Security Audit Services",
      body: "Structured web, API, and infrastructure assessments. Manual verification, CVSS scoring, and remediation-first reports.",
      to: "/services",
    },
    {
      icon: Terminal,
      title: "Cybersecurity Products",
      body: "Free and paid security tooling built and maintained by our team, released for the security community and clients.",
      to: "/products",
    },
    {
      icon: Radar,
      title: "Applied Research",
      body: "Vulnerability analysis, secure coding notes, and threat intelligence — grounded, calm, and citation-ready.",
      to: "/research",
    },
  ] as const;
  return (
    <section className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">Three pillars</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            One security engineering practice, three ways to work with us.
          </h2>
        </div>
        <RevealStagger className="mt-12 grid gap-6 md:grid-cols-3">
          {p.map((item) => (
            <RevealItem key={item.title}>
              <Link
                to={item.to}
                className="card-lift group relative block h-full overflow-hidden rounded-xl border border-border/60 bg-card p-7 transition-colors hover:border-primary/40"
              >
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border/70 bg-background text-primary">
                  <item.icon className="h-5 w-5" strokeWidth={1.6} />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
                <div className="mt-6 inline-flex items-center text-sm font-medium text-primary">
                  Learn more <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

function WhyVX() {
  const items = [
    {
      icon: FileCheck2,
      title: "Evidence-based reports",
      body: "Every finding includes reproduction steps, impact analysis, and a remediation path — not just a screenshot.",
    },
    {
      icon: Layers,
      title: "Aligned with recognized frameworks",
      body: "OWASP Top 10, OWASP ASVS Level 2, CVSS 3.1 scoring, and CWE references across engagement types.",
    },
    {
      icon: Fingerprint,
      title: "Manual verification",
      body: "Automated tools discover; our engineers verify. No false-positive dumps sent to your inbox.",
    },
    {
      icon: ShieldCheck,
      title: "Calm, honest communication",
      body: "No fear-based marketing, no exaggerated claims, no fabricated findings. If it isn't broken, we say so.",
    },
  ];
  return (
    <section className="relative overflow-hidden border-b border-border/60 py-28">
      <div className="section-ambient" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          <div>
            <p className="eyebrow">Why VIROXEN</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              A practice built for engineers who ship.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              We work the way software teams work: predictable scope, reproducible findings, and
              deliverables you can hand directly to a developer.
            </p>
          </div>
          <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:col-span-2">
            {items.map((i) => (
              <RevealItem key={i.title} className="card-lift rounded-xl border border-border/60 bg-card p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border/70 bg-background text-primary">
                  <i.icon className="h-5 w-5" strokeWidth={1.6} />
                </div>
                <h3 className="font-semibold text-foreground">{i.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{i.body}</p>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </div>
    </section>
  );
}

function Research() {
  const { data: allPosts = [], isLoading } = useQuery(publishedPostsQuery);
  const featured = allPosts.slice(0, 3);
  return (
    <section className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">Recent research</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Notes from the team.
            </h2>
          </div>
          <Link to="/research" className="hidden text-sm font-medium text-primary hover:underline sm:inline-flex">
            View all research →
          </Link>
        </div>
        {isLoading ? (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[0,1,2].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl border border-border/60 bg-card/50" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">No research published yet.</p>
        ) : (
        <RevealStagger className="mt-10 grid gap-6 md:grid-cols-3">
          {featured.map((post: any) => (
            <RevealItem key={post.slug}>
              <Link
                to="/research/$slug"
                params={{ slug: post.slug }}
                className="card-lift group block h-full rounded-xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/40"
              >
                <div className="flex flex-wrap gap-2">
                  {(post.tags ?? []).map((t: string) => (
                    <Badge key={t} variant="secondary" className="text-[10px] uppercase tracking-wider">
                      {t}
                    </Badge>
                  ))}
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-snug text-foreground group-hover:text-primary">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
                <p className="mt-5 text-xs text-muted-foreground">
                  {post.author_name} · {post.published_at ? formatPostDate(post.published_at.slice(0,10)) : ""}
                </p>
              </Link>
            </RevealItem>
          ))}
        </RevealStagger>
        )}
        <div className="mt-8 sm:hidden">
          <Link to="/research" className="text-sm font-medium text-primary hover:underline">
            View all research →
          </Link>
        </div>
      </div>
    </section>
  );
}

function CaseStudies() {
  return (
    <section className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal y={14}>
          <div className="max-w-2xl">
            <p className="eyebrow">Selected work</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Case studies in preparation.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Client engagements are covered under strict confidentiality. Anonymized case studies
              will be published here as they are approved for release.
            </p>
          </div>
        </Reveal>
        <RevealStagger className="mt-10 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <RevealItem
              key={i}
              className="card-lift flex h-48 items-center justify-center rounded-xl border border-dashed border-border/70 bg-card/40 text-sm text-muted-foreground"
            >
              Case study coming soon
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal y={24} duration={0.6} className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-10 text-center sm:p-14 shimmer-border">
          <div className="grid-bg absolute inset-0 opacity-60" aria-hidden="true" />
          <Parallax offset={40} className="pointer-events-none absolute inset-0">
            <div
              className="mx-auto h-[300px] w-[600px] animate-float rounded-full opacity-20 blur-3xl"
              style={{ background: "var(--color-primary)" }}
              aria-hidden="true"
            />
          </Parallax>
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Start with a free Community security scan.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              One domain, one website, delivered in 2–3 business days. No credit card, no
              commitment.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/book">
                <Button size="lg" className="hover-lift">Request Free Scan</Button>
              </Link>
              <Link to="/services">
                <Button size="lg" variant="ghost" className="hover-lift">
                  Compare all plans
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function formatMonthYear(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long" });
}

function AuditedClients() {
  const listFn = useServerFn(listAuditedClients);
  const q = useQuery({ queryKey: ["public", "audited-clients"], queryFn: () => listFn() });
  const clients = q.data?.clients ?? [];
  if (!q.isLoading && clients.length === 0) return null;

  return (
    <section className="relative overflow-hidden border-b border-border/60 py-28">
      <div className="section-ambient" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">Trusted by</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Companies we've audited.
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            A selection of engineering teams that have partnered with VIROXEN for security
            assessments. Shared with permission.
          </p>
        </div>

        <RevealStagger className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {clients.map((c: any) => {
            const inner = (
              <>
                <div className="flex h-20 items-center justify-center rounded-md bg-background/60 p-4">
                  <img
                    src={c.logo_url}
                    alt={`${c.name} logo`}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain opacity-80 transition group-hover:opacity-100"
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.audit_type} — {formatMonthYear(c.audit_date)}
                  </p>
                  {c.testimonial && (
                    <p className="mt-3 text-xs italic text-muted-foreground line-clamp-3">
                      "{c.testimonial}"
                    </p>
                  )}
                </div>
              </>
            );
            const className =
              "card-lift group flex h-full flex-col rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/40";
            return (
              <RevealItem key={c.id}>
                {c.website_url ? (
                  <a href={c.website_url} target="_blank" rel="noreferrer" className={className}>
                    {inner}
                  </a>
                ) : (
                  <div className={className}>{inner}</div>
                )}
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
}

function OurTools() {
  const listFn = useServerFn(listTools);
  const q = useQuery({ queryKey: ["public", "homepage-tools"], queryFn: () => listFn() });
  const tools = q.data?.tools ?? [];
  if (!q.isLoading && tools.length === 0) return null;

  return (
    <section id="tools" className="scroll-mt-24 border-b border-border/60 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">Toolbox</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Explore our tools.
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Free security utilities we've built and hosted for the community. Open one in a new tab
            and start using it right away.
          </p>
        </div>

        <RevealStagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t: any) => (
            <RevealItem
              key={t.id}
              className="card-lift group flex h-full flex-col rounded-xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start gap-4">
                {t.icon_url ? (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-background/60">
                    <img
                      src={t.icon_url}
                      alt={`${t.name} icon`}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background/60">
                    <Terminal className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold tracking-tight">{t.name}</h3>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{t.description}</p>
              <div className="mt-6 flex-1" />
              <a href={t.link_url} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="w-full sm:w-auto">
                  Use Now <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </a>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
