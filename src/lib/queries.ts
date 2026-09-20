import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const plansQuery = queryOptions({
  queryKey: ["audit_plans"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("audit_plans")
      .select("*")
      .eq("active", true)
      .order("display_order");
    if (error) throw error;
    return data;
  },
  staleTime: 60_000,
});

export const addonsQuery = queryOptions({
  queryKey: ["addon_services"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("addon_services")
      .select("*")
      .eq("active", true)
      .order("display_order");
    if (error) throw error;
    return data;
  },
  staleTime: 60_000,
});

export const toolsQuery = queryOptions({
  queryKey: ["tools"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("tools")
      .select("*")
      .eq("active", true)
      .order("display_order");
    if (error) throw error;
    return data;
  },
  staleTime: 60_000,
});

export const publishedPostsQuery = queryOptions({
  queryKey: ["research_posts", "published"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("research_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  staleTime: 60_000,
});

export const postBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["research_posts", "slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
