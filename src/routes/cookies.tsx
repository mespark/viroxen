import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — VIROXEN" },
      { name: "description", content: "How VIROXEN uses cookies on this website." },
      { property: "og:url", content: "/cookies" },
    ],
    links: [{ rel: "canonical", href: "/cookies" }],
  }),
  component: Cookies,
});

function Cookies() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Legal" title="Cookie Policy" description="Last updated: July 14, 2026" />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-muted-foreground">
          VIROXEN uses only cookies that are strictly necessary to render this website
          and remember your theme preference. We do not use tracking cookies,
          advertising cookies, or third-party analytics cookies.
        </p>
        <h2 className="mt-10 text-xl font-semibold">Categories in use</h2>
        <ul className="mt-3 ml-5 list-disc space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Essential</strong> — required for the site to
            function (routing, layout, theme).
          </li>
          <li>
            <strong className="text-foreground">Preference</strong> — stores your chosen theme
            (dark or light) in local storage.
          </li>
        </ul>
        <h2 className="mt-10 text-xl font-semibold">Managing cookies</h2>
        <p className="mt-3 text-muted-foreground">
          You can clear your browser's site data at any time to remove any stored
          preferences. Disabling essential cookies may prevent the site from rendering
          correctly.
        </p>
      </article>
    </SiteLayout>
  );
}