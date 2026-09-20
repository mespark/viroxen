import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { publishedPostsQuery } from "@/lib/queries";
import { formatPostDate } from "@/lib/site-data";

export const Route = createFileRoute("/research/")({
  head: () => ({
    meta: [
      { title: "Research & Notes — VIROXEN" },
      {
        name: "description",
        content:
          "Vulnerability analysis, secure coding notes, and threat intelligence — grounded, calm, and citation-ready.",
      },
      { property: "og:url", content: "/research" },
    ],
    links: [{ rel: "canonical", href: "/research" }],
  }),
  component: Research,
});

function Research() {
  const { data: posts = [], isLoading } = useQuery(publishedPostsQuery);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => Array.from(new Set(posts.flatMap((p) => p.tags))), [posts]);

  const filtered = posts.filter((p) => {
    const matchTag = !tag || p.tags.includes(tag);
    const matchQ =
      !q ||
      p.title.toLowerCase().includes(q.toLowerCase()) ||
      (p.excerpt ?? "").toLowerCase().includes(q.toLowerCase());
    return matchTag && matchQ;
  });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Pillar 03 · Research"
        title="Notes from the security desk."
        description="Short-form analysis and long-form deep-dives. Written by the same engineers who deliver our audits."
      />

      <section className="border-b border-border/60 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Input placeholder="Search research…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTag(null)}
                className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wider transition-colors ${
                  tag === null ? "border-primary bg-primary text-primary-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => setTag(t)}
                  className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wider transition-colors ${
                    tag === t ? "border-primary bg-primary text-primary-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[0,1,2].map(i => <div key={i} className="h-56 animate-pulse rounded-xl border border-border/60 bg-card/50" />)}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">No articles match your search.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post) => (
                <Link
                  key={post.slug}
                  to="/research/$slug"
                  params={{ slug: post.slug }}
                  className="group flex flex-col rounded-xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/40"
                >
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((t: string) => (
                      <Badge key={t} variant="secondary" className="text-[10px] uppercase tracking-wider">{t}</Badge>
                    ))}
                  </div>
                  <h2 className="mt-4 text-lg font-semibold leading-snug text-foreground group-hover:text-primary">
                    {post.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    {post.author_name} · {post.published_at ? formatPostDate(post.published_at.slice(0,10)) : ""}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
