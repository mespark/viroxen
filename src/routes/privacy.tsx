import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { SUPPORT_EMAIL } from "@/lib/site-data";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — VIROXEN" },
      { name: "description", content: "How VIROXEN collects, uses, and protects your data." },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Legal" title="Privacy Policy" description="Last updated: July 14, 2026" />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-muted-foreground">
          VIROXEN respects your privacy. This policy describes what we collect on this
          website and how it is used. This site does not host user accounts and does not
          run analytics beyond what our hosting provider requires for basic delivery.
        </p>
        <h2 className="mt-10 text-xl font-semibold">Information we collect</h2>
        <ul className="mt-3 ml-5 list-disc space-y-2 text-muted-foreground">
          <li>Contact information you provide when using our contact or audit forms.</li>
          <li>Standard server logs (IP address, user agent, timestamps) from our hosting provider.</li>
          <li>Essential cookies required to render the site correctly.</li>
        </ul>
        <h2 className="mt-10 text-xl font-semibold">How we use it</h2>
        <ul className="mt-3 ml-5 list-disc space-y-2 text-muted-foreground">
          <li>To respond to inquiries submitted through the contact and booking forms.</li>
          <li>To maintain the reliability and security of the website.</li>
        </ul>
        <h2 className="mt-10 text-xl font-semibold">Data sharing</h2>
        <p className="mt-3 text-muted-foreground">
          We do not sell or rent personal data. We do not share information you send us
          with any third party outside VIROXEN, except when required by law.
        </p>
        <h2 className="mt-10 text-xl font-semibold">Contact</h2>
        <p className="mt-3 text-muted-foreground">
          For any privacy question, email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
            {SUPPORT_EMAIL}
          </a>.
        </p>
      </article>
    </SiteLayout>
  );
}