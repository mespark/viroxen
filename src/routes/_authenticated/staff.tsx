import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { getMyRole, staffUpdateTaskStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/staff")({
  ssr: false,
  beforeLoad: async () => {
    const { role } = await getMyRole();
    if (role !== "staff" && role !== "admin") throw redirect({ to: "/dashboard" });
    return { role };
  },
  head: () => ({
    meta: [
      { title: "Staff Panel — VIROXEN" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StaffPanel,
});

type Status = "not_started" | "in_progress" | "done";

function StaffPanel() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();
  const updateFn = useServerFn(staffUpdateTaskStatus);

  const tasksQ = useQuery({
    queryKey: ["staff", "tasks"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setLoading(false); return; }
      const { data: staff } = await supabase
        .from("staff")
        .select("id,name,role,email")
        .eq("user_id", u.user.id)
        .maybeSingle();
      setMe(staff);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (tasksQ.data) setTasks(tasksQ.data);
  }, [tasksQ.data]);

  const updateMut = useMutation({
    mutationFn: (v: { id: string; status: Status }) => updateFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff", "tasks"] }),
  });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Staff"
        title="Staff Panel"
        description="Your assigned tasks and workspace."
      />
      <section className="py-12">
        <div className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 lg:px-8">
          {me && (
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="mt-1 font-medium">
                {me.name} <span className="text-muted-foreground">— {me.role}</span>
              </p>
            </div>
          )}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Tasks</h2>
            {loading || tasksQ.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : tasks.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                No tasks assigned.
              </p>
            ) : (
              <div className="divide-y divide-border/60 rounded-xl border border-border/60 bg-card">
                {tasks.map((t) => (
                  <div key={t.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium">{t.title}</p>
                      {t.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                      )}
                      {t.due_date && (
                        <p className="mt-1 text-xs text-muted-foreground">Due {t.due_date}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="uppercase text-[10px] tracking-wider">
                        {t.status}
                      </Badge>
                      <Select
                        value={t.status}
                        onValueChange={(v) => updateMut.mutate({ id: t.id, status: v as Status })}
                      >
                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_started">Not started</SelectItem>
                          <SelectItem value="in_progress">In progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
