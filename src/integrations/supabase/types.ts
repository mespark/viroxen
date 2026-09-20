export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addon_services: {
        Row: {
          active: boolean
          created_at: string
          display_order: number
          id: string
          name: string
          price: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          name: string
          price: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          name?: string
          price?: string
        }
        Relationships: []
      }
      audit_plans: {
        Row: {
          active: boolean
          audience: string
          created_at: string
          cta: string
          delivery: string
          display_order: number
          id: string
          includes: string[]
          name: string
          not_included: string[]
          popular: boolean
          price: string
          price_note: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          audience: string
          created_at?: string
          cta?: string
          delivery: string
          display_order?: number
          id?: string
          includes?: string[]
          name: string
          not_included?: string[]
          popular?: boolean
          price: string
          price_note?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          audience?: string
          created_at?: string
          cta?: string
          delivery?: string
          display_order?: number
          id?: string
          includes?: string[]
          name?: string
          not_included?: string[]
          popular?: boolean
          price?: string
          price_note?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      audited_clients: {
        Row: {
          audit_date: string
          audit_type: string
          created_at: string
          created_by: string | null
          id: string
          logo_url: string
          name: string
          sort_order: number
          testimonial: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          audit_date: string
          audit_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url: string
          name: string
          sort_order?: number
          testimonial?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          audit_date?: string
          audit_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string
          name?: string
          sort_order?: number
          testimonial?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          notes: string | null
          phone: string | null
          plan_id: string | null
          plan_name: string | null
          plan_slug: string | null
          preferred_date: string | null
          scope_summary: string | null
          status: string
          targets: string | null
          timeline: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          plan_id?: string | null
          plan_name?: string | null
          plan_slug?: string | null
          preferred_date?: string | null
          scope_summary?: string | null
          status?: string
          targets?: string | null
          timeline?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          plan_id?: string | null
          plan_name?: string | null
          plan_slug?: string | null
          preferred_date?: string | null
          scope_summary?: string | null
          status?: string
          targets?: string | null
          timeline?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "audit_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_tools: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          icon_url: string | null
          id: string
          is_active: boolean
          link_url: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          icon_url?: string | null
          id?: string
          is_active?: boolean
          link_url: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          icon_url?: string | null
          id?: string
          is_active?: boolean
          link_url?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          admin_notes: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          service_type: string | null
          status: Database["public"]["Enums"]["inquiry_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          service_type?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          service_type?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempted_at: string
          email: string
          id: string
          ip: string | null
          success: boolean
        }
        Insert: {
          attempted_at?: string
          email: string
          id?: string
          ip?: string | null
          success?: boolean
        }
        Update: {
          attempted_at?: string
          email?: string
          id?: string
          ip?: string | null
          success?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          created_by: string | null
          external_link: string | null
          features: string[]
          github_link: string | null
          id: string
          is_active: boolean
          is_paid: boolean
          name: string
          sort_order: number
          status: string
          tagline: string
          updated_at: string
          usage_instructions: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          external_link?: string | null
          features?: string[]
          github_link?: string | null
          id?: string
          is_active?: boolean
          is_paid?: boolean
          name: string
          sort_order?: number
          status?: string
          tagline: string
          updated_at?: string
          usage_instructions?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          external_link?: string | null
          features?: string[]
          github_link?: string | null
          id?: string
          is_active?: boolean
          is_paid?: boolean
          name?: string
          sort_order?: number
          status?: string
          tagline?: string
          updated_at?: string
          usage_instructions?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          theme_preference: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          theme_preference?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          theme_preference?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      research_posts: {
        Row: {
          author_id: string | null
          author_name: string
          body: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          pdf_url: string | null
          published_at: string | null
          reviewer_note: string | null
          slug: string
          status: Database["public"]["Enums"]["post_status"]
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string
          body: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          pdf_url?: string | null
          published_at?: string | null
          reviewer_note?: string | null
          slug: string
          status?: Database["public"]["Enums"]["post_status"]
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          author_name?: string
          body?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          pdf_url?: string | null
          published_at?: string | null
          reviewer_note?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["post_status"]
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      signup_otps: {
        Row: {
          consumed_at: string | null
          created_at: string
          email: string
          expires_at: string
          full_name: string | null
          id: string
          last_sent_at: string
          otp_hash: string
          password_hash: string
        }
        Insert: {
          consumed_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          full_name?: string | null
          id?: string
          last_sent_at?: string
          otp_hash: string
          password_hash: string
        }
        Update: {
          consumed_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          full_name?: string | null
          id?: string
          last_sent_at?: string
          otp_hash?: string
          password_hash?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          active: boolean
          bio: string | null
          created_at: string
          email: string
          id: string
          last_login: string | null
          name: string
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          bio?: string | null
          created_at?: string
          email: string
          id?: string
          last_login?: string | null
          name: string
          role: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          staff_id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          staff_id: string
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          staff_id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          display_order: number
          external_link: string | null
          features: string[]
          github_link: string | null
          icon: string | null
          id: string
          is_paid: boolean
          name: string
          slug: string
          status: string
          tagline: string
          updated_at: string
          usage: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          display_order?: number
          external_link?: string | null
          features?: string[]
          github_link?: string | null
          icon?: string | null
          id?: string
          is_paid?: boolean
          name: string
          slug: string
          status?: string
          tagline: string
          updated_at?: string
          usage?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          display_order?: number
          external_link?: string | null
          features?: string[]
          github_link?: string | null
          icon?: string | null
          id?: string
          is_paid?: boolean
          name?: string
          slug?: string
          status?: string
          tagline?: string
          updated_at?: string
          usage?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff_lead" | "staff" | "user"
      inquiry_status: "new" | "contacted" | "in_progress" | "closed"
      post_status: "draft" | "pending_review" | "published" | "rejected"
      staff_role: "web_developer" | "researcher" | "designer"
      task_status: "not_started" | "in_progress" | "done"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff_lead", "staff", "user"],
      inquiry_status: ["new", "contacted", "in_progress", "closed"],
      post_status: ["draft", "pending_review", "published", "rejected"],
      staff_role: ["web_developer", "researcher", "designer"],
      task_status: ["not_started", "in_progress", "done"],
    },
  },
} as const
