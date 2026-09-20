import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — VIROXEN" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

type Booking = {
  id: string;
  plan_name: string;
  status: string;
  targets: string | null;
  created_at: string;
};
type Inquiry = {
  id: string;
  service_type: string | null;
  status: string;
  message: string;
  created_at: string;
};

function Dashboard() {
  const ctx = Route.useRouteContext();
  const user = ctx.user;
  const { theme, toggle } = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [profileName, setProfileName] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("bookings")
      .select("id,plan_name,status,targets,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setBookings((data as Booking[]) ?? []));
    supabase
      .from("inquiries")
      .select("id,service_type,status,message,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setInquiries((data as Inquiry[]) ?? []));
    supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfileName(data?.name ?? ""));
  }, [user]);

  async function saveTheme(next: "dark" | "light") {
    if (!user) return;
    await supabase.from("profiles").update({ theme_preference: next }).eq("id", user.id);
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Your account"
        title={profileName ? `Welcome, ${profileName}.` : "Welcome."}
        description="Track your audit requests, inquiries, and account preferences."
      />
      <section className="py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Audit requests</h2>
                <Link to="/book"><Button size="sm">New request</Button></Link>
              </div>
              {bookings.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                  No audit requests yet.
                </p>
              ) : (
                <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-card">
                  {bookings.map((b) => (
                    <div key={b.id} className="flex items-start justify-between gap-4 p-4">
                      <div>
                        <p className="font-medium">{b.plan_name}</p>
                        {b.targets && <p className="mt-1 text-xs text-muted-foreground">{b.targets}</p>}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(b.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary" className="uppercase text-[10px] tracking-wider">{b.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Inquiries</h2>
                <Link to="/contact"><Button size="sm" variant="outline">New inquiry</Button></Link>
              </div>
              {inquiries.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                  No inquiries yet.
                </p>
              ) : (
                <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-card">
                  {inquiries.map((i) => (
                    <div key={i.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-medium">{i.service_type ?? "General inquiry"}</p>
                        <Badge variant="secondary" className="uppercase text-[10px] tracking-wider">{i.status}</Badge>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{i.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(i.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Account</p>
              <p className="mt-2 text-sm text-foreground">{user?.email}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}
              >
                Sign out
              </Button>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Theme preference</p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => { if (theme !== "dark") toggle(); saveTheme("dark"); }}
                >
                  <Moon className="mr-2 h-4 w-4" /> Dark
                </Button>
                <Button
                  size="sm"
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => { if (theme !== "light") toggle(); saveTheme("light"); }}
                >
                  <Sun className="mr-2 h-4 w-4" /> Light
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
