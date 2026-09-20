-- Fix: RLS policies on tasks/bookings/inquiries/staff call public.has_role(...)
-- but EXECUTE on that function was never granted to the API roles.
-- Symptom in the browser: 403 "permission denied for function has_role".
--
-- Run this ONCE in your Supabase SQL editor.

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

-- Sanity check (optional):
-- SELECT has_function_privilege('authenticated', 'public.has_role(uuid, public.app_role)', 'EXECUTE');
