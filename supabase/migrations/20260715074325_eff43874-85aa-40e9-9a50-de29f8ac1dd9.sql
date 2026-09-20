
-- Public read access on research-pdfs bucket
CREATE POLICY "Public read research-pdfs" ON storage.objects
  FOR SELECT USING (bucket_id = 'research-pdfs');

CREATE POLICY "Service role manage research-pdfs" ON storage.objects
  FOR ALL TO service_role USING (bucket_id = 'research-pdfs') WITH CHECK (bucket_id = 'research-pdfs');

-- Tighten has_role: only service_role can execute directly; RLS uses SECURITY DEFINER internally.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;
