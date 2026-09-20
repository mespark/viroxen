import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { faqs, SUPPORT_EMAIL } from "@/lib/site-data";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — VIROXEN" },
      {
        name: "description",
        content:
          "Answers to common questions about VIROXEN security audits: scope, standards, reporting, retests, NDAs, and payment.",
      },
      { property: "og:title", content: "Frequently Asked Questions — VIROXEN" },
      {
        property: "og:description",
        content: "Common questions about scope, standards, deliverables, and retests.",
      },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(faqJsonLd),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="FAQ"
        title="Questions we get before every engagement."
        description="If your question isn't answered here, email us — we reply to every legitimate inquiry within one business day."
      />

      <section className="border-b border-border/60 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <dl className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
            {faqs.map((f) => (
              <div key={f.q} className="px-6 py-6 sm:px-8">
                <dt className="text-base font-semibold text-foreground">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 rounded-2xl border border-border/60 bg-muted/20 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground">Still have a question?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Email{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              or head to the{" "}
              <Link to="/contact" className="text-primary underline-offset-4 hover:underline">
                contact page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}