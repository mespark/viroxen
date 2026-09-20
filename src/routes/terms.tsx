import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { SUPPORT_EMAIL } from "@/lib/site-data";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — VIROXEN" },
      { name: "description", content: "Terms governing use of the VIROXEN website and services." },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: Terms,
});

function Terms() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Legal" title="Terms of Service" description="Last updated: July 14, 2026" />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-muted-foreground">
          These terms govern your use of the VIROXEN website and any engagements with
          VIROXEN. Use of the site constitutes acceptance of these terms.
        </p>
        <h2 className="mt-10 text-xl font-semibold">Authorized use only</h2>
        <p className="mt-3 text-muted-foreground">
          All security assessments require a written scope signed by an authorized
          representative of the asset owner. VIROXEN does not perform unauthorized
          testing, does not develop or distribute malicious software, and will not
          engage in any activity outside a documented scope.
        </p>
        <h2 className="mt-10 text-xl font-semibold">Content and tooling</h2>
        <p className="mt-3 text-muted-foreground">
          Content published on this website — including research articles and product
          documentation — is provided for educational and informational purposes.
          Open-source tools linked from this site are governed by the license included
          in each repository. Paid VIROXEN products are governed by their own agreements.
        </p>
        <h2 className="mt-10 text-xl font-semibold">No warranty</h2>
        <p className="mt-3 text-muted-foreground">
          The website is provided on an "as is" basis without warranty of any kind.
          To the maximum extent permitted by law, VIROXEN disclaims liability for any
          damages arising from the use of this website or its content.
        </p>
        <h2 className="mt-10 text-xl font-semibold">Contact</h2>
        <p className="mt-3 text-muted-foreground">
          Questions:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
            {SUPPORT_EMAIL}
          </a>.
        </p>
      </article>
    </SiteLayout>
  );
}