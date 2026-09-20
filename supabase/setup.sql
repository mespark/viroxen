-- Full schema for a FRESH (empty) Supabase project. Run once in the SQL Editor.
-- Before running: Find and Replace  admin@example.com  ->  your real admin email.
-- Order: latest full schema snapshot, incremental changes, OTP/notification tables, grants.
-- Then create Storage buckets: research-pdfs (private) and client-logos (public).

-- ===== 20260721062650_949c674b-28c5-4dcd-b71e-77bf4a17a735.sql =====
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'staff_lead', 'staff', 'user');
CREATE TYPE public.staff_role AS ENUM ('web_developer', 'researcher', 'designer');
CREATE TYPE public.post_status AS ENUM ('draft', 'pending_review', 'published', 'rejected');
CREATE TYPE public.inquiry_status AS ENUM ('new', 'contacted', 'in_progress', 'closed');
CREATE TYPE public.task_status AS ENUM ('not_started', 'in_progress', 'done');

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT, name TEXT, avatar_url TEXT,
  theme_preference TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user'::app_role) ON CONFLICT DO NOTHING;
  IF NEW.email_confirmed_at IS NOT NULL AND lower(NEW.email) = 'admin@example.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin'::app_role) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at) THEN
    IF lower(NEW.email) = 'admin@example.com' THEN
      INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin'::app_role) ON CONFLICT DO NOTHING;
    END IF;
    UPDATE public.staff SET user_id = NEW.id WHERE user_id IS NULL AND lower(email) = lower(NEW.email);
    IF EXISTS (SELECT 1 FROM public.staff WHERE user_id = NEW.id) THEN
      INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'staff'::app_role) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE TRIGGER on_auth_user_email_confirmed AFTER UPDATE OF email_confirmed_at ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_confirmed();

-- AUDIT PLANS
CREATE TABLE public.audit_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, price TEXT NOT NULL,
  price_note TEXT, audience TEXT NOT NULL, delivery TEXT NOT NULL,
  popular BOOLEAN NOT NULL DEFAULT false,
  includes TEXT[] NOT NULL DEFAULT '{}', not_included TEXT[] NOT NULL DEFAULT '{}',
  cta TEXT NOT NULL DEFAULT 'Book', display_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_plans TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.audit_plans TO authenticated;
GRANT ALL ON public.audit_plans TO service_role;
ALTER TABLE public.audit_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans public read" ON public.audit_plans FOR SELECT USING (active = true);
CREATE POLICY "Admins manage plans" ON public.audit_plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER audit_plans_updated_at BEFORE UPDATE ON public.audit_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.addon_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, price TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0, active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.addon_services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.addon_services TO authenticated;
GRANT ALL ON public.addon_services TO service_role;
ALTER TABLE public.addon_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Addons public read" ON public.addon_services FOR SELECT USING (active = true);
CREATE POLICY "Admins manage addons" ON public.addon_services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, tagline TEXT NOT NULL,
  description TEXT, is_paid BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'available',
  external_link TEXT, github_link TEXT,
  features TEXT[] NOT NULL DEFAULT '{}', usage TEXT, icon TEXT,
  display_order INT NOT NULL DEFAULT 0, active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tools TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tools TO authenticated;
GRANT ALL ON public.tools TO service_role;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tools public read" ON public.tools FOR SELECT USING (active = true);
CREATE POLICY "Admins manage tools" ON public.tools FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER tools_updated_at BEFORE UPDATE ON public.tools FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RESEARCH POSTS (staff.role kept as TEXT here instead of enum — the user wants free-form roles)
CREATE TABLE public.research_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL,
  excerpt TEXT, body TEXT NOT NULL, cover_image TEXT, pdf_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'VIROXEN Research',
  status post_status NOT NULL DEFAULT 'draft',
  reviewer_note TEXT, published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.research_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.research_posts TO authenticated;
GRANT ALL ON public.research_posts TO service_role;
ALTER TABLE public.research_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts public read" ON public.research_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Authors read own posts" ON public.research_posts FOR SELECT TO authenticated USING (author_id = auth.uid());
CREATE POLICY "Admins read all posts" ON public.research_posts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authors write own posts" ON public.research_posts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authors update own posts" ON public.research_posts FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "Admins manage posts" ON public.research_posts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER research_posts_updated_at BEFORE UPDATE ON public.research_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, company TEXT,
  service_type TEXT, message TEXT NOT NULL,
  status inquiry_status NOT NULL DEFAULT 'new', admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.inquiries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit inquiries" ON public.inquiries FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Users read own inquiries" ON public.inquiries FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins read all inquiries" ON public.inquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update inquiries" ON public.inquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER inquiries_updated_at BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES public.audit_plans(id) ON DELETE SET NULL,
  plan_slug TEXT, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, company TEXT,
  preferred_date DATE, message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit bookings" ON public.bookings FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Users read own bookings" ON public.bookings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins read all bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- STAFF (role as free-form TEXT to satisfy new admin flow)
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL, bio TEXT,
  active BOOLEAN NOT NULL DEFAULT true, last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.staff TO authenticated;
GRANT ALL ON public.staff TO service_role;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read own record" ON public.staff FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage staff" ON public.staff FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.grant_staff_role_on_staff_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.user_id, 'staff'::app_role) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_staff_insert_grant_role AFTER INSERT ON public.staff FOR EACH ROW EXECUTE FUNCTION public.grant_staff_role_on_staff_insert();
CREATE TRIGGER on_staff_update_grant_role AFTER UPDATE OF user_id ON public.staff
  FOR EACH ROW WHEN (NEW.user_id IS NOT NULL AND (OLD.user_id IS NULL OR OLD.user_id IS DISTINCT FROM NEW.user_id))
  EXECUTE FUNCTION public.grant_staff_role_on_staff_insert();

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL, description TEXT, due_date DATE,
  status task_status NOT NULL DEFAULT 'not_started',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read own tasks" ON public.tasks FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.staff s WHERE s.id = tasks.staff_id AND s.user_id = auth.uid()));
CREATE POLICY "Staff update own tasks" ON public.tasks FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.staff s WHERE s.id = tasks.staff_id AND s.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.staff s WHERE s.id = tasks.staff_id AND s.user_id = auth.uid()));
CREATE POLICY "Admins manage tasks" ON public.tasks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL, ip TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.login_attempts TO service_role;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
CREATE INDEX login_attempts_email_time_idx ON public.login_attempts (email, attempted_at DESC);

CREATE TABLE public.signup_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL, otp_hash TEXT NOT NULL, password_hash TEXT NOT NULL,
  full_name TEXT, expires_at TIMESTAMPTZ NOT NULL,
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.signup_otps TO service_role;
ALTER TABLE public.signup_otps ENABLE ROW LEVEL SECURITY;
CREATE INDEX signup_otps_email_idx ON public.signup_otps (email, created_at DESC);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL, title TEXT NOT NULL, body TEXT, link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Storage policies for research-pdfs (bucket created separately with storage_create_bucket)
CREATE POLICY "Public read research-pdfs" ON storage.objects FOR SELECT USING (bucket_id = 'research-pdfs');
CREATE POLICY "Admins insert research-pdfs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'research-pdfs' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins update research-pdfs" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'research-pdfs' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (bucket_id = 'research-pdfs' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins delete research-pdfs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'research-pdfs' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_user_email_confirmed() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.grant_staff_role_on_staff_insert() FROM PUBLIC, anon, authenticated;

-- ===== 20260721062731_695fd16f-48e3-45a2-9718-4c44074fb9b6.sql =====
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS plan_name TEXT,
  ADD COLUMN IF NOT EXISTS targets TEXT,
  ADD COLUMN IF NOT EXISTS scope_summary TEXT,
  ADD COLUMN IF NOT EXISTS timeline TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- ===== 20260723052851_b7953c42-edc8-45d6-b9a6-03568a0c251c.sql =====

CREATE TABLE public.audited_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  audit_type TEXT NOT NULL,
  audit_date DATE NOT NULL,
  testimonial TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.audited_clients TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audited_clients TO authenticated;
GRANT ALL ON public.audited_clients TO service_role;

ALTER TABLE public.audited_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view audited clients"
  ON public.audited_clients FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert audited clients"
  ON public.audited_clients FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update audited clients"
  ON public.audited_clients FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete audited clients"
  ON public.audited_clients FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER audited_clients_set_updated_at
  BEFORE UPDATE ON public.audited_clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX audited_clients_audit_date_idx ON public.audited_clients (audit_date DESC);


-- ===== 20260723052924_c95b58f9-9adc-418b-adfb-24988c316e19.sql =====

CREATE POLICY "Public read client logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'client-logos');

CREATE POLICY "Admins upload client logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'client-logos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update client logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'client-logos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete client logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'client-logos' AND public.has_role(auth.uid(), 'admin'));


-- ===== 20260723154334_ad6a0f92-49dc-4c6a-a127-9fc007db61c4.sql =====
CREATE TABLE public.homepage_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  link_url text NOT NULL,
  icon_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.homepage_tools TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homepage_tools TO authenticated;
GRANT ALL ON public.homepage_tools TO service_role;

ALTER TABLE public.homepage_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active tools"
  ON public.homepage_tools FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert tools"
  ON public.homepage_tools FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tools"
  ON public.homepage_tools FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tools"
  ON public.homepage_tools FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER homepage_tools_set_updated_at
  BEFORE UPDATE ON public.homepage_tools
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== 20260724071307_fe137b46-12b4-473c-9aa1-f430a3577ed3.sql =====
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available',
  is_paid BOOLEAN NOT NULL DEFAULT false,
  usage_instructions TEXT,
  external_link TEXT,
  github_link TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all products"
  ON public.products FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== reset_otps_and_notifications.sql =====
-- Run this SQL in your Supabase SQL editor.
-- Adds tables for OTP-based password reset and in-app notifications.

-- Password reset OTPs
CREATE TABLE IF NOT EXISTS public.reset_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  reset_token_hash TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  consumed_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.reset_otps TO service_role;
ALTER TABLE public.reset_otps ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS reset_otps_email_idx ON public.reset_otps (email, created_at DESC);

-- In-app notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications (user_id, created_at DESC);

DO $$ BEGIN
  CREATE POLICY "Users read own notifications" ON public.notifications
    FOR SELECT TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users mark own notifications" ON public.notifications
    FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ===== fix_has_role_grant.sql =====
-- Fix: RLS policies on tasks/bookings/inquiries/staff call public.has_role(...)
-- but EXECUTE on that function was never granted to the API roles.
-- Symptom in the browser: 403 "permission denied for function has_role".
--
-- Run this ONCE in your Supabase SQL editor.

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

-- Sanity check (optional):
-- SELECT has_function_privilege('authenticated', 'public.has_role(uuid, public.app_role)', 'EXECUTE');
