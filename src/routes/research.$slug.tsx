import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, FileText, Download, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatPostDate } from "@/lib/site-data";

type Post = {
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  tags: string[];
  author_name: string;
  published_at: string | null;
  pdf_url: string | null;
};

export const Route = createFileRoute("/research/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("research_posts")
      .select("slug,title,excerpt,body,tags,author_name,published_at,pdf_url")
      .eq("slug", params.slug)
      .eq("status", "published")
      .maybeSingle();
    if (!data) throw notFound();
    return { post: data as Post };
  },
  head: ({ loaderData, params }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.post.title} — VIROXEN Research` },
          { name: "description", content: loaderData.post.excerpt ?? "" },
          { property: "og:title", content: loaderData.post.title },
          { property: "og:description", content: loaderData.post.excerpt ?? "" },
          { property: "og:type", content: "article" },
          { property: "og:url", content: `/research/${params.slug}` },
        ]
      : [{ name: "robots", content: "noindex" }],
    links: [{ rel: "canonical", href: `/research/${params.slug}` }],
  }),
  component: PostPage,
  errorComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
      </div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">Article not found</h1>
        <Link to="/research" className="mt-6 inline-block text-primary hover:underline">← Back to research</Link>
      </div>
    </SiteLayout>
  ),
});

function usePdfUrl(pdfUrl: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!pdfUrl) { setUrl(null); return; }
    // If already a full URL, use directly.
    if (/^https?:\/\//i.test(pdfUrl)) { setUrl(pdfUrl); return; }
    // Otherwise treat as a storage path inside research-pdfs bucket.
    const path = pdfUrl.replace(/^research-pdfs\//, "");
    let cancelled = false;
    (async () => {
      const { data } = await supabase.storage.from("research-pdfs")
        .createSignedUrl(path, 60 * 60);
      if (!cancelled) setUrl(data?.signedUrl ?? null);
    })();
    return () => { cancelled = true; };
  }, [pdfUrl]);
  return url;
}

function PostPage() {
  const { post } = Route.useLoaderData() as { post: Post };
  const pdf = usePdfUrl(post.pdf_url);

  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link to="/research" className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> All research
        </Link>
        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px] uppercase tracking-wider">{t}</Badge>
          ))}
        </div>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {post.author_name} · {post.published_at ? formatPostDate(post.published_at.slice(0,10)) : ""}
        </p>
        <div className="mt-10 space-y-5 text-[15px] leading-relaxed text-foreground/90">
          {post.body.split("\n\n").map((para, i) => (
            <p key={i} className="whitespace-pre-wrap">{para}</p>
          ))}
        </div>

        {post.pdf_url && (
          <div className="mt-12 rounded-2xl border border-border/60 bg-card p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background text-primary">
                <FileText className="h-5 w-5" strokeWidth={1.6} />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-foreground">Attached document</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  This article has an accompanying PDF. Open it in a new tab or download a copy.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button asChild disabled={!pdf}>
                    <a href={pdf ?? "#"} target="_blank" rel="noopener noreferrer" aria-disabled={!pdf}>
                      <ExternalLink className="mr-2 h-4 w-4" /> Open PDF
                    </a>
                  </Button>
                  <Button asChild variant="outline" disabled={!pdf}>
                    <a href={pdf ?? "#"} download aria-disabled={!pdf}>
                      <Download className="mr-2 h-4 w-4" /> Download PDF
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </article>
    </SiteLayout>
  );
}
