import { createFileRoute, redirect } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  getMyRole,
  adminAddStaff,
  adminListStaff,
  adminListTasks,
  adminCreateTask,
  adminDeleteTask,
  adminListBookings,
  adminListInquiries,
  adminListResearch,
  adminCreateResearch,
  adminDeleteResearch,
  adminListAuditedClients,
  adminCreateAuditedClient,
  adminDeleteAuditedClient,
  adminListTools,
  adminCreateTool,
  adminUpdateTool,
  adminDeleteTool,
  adminListProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { role } = await getMyRole();
    if (role !== "admin") throw redirect({ to: "/dashboard" });
    return { role };
  },
  head: () => ({
    meta: [
      { title: "Admin Panel — VIROXEN" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPanel,
});

function AdminPanel() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Admin"
        title="Admin Panel"
        description="Manage research, staff, tasks, bookings, inquiries."
      />
      <section className="py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="research" className="w-full">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="research">Research</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
            </TabsList>
            <TabsContent value="research" className="mt-6"><ResearchTab /></TabsContent>
            <TabsContent value="clients" className="mt-6"><ClientsTab /></TabsContent>
            <TabsContent value="tools" className="mt-6"><ToolsTab /></TabsContent>
            <TabsContent value="products" className="mt-6"><ProductsTab /></TabsContent>
            <TabsContent value="staff" className="mt-6"><StaffTab /></TabsContent>
            <TabsContent value="tasks" className="mt-6"><TasksTab /></TabsContent>
            <TabsContent value="bookings" className="mt-6"><BookingsTab /></TabsContent>
            <TabsContent value="inquiries" className="mt-6"><InquiriesTab /></TabsContent>
          </Tabs>
        </div>
      </section>
    </SiteLayout>
  );
}

function StaffTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListStaff);
  const addFn = useServerFn(adminAddStaff);
  const staffQ = useQuery({ queryKey: ["admin", "staff"], queryFn: () => listFn() });

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const addMutation = useMutation({
    mutationFn: () => addFn({ data: { email, name, title: title.trim(), bio } }),
    onSuccess: (res) => {
      setMsg({ kind: "ok", text: res.case === "existing" ? "Existing user promoted to staff." : `Invite sent to ${email}.` });
      setEmail(""); setName(""); setTitle(""); setBio("");
      qc.invalidateQueries({ queryKey: ["admin", "staff"] });
    },
    onError: (err: any) => setMsg({ kind: "err", text: err?.message ?? "Failed" }),
  });

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="text-lg font-semibold">Add staff by email</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Existing users are promoted to staff. New emails get an invite.
        </p>
        <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setMsg(null); addMutation.mutate(); }}>
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label htmlFor="name">Full name</Label><Input id="name" required value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div>
            <Label htmlFor="title">Role / title</Label>
            <Input
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Web Developer, Security Researcher, Designer…"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Type any role — no fixed list.
            </p>
          </div>
          <div><Label htmlFor="bio">Bio (optional)</Label><Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} /></div>
          <Button type="submit" disabled={addMutation.isPending}>
            {addMutation.isPending ? "Working…" : "Add staff"}
          </Button>
          {msg && <p className={`text-sm ${msg.kind === "ok" ? "text-green-500" : "text-red-500"}`}>{msg.text}</p>}
        </form>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="text-lg font-semibold">Current staff</h2>
        <div className="mt-4 divide-y divide-border/60">
          {staffQ.isLoading && <p className="py-4 text-sm text-muted-foreground">Loading…</p>}
          {staffQ.data?.staff?.length === 0 && <p className="py-4 text-sm text-muted-foreground">No staff yet.</p>}
          {staffQ.data?.staff?.map((s: any) => (
            <div key={s.id} className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.email}</p>
                <p className="text-xs text-muted-foreground">{s.role}</p>
              </div>
              <Badge variant={s.user_id ? "secondary" : "outline"}>{s.user_id ? "active" : "invited"}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToolsTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListTools);
  const createFn = useServerFn(adminCreateTool);
  const updateFn = useServerFn(adminUpdateTool);
  const deleteFn = useServerFn(adminDeleteTool);

  const toolsQ = useQuery({ queryKey: ["admin", "homepage-tools"], queryFn: () => listFn() });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "homepage-tools"] });

  const delMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: invalidate,
    onError: (err: any) => alert(`Delete failed: ${err?.message ?? "unknown"}`),
  });

  const toggleMut = useMutation({
    mutationFn: (v: { id: string; is_active: boolean }) => updateFn({ data: v }),
    onSuccess: invalidate,
    onError: (err: any) => alert(`Update failed: ${err?.message ?? "unknown"}`),
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!name.trim() || !description.trim() || !linkUrl.trim()) {
      return setMsg({ kind: "err", text: "Name, description and link are required." });
    }
    setBusy(true);
    try {
      await createFn({
        data: {
          name: name.trim(),
          description: description.trim(),
          link_url: linkUrl.trim(),
          icon_url: iconUrl.trim() || null,
          sort_order: Number(sortOrder) || 0,
          is_active: true,
        },
      });
      setName(""); setDescription(""); setLinkUrl(""); setIconUrl(""); setSortOrder(0);
      setMsg({ kind: "ok", text: "Tool added." });
      invalidate();
    } catch (err: any) {
      setMsg({ kind: "err", text: err?.message ?? "Failed to add." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="text-lg font-semibold">Add tool</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Appears in the "Our Tools" section on the home page.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="t-name">Name</Label>
            <Input id="t-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Password Strength Checker" />
          </div>
          <div>
            <Label htmlFor="t-desc">Description</Label>
            <Textarea id="t-desc" required rows={3} maxLength={600} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short summary of what this tool does." />
          </div>
          <div>
            <Label htmlFor="t-link">Link URL</Label>
            <Input id="t-link" type="url" required value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://tool.example.com" />
          </div>
          <div>
            <Label htmlFor="t-icon">Icon URL (optional)</Label>
            <Input id="t-icon" type="url" value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} placeholder="https://.../icon.png" />
          </div>
          <div>
            <Label htmlFor="t-sort">Sort order</Label>
            <Input id="t-sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
          </div>
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Add tool"}</Button>
          {msg && <p className={`text-sm ${msg.kind === "ok" ? "text-green-500" : "text-red-500"}`}>{msg.text}</p>}
        </form>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="text-lg font-semibold">Tools</h2>
        <div className="mt-4 divide-y divide-border/60">
          {toolsQ.isLoading && <p className="py-4 text-sm text-muted-foreground">Loading…</p>}
          {toolsQ.data?.tools?.length === 0 && <p className="py-4 text-sm text-muted-foreground">No tools yet.</p>}
          {toolsQ.data?.tools?.map((t: any) => (
            <div key={t.id} className="flex items-start justify-between gap-4 py-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border/60 bg-background flex items-center justify-center">
                  {t.icon_url ? (
                    <img src={t.icon_url} alt={t.name} className="h-full w-full object-contain" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="font-medium">{t.name} {!t.is_active && <Badge variant="outline" className="ml-1 text-[10px]">inactive</Badge>}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                  <a href={t.link_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline break-all">
                    {t.link_url}
                  </a>
                  <p className="text-[10px] text-muted-foreground mt-0.5">sort: {t.sort_order}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:underline disabled:opacity-50"
                  disabled={toggleMut.isPending}
                  onClick={() => toggleMut.mutate({ id: t.id, is_active: !t.is_active })}
                >
                  {t.is_active ? "Hide" : "Activate"}
                </button>
                <button
                  type="button"
                  className="text-xs text-red-500 hover:underline disabled:opacity-50"
                  disabled={delMut.isPending}
                  onClick={() => { if (confirm(`Delete ${t.name}?`)) delMut.mutate(t.id); }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClientsTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListAuditedClients);
  const createFn = useServerFn(adminCreateAuditedClient);
  const deleteFn = useServerFn(adminDeleteAuditedClient);

  const clientsQ = useQuery({ queryKey: ["admin", "audited-clients"], queryFn: () => listFn() });

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [auditType, setAuditType] = useState("");
  const [auditDate, setAuditDate] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const delMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "audited-clients"] }),
    onError: (err: any) => alert(`Delete failed: ${err?.message ?? "unknown"}`),
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const file = fileRef.current?.files?.[0];
    if (!file) return setMsg({ kind: "err", text: "Please choose a logo image." });
    if (!/^image\//.test(file.type)) return setMsg({ kind: "err", text: "Logo must be an image." });
    if (!name.trim() || !auditType.trim() || !auditDate) {
      return setMsg({ kind: "err", text: "Name, audit type and date are required." });
    }
    setBusy(true);
    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]+/g, "");
      const path = `${Date.now()}-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}.${ext || "png"}`;
      const { error: upErr } = await supabase.storage
        .from("client-logos")
        .upload(path, file, { contentType: file.type || "image/png", upsert: false });
      if (upErr) throw upErr;

      await createFn({
        data: {
          name: name.trim(),
          logo_url: path,
          website_url: website.trim() || null,
          audit_type: auditType.trim(),
          audit_date: auditDate,
          testimonial: testimonial.trim() || null,
        },
      });

      setName(""); setWebsite(""); setAuditType(""); setAuditDate(""); setTestimonial("");
      if (fileRef.current) fileRef.current.value = "";
      setMsg({ kind: "ok", text: "Client added." });
      qc.invalidateQueries({ queryKey: ["admin", "audited-clients"] });
    } catch (err: any) {
      setMsg({ kind: "err", text: err?.message ?? "Failed to add." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="text-lg font-semibold">Add audited client</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Appears in the "Companies We've Audited" section on the home page.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="c-name">Client name</Label>
            <Input id="c-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corp" />
          </div>
          <div>
            <Label htmlFor="c-logo">Logo (image file)</Label>
            <Input id="c-logo" type="file" accept="image/*" ref={fileRef} required />
          </div>
          <div>
            <Label htmlFor="c-web">Website (optional)</Label>
            <Input id="c-web" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
          </div>
          <div>
            <Label htmlFor="c-type">Audit type</Label>
            <Input id="c-type" required value={auditType} onChange={(e) => setAuditType(e.target.value)} placeholder="Professional Plan Audit" />
          </div>
          <div>
            <Label htmlFor="c-date">Audit date</Label>
            <Input id="c-date" type="date" required value={auditDate} onChange={(e) => setAuditDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="c-test">Testimonial / blurb (optional, 1–2 lines)</Label>
            <Textarea id="c-test" rows={2} maxLength={600} value={testimonial} onChange={(e) => setTestimonial(e.target.value)} />
          </div>
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Add client"}</Button>
          {msg && <p className={`text-sm ${msg.kind === "ok" ? "text-green-500" : "text-red-500"}`}>{msg.text}</p>}
        </form>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="text-lg font-semibold">Audited clients</h2>
        <div className="mt-4 divide-y divide-border/60">
          {clientsQ.isLoading && <p className="py-4 text-sm text-muted-foreground">Loading…</p>}
          {clientsQ.data?.clients?.length === 0 && <p className="py-4 text-sm text-muted-foreground">No clients yet.</p>}
          {clientsQ.data?.clients?.map((c: any) => (
            <div key={c.id} className="flex items-start justify-between gap-4 py-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border/60 bg-background flex items-center justify-center">
                  {c.logo_url ? (
                    <img src={c.logo_url} alt={c.name} className="h-full w-full object-contain" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.audit_type} · {new Date(c.audit_date).toLocaleDateString(undefined, { year: "numeric", month: "long" })}
                  </p>
                  {c.website_url && (
                    <a href={c.website_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline break-all">
                      {c.website_url}
                    </a>
                  )}
                  {c.testimonial && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.testimonial}</p>}
                </div>
              </div>
              <button
                type="button"
                className="text-xs text-red-500 hover:underline disabled:opacity-50"
                disabled={delMut.isPending}
                onClick={() => { if (confirm(`Delete ${c.name}?`)) delMut.mutate(c.id); }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TasksTab() {
  const qc = useQueryClient();
  const listStaffFn = useServerFn(adminListStaff);
  const listTasksFn = useServerFn(adminListTasks);
  const createFn = useServerFn(adminCreateTask);
  const deleteFn = useServerFn(adminDeleteTask);

  const staffQ = useQuery({ queryKey: ["admin", "staff"], queryFn: () => listStaffFn() });
  const tasksQ = useQuery({ queryKey: ["admin", "tasks"], queryFn: () => listTasksFn() });

  const [staffId, setStaffId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const createMut = useMutation({
    mutationFn: () => createFn({ data: { staff_id: staffId, title, description, due_date: dueDate || null } }),
    onSuccess: () => {
      setMsg({ kind: "ok", text: "Task assigned." });
      setTitle(""); setDescription(""); setDueDate("");
      qc.invalidateQueries({ queryKey: ["admin", "tasks"] });
    },
    onError: (err: any) => setMsg({ kind: "err", text: err?.message ?? "Failed" }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "tasks"] }),
    onError: (err: any) => alert(`Delete failed: ${err?.message ?? "unknown"}`),
  });

  const activeStaff = (staffQ.data?.staff ?? []).filter((s: any) => s.active);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="text-lg font-semibold">Assign a task</h2>
        <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setMsg(null); if (!staffId) return setMsg({ kind: "err", text: "Pick a staff member" }); createMut.mutate(); }}>
          <div>
            <Label>Assign to</Label>
            <Select value={staffId} onValueChange={setStaffId}>
              <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
              <SelectContent>
                {activeStaff.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>{s.name} — {s.role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><Label htmlFor="tt">Title</Label><Input id="tt" required value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label htmlFor="td">Description</Label><Textarea id="td" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div><Label htmlFor="dd">Due date (optional)</Label><Input id="dd" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
          <Button type="submit" disabled={createMut.isPending}>
            {createMut.isPending ? "Assigning…" : "Assign task"}
          </Button>
          {msg && <p className={`text-sm ${msg.kind === "ok" ? "text-green-500" : "text-red-500"}`}>{msg.text}</p>}
        </form>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="text-lg font-semibold">All tasks</h2>
        <div className="mt-4 divide-y divide-border/60">
          {tasksQ.isLoading && <p className="py-4 text-sm text-muted-foreground">Loading…</p>}
          {tasksQ.data?.tasks?.length === 0 && <p className="py-4 text-sm text-muted-foreground">No tasks yet.</p>}
          {tasksQ.data?.tasks?.map((t: any) => (
            <div key={t.id} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="font-medium">{t.title}</p>
                {t.description && <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  → {t.staff?.name ?? "unassigned"}{t.due_date ? ` · due ${t.due_date}` : ""}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="secondary" className="uppercase text-[10px] tracking-wider">{t.status}</Badge>
                <button type="button" className="text-xs text-red-500 hover:underline disabled:opacity-50" disabled={delMut.isPending} onClick={() => { if (confirm("Delete this task?")) delMut.mutate(t.id); }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingsTab() {
  const listFn = useServerFn(adminListBookings);
  const q = useQuery({ queryKey: ["admin", "bookings"], queryFn: () => listFn() });
  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <h2 className="text-lg font-semibold">Recent audit bookings</h2>
      <div className="mt-4 divide-y divide-border/60">
        {q.isLoading && <p className="py-4 text-sm text-muted-foreground">Loading…</p>}
        {q.data?.bookings?.length === 0 && <p className="py-4 text-sm text-muted-foreground">No bookings yet.</p>}
        {q.data?.bookings?.map((b: any) => (
          <div key={b.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto]">
            <div className="min-w-0">
              <p className="font-medium">{b.name} <span className="text-xs text-muted-foreground">· {b.email}</span></p>
              <p className="text-xs text-muted-foreground">{b.company ?? "—"} · {b.plan_name}</p>
              {b.scope_summary && <p className="mt-1 text-sm text-muted-foreground">{b.scope_summary}</p>}
              {b.timeline && <p className="text-xs text-muted-foreground">Timeline: {b.timeline}</p>}
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="secondary">{b.status}</Badge>
              <span className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InquiriesTab() {
  const listFn = useServerFn(adminListInquiries);
  const q = useQuery({ queryKey: ["admin", "inquiries"], queryFn: () => listFn() });
  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <h2 className="text-lg font-semibold">Recent inquiries</h2>
      <div className="mt-4 divide-y divide-border/60">
        {q.isLoading && <p className="py-4 text-sm text-muted-foreground">Loading…</p>}
        {q.data?.inquiries?.length === 0 && <p className="py-4 text-sm text-muted-foreground">No inquiries yet.</p>}
        {q.data?.inquiries?.map((i: any) => (
          <div key={i.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto]">
            <div className="min-w-0">
              <p className="font-medium">{i.name} <span className="text-xs text-muted-foreground">· {i.email}</span></p>
              <p className="text-xs text-muted-foreground">{i.company ?? "—"}{i.service_type ? ` · ${i.service_type}` : ""}</p>
              <p className="mt-1 text-sm text-muted-foreground">{i.message}</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="secondary">{i.status}</Badge>
              <span className="text-xs text-muted-foreground">{new Date(i.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResearchTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListResearch);
  const createFn = useServerFn(adminCreateResearch);
  const deleteFn = useServerFn(adminDeleteResearch);

  const postsQ = useQuery({ queryKey: ["admin", "research"], queryFn: () => listFn() });

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [author, setAuthor] = useState("VIROXEN Research");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const delMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "research"] }),
    onError: (err: any) => alert(`Delete failed: ${err?.message ?? "unknown"}`),
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setMsg({ kind: "err", text: "Please select a PDF file." });
      return;
    }
    if (file.type && file.type !== "application/pdf") {
      setMsg({ kind: "err", text: "Only PDF files are allowed." });
      return;
    }
    if (!title.trim()) {
      setMsg({ kind: "err", text: "Title is required." });
      return;
    }
    setBusy(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
      const path = `${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage
        .from("research-pdfs")
        .upload(path, file, { contentType: "application/pdf", upsert: false });
      if (upErr) throw upErr;

      const tagArr = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 20);

      await createFn({
        data: {
          title: title.trim(),
          excerpt: excerpt.trim(),
          body: body.trim(),
          tags: tagArr,
          pdf_url: path,
          author_name: author.trim() || "VIROXEN Research",
        },
      });

      setTitle(""); setExcerpt(""); setBody(""); setTags("");
      if (fileRef.current) fileRef.current.value = "";
      setMsg({ kind: "ok", text: "Research post published." });
      qc.invalidateQueries({ queryKey: ["admin", "research"] });
    } catch (err: any) {
      setMsg({ kind: "err", text: err?.message ?? "Failed to publish." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="text-lg font-semibold">Add research post</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a PDF and enter the title. It will appear on the Research page immediately.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="r-title">Title</Label>
            <Input id="r-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="r-excerpt">Short summary (optional)</Label>
            <Textarea id="r-excerpt" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="r-body">Article body (optional)</Label>
            <Textarea id="r-body" rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="r-tags">Tags (comma separated)</Label>
            <Input id="r-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="pentest, web, cve-2024" />
          </div>
          <div>
            <Label htmlFor="r-author">Author name</Label>
            <Input id="r-author" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="r-pdf">PDF file</Label>
            <Input id="r-pdf" type="file" accept="application/pdf" ref={fileRef} required />
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? "Publishing…" : "Publish research"}
          </Button>
          {msg && <p className={`text-sm ${msg.kind === "ok" ? "text-green-500" : "text-red-500"}`}>{msg.text}</p>}
        </form>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="text-lg font-semibold">Published research</h2>
        <div className="mt-4 divide-y divide-border/60">
          {postsQ.isLoading && <p className="py-4 text-sm text-muted-foreground">Loading…</p>}
          {postsQ.data?.posts?.length === 0 && <p className="py-4 text-sm text-muted-foreground">No research posts yet.</p>}
          {postsQ.data?.posts?.map((p: any) => (
            <div key={p.id} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {p.author_name} · {new Date(p.published_at ?? p.created_at).toLocaleString()}
                </p>
                {p.excerpt && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>}
                {p.tags?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.tags.map((t: string) => (
                      <Badge key={t} variant="secondary" className="text-[10px] uppercase tracking-wider">{t}</Badge>
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                className="text-xs text-red-500 hover:underline disabled:opacity-50"
                disabled={delMut.isPending}
                onClick={() => { if (confirm("Delete this research post and its PDF?")) delMut.mutate(p.id); }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListProducts);
  const createFn = useServerFn(adminCreateProduct);
  const updateFn = useServerFn(adminUpdateProduct);
  const deleteFn = useServerFn(adminDeleteProduct);

  const productsQ = useQuery({ queryKey: ["admin", "products"], queryFn: () => listFn() });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "products"] });

  const emptyForm = {
    id: "" as string | "",
    name: "",
    tagline: "",
    featuresText: "",
    status: "available" as "available" | "coming-soon",
    is_paid: false,
    usage_instructions: "",
    external_link: "",
    github_link: "",
    sort_order: 0,
    is_active: true,
  };
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const editing = form.id !== "";

  function resetForm() { setForm(emptyForm); }

  function loadForEdit(p: any) {
    setForm({
      id: p.id,
      name: p.name ?? "",
      tagline: p.tagline ?? "",
      featuresText: (p.features ?? []).join("\n"),
      status: p.status === "coming-soon" ? "coming-soon" : "available",
      is_paid: !!p.is_paid,
      usage_instructions: p.usage_instructions ?? "",
      external_link: p.external_link ?? "",
      github_link: p.github_link ?? "",
      sort_order: p.sort_order ?? 0,
      is_active: p.is_active ?? true,
    });
    setMsg(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const delMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: invalidate,
    onError: (err: any) => alert(`Delete failed: ${err?.message ?? "unknown"}`),
  });

  const toggleMut = useMutation({
    mutationFn: (v: { id: string; is_active: boolean }) => updateFn({ data: v }),
    onSuccess: invalidate,
    onError: (err: any) => alert(`Update failed: ${err?.message ?? "unknown"}`),
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.name.trim() || !form.tagline.trim()) {
      return setMsg({ kind: "err", text: "Name and tagline are required." });
    }
    const features = form.featuresText
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 30);
    const payload = {
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      features,
      status: form.status,
      is_paid: form.is_paid,
      usage_instructions: form.usage_instructions.trim() || null,
      external_link: form.external_link.trim() || null,
      github_link: form.github_link.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };
    setBusy(true);
    try {
      if (editing) {
        await updateFn({ data: { id: form.id, ...payload } });
        setMsg({ kind: "ok", text: "Product updated." });
      } else {
        await createFn({ data: payload });
        setMsg({ kind: "ok", text: "Product added." });
      }
      resetForm();
      invalidate();
    } catch (err: any) {
      setMsg({ kind: "err", text: err?.message ?? "Failed to save." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="text-lg font-semibold">{editing ? "Edit product" : "Add product"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Appears on the public Products page.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="p-name">Name</Label>
            <Input id="p-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="p-tag">Tagline</Label>
            <Input id="p-tag" required value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Short description" />
          </div>
          <div>
            <Label htmlFor="p-feat">Features (one per line)</Label>
            <Textarea id="p-feat" rows={5} value={form.featuresText} onChange={(e) => setForm({ ...form, featuresText: e.target.value })} placeholder={"HTTP header analysis\nTLS validation\nCVE lookups"} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="coming-soon">Coming Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="p-sort">Sort order</Label>
              <Input id="p-sort" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_paid} onChange={(e) => setForm({ ...form, is_paid: e.target.checked })} />
            Paid product
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Active (visible on Products page)
          </label>
          <div>
            <Label htmlFor="p-usage">Usage instructions (optional)</Label>
            <Textarea id="p-usage" rows={3} value={form.usage_instructions} onChange={(e) => setForm({ ...form, usage_instructions: e.target.value })} placeholder="npx viroxen-scan https://example.com" />
          </div>
          <div>
            <Label htmlFor="p-ext">External link (optional)</Label>
            <Input id="p-ext" type="url" value={form.external_link} onChange={(e) => setForm({ ...form, external_link: e.target.value })} placeholder="https://tool.viroxen.dev" />
          </div>
          <div>
            <Label htmlFor="p-gh">GitHub link (optional)</Label>
            <Input id="p-gh" type="url" value={form.github_link} onChange={(e) => setForm({ ...form, github_link: e.target.value })} placeholder="https://github.com/viroxen/tool" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Add product"}</Button>
            {editing && (
              <Button type="button" variant="outline" onClick={() => { resetForm(); setMsg(null); }}>Cancel</Button>
            )}
          </div>
          {msg && <p className={`text-sm ${msg.kind === "ok" ? "text-green-500" : "text-red-500"}`}>{msg.text}</p>}
        </form>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="text-lg font-semibold">Products</h2>
        <div className="mt-4 divide-y divide-border/60">
          {productsQ.isLoading && <p className="py-4 text-sm text-muted-foreground">Loading…</p>}
          {productsQ.data?.products?.length === 0 && <p className="py-4 text-sm text-muted-foreground">No products yet.</p>}
          {productsQ.data?.products?.map((p: any) => (
            <div key={p.id} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="font-medium">
                  {p.name}
                  {!p.is_active && <Badge variant="outline" className="ml-2 text-[10px]">inactive</Badge>}
                  {p.status === "coming-soon" && <Badge variant="outline" className="ml-2 text-[10px]">coming soon</Badge>}
                  <Badge variant={p.is_paid ? "default" : "secondary"} className="ml-2 text-[10px] uppercase tracking-wider">
                    {p.is_paid ? "Paid" : "Free"}
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">{p.tagline}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">sort: {p.sort_order} · {p.features?.length ?? 0} features</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button type="button" className="text-xs text-primary hover:underline" onClick={() => loadForEdit(p)}>Edit</button>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:underline disabled:opacity-50"
                  disabled={toggleMut.isPending}
                  onClick={() => toggleMut.mutate({ id: p.id, is_active: !p.is_active })}
                >
                  {p.is_active ? "Hide" : "Activate"}
                </button>
                <button
                  type="button"
                  className="text-xs text-red-500 hover:underline disabled:opacity-50"
                  disabled={delMut.isPending}
                  onClick={() => { if (confirm(`Delete ${p.name}?`)) delMut.mutate(p.id); }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
