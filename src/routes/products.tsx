import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Github, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { RevealStagger, RevealItem } from "@/components/motion/Reveal";
import { listProducts } from "@/lib/admin.functions";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Cybersecurity Products & Tools — VIROXEN" },
      {
        name: "description",
        content:
          "In-house security tooling built and maintained by VIROXEN — free tools for the community and paid products for engineering teams.",
      },
      { property: "og:url", content: "/products" },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
  component: Products,
});

function Products() {
  const listFn = useServerFn(listProducts);
  const { data, isLoading } = useQuery({
    queryKey: ["public", "products"],
    queryFn: () => listFn(),
  });
  const products = data?.products ?? [];

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Pillar 02 · Products"
        title="Security tooling we build, maintain, and use."
        description="A growing catalog of open-source and paid security tools released for the community and used inside our own audit workflow."
      />

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[0,1,2,3].map(i => <div key={i} className="h-80 animate-pulse rounded-2xl border border-border/60 bg-card/50" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 p-16 text-center">
              <h3 className="text-lg font-semibold text-foreground">No products published yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                New security tools and products will appear here as they are released. Check back soon.
              </p>
            </div>
          ) : (
            <RevealStagger className="grid gap-6 md:grid-cols-2">
              {products.map((tool: any) => (
                <RevealItem
                  key={tool.id}
                  as="article"
                  className={`card-lift flex flex-col rounded-2xl border p-7 ${
                    tool.status === "coming-soon" ? "border-dashed border-border/70 bg-card/50" : "border-border/60 bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">{tool.name}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{tool.tagline}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={tool.is_paid ? "default" : "secondary"} className="uppercase tracking-wider text-[10px]">
                        {tool.is_paid ? "Paid" : "Free"}
                      </Badge>
                      {tool.status === "coming-soon" && (
                        <Badge variant="outline" className="gap-1 text-[10px] uppercase tracking-wider">
                          <Lock className="h-3 w-3" /> Coming soon
                        </Badge>
                      )}
                    </div>
                  </div>

                  {tool.features?.length ? (
                    <div className="mt-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Capabilities</p>
                      <ul className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
                        {tool.features.map((f: string) => (
                          <li key={f} className="flex items-start gap-2">
                            <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-primary" />
                            <span className="text-foreground/90">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {tool.usage_instructions && (
                    <div className="mt-5 rounded-lg border border-border/50 bg-background/60 p-3">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">How to use</p>
                      <pre className="overflow-x-auto text-xs leading-relaxed text-foreground/90">
                        <code>{tool.usage_instructions}</code>
                      </pre>
                    </div>
                  )}

                  {tool.status === "available" && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {tool.external_link && (
                        <a href={tool.external_link} target="_blank" rel="noreferrer">
                          <Button size="sm">Open tool <ExternalLink className="ml-1.5 h-3.5 w-3.5" /></Button>
                        </a>
                      )}
                      {tool.github_link && (
                        <a href={tool.github_link} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline">
                            <Github className="mr-1.5 h-3.5 w-3.5" /> View on GitHub
                          </Button>
                        </a>
                      )}
                    </div>
                  )}
                </RevealItem>
              ))}
            </RevealStagger>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
