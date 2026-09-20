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