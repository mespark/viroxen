import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Get the current user's highest role
export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) return { role: "user" as const, roles: [] as string[] };
    const roles = (data ?? []).map((r) => r.role as string);
    const role = roles.includes("admin")
      ? "admin"
      : roles.includes("staff") || roles.includes("staff_lead")
      ? "staff"
      : "user";
    return { role, roles };
  });

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
}

// Admin: add staff member by email (case A: existing user, case B: invite new user)
export const adminAddStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        email: z.string().email(),
        name: z.string().min(1).max(200),
        title: z.string().trim().min(1, "Role is required").max(100),
        bio: z.string().max(2000).optional().default(""),
      })
      .parse(d),
  )

  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase().trim();

    // Look up existing auth user by email
    let existingUserId: string | null = null;
    {
      const { data: page, error } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      if (error) throw new Error(error.message);
      const found = page.users.find((u) => (u.email ?? "").toLowerCase() === email);
      if (found) existingUserId = found.id;
    }

    // Case A — existing account
    if (existingUserId) {
      // Ensure profile row exists
      await supabaseAdmin
        .from("profiles")
        .upsert({ id: existingUserId, email, name: data.name }, { onConflict: "id" });

      // Grant staff role
      await supabaseAdmin
        .from("user_roles")
        .upsert(
          { user_id: existingUserId, role: "staff" as const },
          { onConflict: "user_id,role" },
        );

      // Create staff row (or update existing)
      const { data: existingStaff } = await supabaseAdmin
        .from("staff")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (existingStaff) {
        await supabaseAdmin
          .from("staff")
          .update({
            user_id: existingUserId,
            name: data.name,
            role: data.title,
            bio: data.bio ?? "",
            active: true,
          })
          .eq("id", existingStaff.id);
      } else {
        await supabaseAdmin.from("staff").insert({
          user_id: existingUserId,
          email,
          name: data.name,
          role: data.title,
          bio: data.bio ?? "",
          active: true,
        });
      }
      return { ok: true, case: "existing" as const, message: "Existing user promoted to staff." };
    }

    // Case B — invite new user
    const siteUrl = process.env.SITE_URL || process.env.SUPABASE_URL || "";
    const redirectTo = siteUrl ? `${siteUrl.replace(/\/$/, "")}/auth` : undefined;

    const { data: invited, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      { data: { full_name: data.name }, redirectTo },
    );
    if (inviteErr || !invited?.user) {
      throw new Error(inviteErr?.message ?? "Failed to send invite");
    }
    const newUserId = invited.user.id;

    await supabaseAdmin
      .from("profiles")
      .upsert({ id: newUserId, email, name: data.name }, { onConflict: "id" });

    await supabaseAdmin
      .from("user_roles")
      .upsert(
        { user_id: newUserId, role: "staff" as const },
        { onConflict: "user_id,role" },
      );

    await supabaseAdmin.from("staff").insert({
      user_id: newUserId,
      email,
      name: data.name,
      role: data.title,
      bio: data.bio ?? "",
      active: true,
    });

    return { ok: true, case: "invited" as const, message: `Invite sent to ${email}.` };
  });

// Admin: list staff
export const adminListStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("staff")
      .select("id,email,name,role,active,user_id,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { staff: data ?? [] };
  });

// Admin: list all tasks with staff info
export const adminListTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("tasks")
      .select("id,title,description,status,due_date,created_at,staff_id,staff:staff_id(name,email,role)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { tasks: data ?? [] };
  });

// Admin: create a task assigned to a staff member
export const adminCreateTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      staff_id: z.string().uuid(),
      title: z.string().min(1).max(200),
      description: z.string().max(4000).optional().default(""),
      due_date: z.string().optional().nullable(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: task, error } = await supabaseAdmin
      .from("tasks")
      .insert({
        staff_id: data.staff_id,
        title: data.title,
        description: data.description || null,
        due_date: data.due_date || null,
        created_by: context.userId,
      })
      .select("id,staff_id")
      .single();
    if (error) throw new Error(error.message);

    // Notify the assigned staff member (if linked to a user account)
    const { data: staff } = await supabaseAdmin
      .from("staff").select("user_id,name").eq("id", data.staff_id).maybeSingle();
    if (staff?.user_id) {
      await (supabaseAdmin.from("notifications" as any) as any).insert({
        user_id: staff.user_id,
        kind: "task_assigned",
        title: "New task assigned",
        body: data.title,
        link: "/staff",
      });
    }
    return { ok: true, task };
  });

// Admin: delete a task
export const adminDeleteTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("tasks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Admin: list bookings and inquiries
export const adminListBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { bookings: data ?? [] };
  });

export const adminListInquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { inquiries: data ?? [] };
  });

// Staff: update task status on one of their own tasks
export const staffUpdateTaskStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["not_started", "in_progress", "done"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    // RLS on tasks already scopes to the caller's own staff row
    const { error } = await context.supabase
      .from("tasks")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Notifications (current user)
export const listMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await (context.supabase.from("notifications" as any) as any)
      .select("id,kind,title,body,link,read_at,created_at")
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) return { notifications: [] as any[] };
    return { notifications: (data ?? []) as any[] };
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await (context.supabase.from("notifications" as any) as any)
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null)
      .eq("user_id", context.userId);
    return { ok: true };
  });

// ============= RESEARCH POSTS (admin CRUD) =============

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "post";
}

export const adminListResearch = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("research_posts")
      .select("id,slug,title,excerpt,tags,pdf_url,status,published_at,created_at,author_name")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { posts: data ?? [] };
  });

export const adminCreateResearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        title: z.string().trim().min(1).max(200),
        excerpt: z.string().trim().max(500).optional().default(""),
        body: z.string().trim().max(20000).optional().default(""),
        tags: z.array(z.string().trim().min(1).max(40)).max(20).optional().default([]),
        pdf_url: z.string().trim().min(1).max(1000),
        author_name: z.string().trim().max(120).optional().default("VIROXEN Research"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Build a unique slug
    const base = slugify(data.title);
    let slug = base;
    for (let i = 2; i < 50; i++) {
      const { data: existing } = await supabaseAdmin
        .from("research_posts")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!existing) break;
      slug = `${base}-${i}`;
    }

    const { data: post, error } = await supabaseAdmin
      .from("research_posts")
      .insert({
        slug,
        title: data.title,
        excerpt: data.excerpt || null,
        body: data.body || data.excerpt || data.title,
        tags: data.tags ?? [],
        pdf_url: data.pdf_url,
        author_id: context.userId,
        author_name: data.author_name || "VIROXEN Research",
        status: "published",
        published_at: new Date().toISOString(),
      })
      .select("id,slug")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, post };
  });

export const adminDeleteResearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Best-effort: remove the associated PDF from storage if it's a bucket path
    const { data: post } = await supabaseAdmin
      .from("research_posts")
      .select("pdf_url")
      .eq("id", data.id)
      .maybeSingle();
    const pdf = post?.pdf_url ?? null;
    if (pdf && !/^https?:\/\//i.test(pdf)) {
      const path = pdf.replace(/^research-pdfs\//, "");
      await supabaseAdmin.storage.from("research-pdfs").remove([path]);
    }

    const { error } = await supabaseAdmin.from("research_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============= AUDITED CLIENTS =============

const SIGNED_URL_TTL = 60 * 60 * 24 * 365; // 1 year

async function withSignedLogos(rows: any[]) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return await Promise.all(
    rows.map(async (r) => {
      let url = r.logo_url as string;
      if (url && !/^https?:\/\//i.test(url)) {
        const path = url.replace(/^client-logos\//, "");
        const { data } = await supabaseAdmin.storage
          .from("client-logos")
          .createSignedUrl(path, SIGNED_URL_TTL);
        url = data?.signedUrl ?? "";
      }
      return { ...r, logo_url: url };
    }),
  );
}

// Public: list clients for the home page. No auth required.
export const listAuditedClients = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("audited_clients" as any)
    .select("id,name,logo_url,website_url,audit_type,audit_date,testimonial,sort_order")
    .order("sort_order", { ascending: true })
    .order("audit_date", { ascending: false })
    .limit(60);
  if (error) throw new Error(error.message);
  return { clients: await withSignedLogos((data as any[]) ?? []) };
});

export const adminListAuditedClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("audited_clients" as any)
      .select("id,name,logo_url,website_url,audit_type,audit_date,testimonial,sort_order,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { clients: await withSignedLogos((data as any[]) ?? []) };
  });

export const adminCreateAuditedClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        name: z.string().trim().min(1).max(120),
        logo_url: z.string().trim().min(1).max(1000),
        website_url: z.string().trim().max(500).optional().nullable(),
        audit_type: z.string().trim().min(1).max(120),
        audit_date: z.string().trim().min(1),
        testimonial: z.string().trim().max(600).optional().nullable(),
        sort_order: z.number().int().optional().default(0),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("audited_clients" as any)
      .insert({
        name: data.name,
        logo_url: data.logo_url,
        website_url: data.website_url || null,
        audit_type: data.audit_type,
        audit_date: data.audit_date,
        testimonial: data.testimonial || null,
        sort_order: data.sort_order ?? 0,
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, client: row };
  });

export const adminDeleteAuditedClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("audited_clients" as any)
      .select("logo_url")
      .eq("id", data.id)
      .maybeSingle();
    const logo = (row as any)?.logo_url ?? null;
    if (logo && !/^https?:\/\//i.test(logo)) {
      const path = logo.replace(/^client-logos\//, "");
      await supabaseAdmin.storage.from("client-logos").remove([path]);
    }
    const { error } = await supabaseAdmin
      .from("audited_clients" as any)
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============= HOMEPAGE TOOLS =============

export const listTools = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("homepage_tools" as any)
    .select("id,name,description,link_url,icon_url,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { tools: (data as any[]) ?? [] };
});

export const adminListTools = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("homepage_tools" as any)
      .select("id,name,description,link_url,icon_url,sort_order,is_active,created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { tools: (data as any[]) ?? [] };
  });

export const adminCreateTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        name: z.string().trim().min(1).max(120),
        description: z.string().trim().min(1).max(600),
        link_url: z.string().trim().url().max(1000),
        icon_url: z.string().trim().max(1000).optional().nullable(),
        sort_order: z.number().int().optional().default(0),
        is_active: z.boolean().optional().default(true),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("homepage_tools" as any)
      .insert({
        name: data.name,
        description: data.description,
        link_url: data.link_url,
        icon_url: data.icon_url || null,
        sort_order: data.sort_order ?? 0,
        is_active: data.is_active ?? true,
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, tool: row };
  });

export const adminUpdateTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().trim().min(1).max(120).optional(),
        description: z.string().trim().min(1).max(600).optional(),
        link_url: z.string().trim().url().max(1000).optional(),
        icon_url: z.string().trim().max(1000).optional().nullable(),
        sort_order: z.number().int().optional(),
        is_active: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin
      .from("homepage_tools" as any)
      .update(patch)
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("homepage_tools" as any)
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============= PRODUCTS (Products page, admin CRUD) =============

const productSelect =
  "id,name,tagline,features,status,is_paid,usage_instructions,external_link,github_link,sort_order,is_active,created_at";

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("products" as any)
    .select(productSelect)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { products: (data as any[]) ?? [] };
});

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("products" as any)
      .select(productSelect)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { products: (data as any[]) ?? [] };
  });

const productInputBase = {
  name: z.string().trim().min(1).max(200),
  tagline: z.string().trim().min(1).max(500),
  features: z.array(z.string().trim().min(1).max(200)).max(30).optional().default([]),
  status: z.enum(["available", "coming-soon"]).optional().default("available"),
  is_paid: z.boolean().optional().default(false),
  usage_instructions: z.string().trim().max(4000).optional().nullable(),
  external_link: z.string().trim().max(1000).optional().nullable(),
  github_link: z.string().trim().max(1000).optional().nullable(),
  sort_order: z.number().int().optional().default(0),
  is_active: z.boolean().optional().default(true),
};

export const adminCreateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object(productInputBase).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("products" as any)
      .insert({
        name: data.name,
        tagline: data.tagline,
        features: data.features ?? [],
        status: data.status ?? "available",
        is_paid: data.is_paid ?? false,
        usage_instructions: data.usage_instructions || null,
        external_link: data.external_link || null,
        github_link: data.github_link || null,
        sort_order: data.sort_order ?? 0,
        is_active: data.is_active ?? true,
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, product: row };
  });

export const adminUpdateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().trim().min(1).max(200).optional(),
        tagline: z.string().trim().min(1).max(500).optional(),
        features: z.array(z.string().trim().min(1).max(200)).max(30).optional(),
        status: z.enum(["available", "coming-soon"]).optional(),
        is_paid: z.boolean().optional(),
        usage_instructions: z.string().trim().max(4000).optional().nullable(),
        external_link: z.string().trim().max(1000).optional().nullable(),
        github_link: z.string().trim().max(1000).optional().nullable(),
        sort_order: z.number().int().optional(),
        is_active: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin
      .from("products" as any)
      .update(patch)
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("products" as any)
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

