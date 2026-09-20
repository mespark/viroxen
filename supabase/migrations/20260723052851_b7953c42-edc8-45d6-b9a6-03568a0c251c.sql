
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
