
-- 1) Fix admin seeding: admin@example.com is the sole admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user'::app_role) ON CONFLICT DO NOTHING;
  IF NEW.email_confirmed_at IS NOT NULL AND lower(NEW.email) = 'admin@example.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin'::app_role) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at) THEN
    IF lower(NEW.email) = 'admin@example.com' THEN
      INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin'::app_role) ON CONFLICT DO NOTHING;
    END IF;
    -- If a staff row was pre-created (invite flow), link it and grant staff role
    UPDATE public.staff SET user_id = NEW.id WHERE user_id IS NULL AND lower(email) = lower(NEW.email);
    IF EXISTS (SELECT 1 FROM public.staff WHERE user_id = NEW.id) THEN
      INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'staff'::app_role) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Ensure the auth triggers exist (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_confirmed();

-- 2) Backfill: enforce admin-only rule
DELETE FROM public.user_roles
 WHERE role = 'admin'::app_role
   AND user_id NOT IN (SELECT id FROM auth.users WHERE lower(email) = 'admin@example.com');

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE lower(email) = 'admin@example.com'
ON CONFLICT DO NOTHING;

-- 3) Trigger: when a staff row is inserted with a user_id, grant staff role
CREATE OR REPLACE FUNCTION public.grant_staff_role_on_staff_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.user_id, 'staff'::app_role) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_staff_insert_grant_role ON public.staff;
CREATE TRIGGER on_staff_insert_grant_role
  AFTER INSERT ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.grant_staff_role_on_staff_insert();

DROP TRIGGER IF EXISTS on_staff_update_grant_role ON public.staff;
CREATE TRIGGER on_staff_update_grant_role
  AFTER UPDATE OF user_id ON public.staff
  FOR EACH ROW
  WHEN (NEW.user_id IS NOT NULL AND (OLD.user_id IS NULL OR OLD.user_id IS DISTINCT FROM NEW.user_id))
  EXECUTE FUNCTION public.grant_staff_role_on_staff_insert();

-- 4) Allow staff to be pre-created without a user_id (invite flow)
ALTER TABLE public.staff ALTER COLUMN user_id DROP NOT NULL;
