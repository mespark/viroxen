-- ============================================================================
-- VIROXEN — Section 1 + Section 4 fix (idempotent, safe to re-run)
--
-- HOW TO RUN: Open your Supabase Dashboard → SQL Editor → paste this whole
-- file → Run. Re-running is safe (uses ON CONFLICT DO NOTHING and
-- CREATE OR REPLACE).
--
-- WHAT THIS DOES:
--   1. Seeds audit_plans, addon_services, tools, research_posts with real
--      content (unblocks empty /services, /products, /research pages).
--   2. Rewrites handle_new_user / handle_user_email_confirmed so exactly two
--      emails receive the admin role:
--        - admin@example.com
--        - admin@example.com
--   3. Backfills: grants admin to those two if they already exist; removes
--      admin from anyone else.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. AUDIT PLANS (5 rows)
-- ----------------------------------------------------------------------------
INSERT INTO public.audit_plans
  (slug, name, price, price_note, audience, delivery, popular, includes, not_included, cta, display_order)
VALUES
  ('community', 'Community Edition', 'Free', NULL,
   'Students, personal & portfolio sites, educational and open-source projects',
   '2–3 business days', false,
   ARRAY[
     'Scope: 1 Domain, 1 Website',
     'Domain & DNS configuration review',
     'WHOIS & SSL/TLS check',
     'HTTP security headers review',
     'Tech stack & public info exposure check',
     'Basic security score & risk summary',
     'Basic PDF report'
   ],
   ARRAY[
     'Manual penetration testing',
     'Auth / authorization testing',
     'API security testing',
     'Retests, consultations, priority support'
   ],
   'Request Free Scan', 10),

  ('essential', 'Essential', '₹999', 'Launch pricing',
   'Small businesses, company websites, landing pages, small web apps',
   '3–5 business days', false,
   ARRAY[
     'Everything in Community',
     'Manual verification of findings',
     'Basic OWASP Top 10 assessment',
     'Authentication & session management review',
     'Sensitive files & directories review',
     'Security configuration review',
     'Input validation checks',
     'Detailed risk assessment',
     'Prioritized remediation recommendations',
     'Executive summary & professional PDF report'
   ],
   ARRAY[]::text[],
   'Book Essential', 20),

  ('professional', 'Professional', '₹2,999', 'Launch pricing',
   'SaaS, e-commerce, business applications',
   '5–7 business days', true,
   ARRAY[
     'Everything in Essential',
     'Complete manual web app security assessment',
     'Authentication, authorization & session testing',
     'Basic business logic review',
     'File upload testing',
     'Basic API security assessment',
     'Error handling & information disclosure testing',
     'CVSS risk scoring',
     'One free retest',
     '30-minute security consultation',
     'Comprehensive technical report'
   ],
   ARRAY[]::text[],
   'Book Professional', 30),

  ('business', 'Business', '₹6,999', 'Launch pricing',
   'Growing companies, SaaS platforms, multi-service applications',
   '1–2 weeks', false,
   ARRAY[
     'Everything in Professional',
     'Advanced web app security assessment',
     'Advanced API security assessment',
     'Business logic testing',
     'Access control review',
     'Third-party dependency review',
     'Security configuration assessment',
     'External attack surface review',
     'Security scorecard & risk matrix',
     'Detailed remediation roadmap',
     'Executive presentation',
     'Two free retests',
     'Security consultation meeting'
   ],
   ARRAY[]::text[],
   'Book Business', 40),

  ('enterprise', 'Enterprise', 'Custom', NULL,
   'Large organizations, enterprises, high-value applications',
   'Scope-based', false,
   ARRAY[
     'Everything in Business',
     'Multiple domains & applications',
     'Large API environment assessment',
     'External attack surface assessment',
     'Cloud security review (scope-based)',
     'Infrastructure security review (scope-based)',
     'Dedicated security engineer',
     'Continuous communication',
     'Executive presentation',
     'Compliance mapping (OWASP ASVS, OWASP Top 10, CWE)',
     'Priority support',
     'Three free retests',
     'Custom reporting & deliverables'
   ],
   ARRAY[]::text[],
   'Request Custom Quote', 50)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. ADDON SERVICES (17 rows) — only inserted if the table is empty
-- ----------------------------------------------------------------------------
INSERT INTO public.addon_services (name, price, display_order)
SELECT * FROM (VALUES
  ('Secure Code Review', '₹2,499', 10),
  ('Mobile Application Security Assessment', '₹3,999', 20),
  ('Network Security Assessment', '₹4,999', 30),
  ('Cloud Security Assessment', '₹4,999', 40),
  ('Advanced API Security Assessment', '₹2,999', 50),
  ('Security Consultation (1 hour)', '₹999', 60),
  ('Security Awareness Training', 'Starting at ₹2,999', 70),
  ('Secure Development Guidance', '₹2,499', 80),
  ('Additional Re-test', '₹999', 90),
  ('Quarterly Security Review', '₹4,999 / quarter', 100),
  ('Continuous Security Monitoring', 'Starting at ₹2,999 / month', 110),
  ('Additional Domain Scope', '₹499', 120),
  ('Additional Web Application Environment Assessment', '₹999', 130),
  ('Extra Targeted Remediation Retest', '₹799', 140),
  ('Fast Track Priority Delivery', '₹999', 150),
  ('Extended 30-Min Consultation', '₹499', 160),
  ('Deep-Dive 60-Min Consultation', '₹899', 170)
) AS v(name, price, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.addon_services);

-- ----------------------------------------------------------------------------
-- 3. TOOLS (4 available + 2 coming soon)
-- ----------------------------------------------------------------------------
INSERT INTO public.tools
  (slug, name, tagline, is_paid, status, external_link, github_link, features, usage, display_order)
VALUES
  ('cyber-exposure-scanner', 'VIROXEN Cyber Exposure Scanner',
   'A web-based reconnaissance and exposure analysis suite for domains, IPs, and public identifiers.',
   false, 'available', 'https://viroxen-project.vercel.app', NULL,
   ARRAY[
     'Domain & IP analysis','Email & username analysis','SSL / TLS analysis',
     'DNS record analysis','WHOIS information','Security header analysis',
     'Port scanning','Risk scoring','PDF report generation'
   ],
   NULL, 10),

  ('reconforge-toolkit', 'ReconForge Toolkit',
   'Modular reconnaissance toolkit for surface discovery on web applications and infrastructure.',
   false, 'available', NULL, 'https://github.com/kaizenanonymous/recon-forge-toolkit.git',
   ARRAY['Admin panel finder','Directory finder','JavaScript analysis','Technology detector','Subdomain finder'],
   E'git clone https://github.com/kaizenanonymous/recon-forge-toolkit.git\ncd recon-forge-toolkit\n# Follow the setup instructions in the repository README.',
   20),

  ('xss-viper', 'XSS-VIPER',
   'A research-grade cross-site scripting analysis framework with WAF-aware payload generation.',
   false, 'available', NULL, 'https://github.com/kaizenanonymous/Xss-viper.git',
   ARRAY[
     'WAF-aware bypass engine (Cloudflare, AWS, ModSecurity)',
     'Context-aware payload generation',
     'Silent verification mode for authorized testing',
     'Full ecosystem: CLI, web dashboard, browser extension',
     'Callback server for authorized monitoring',
     'DOM XSS detection across React, Vue and Angular'
   ],
   E'git clone https://github.com/kaizenanonymous/Xss-viper.git\ncd Xss-viper\n# Follow the setup instructions in the repository README.',
   30),

  ('phishguard', 'PhishGuard',
   'A lightweight phishing URL analyzer designed for defensive and educational use.',
   false, 'available', NULL, 'https://github.com/kaizenanonymous/PhishGuard.git',
   ARRAY[
     'Suspicious / phishing URL detection','SSL certificate validation',
     'WHOIS domain lookup','Keyword-based phishing detection',
     'IP-based and long URL detection','Clean modular Python codebase'
   ],
   E'git clone https://github.com/kaizenanonymous/PhishGuard.git\ncd PhishGuard\n# Follow the setup instructions in the repository README.',
   40),

  ('vx-monitor', 'VX Monitor',
   'Continuous perimeter monitoring for production environments. Coming soon.',
   true, 'coming-soon', NULL, NULL,
   ARRAY[
     'Change detection on public surface',
     'TLS & certificate lifecycle alerts',
     'Header & configuration drift monitoring'
   ],
   NULL, 50),

  ('vx-codegate', 'VX CodeGate',
   'CI-integrated source review assistant for build pipelines. Coming soon.',
   true, 'coming-soon', NULL, NULL,
   ARRAY[
     'Static analysis with CVSS mapping',
     'Dependency review',
     'Pull-request annotated findings'
   ],
   NULL, 60)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. RESEARCH POSTS (3 published articles)
-- ----------------------------------------------------------------------------
INSERT INTO public.research_posts
  (slug, title, excerpt, body, tags, author_name, status, published_at)
VALUES
  ('owasp-top-10-2024-what-changed',
   'OWASP Top 10 (2024): What actually changed for engineering teams',
   'A practical read on the latest OWASP Top 10 update and how build pipelines should adapt — no fear, just the changes that matter.',
   E'The 2024 revision of the OWASP Top 10 continues the trend of consolidating categories around root causes rather than individual vulnerabilities.\n\nFor engineering teams the practical shift is smaller than it appears: the categories that most affect day-to-day work — broken access control, insecure design, and vulnerable and outdated components — remain unchanged in priority.\n\nWhat we recommend:\n\n- Treat access control as a design-time concern, not a middleware afterthought.\n- Track third-party dependency risk continuously, not only at release.\n- Ship security requirements alongside functional requirements in the same ticket.\n\nThese three habits address roughly 70% of what we see in mid-market audits.',
   ARRAY['Vulnerability Analysis','Secure Coding'],
   'VIROXEN Research', 'published'::post_status, '2026-05-12T09:00:00Z'::timestamptz),

  ('cvss-scoring-practical-guide',
   'A practical guide to CVSS scoring for busy teams',
   'CVSS is not a marketing number. This guide explains how we score findings and how teams can use those scores to prioritize remediation.',
   E'CVSS scoring becomes useful when it is applied consistently across an engagement. In our reports we publish base, temporal, and environmental metrics separately so teams can adjust for their own context.\n\nA common mistake is to remediate strictly by score. In practice, business impact — data classification, blast radius, and recovery time — often re-orders the queue. We recommend pairing each finding''s CVSS score with a one-line business impact statement written by someone who owns the affected system.',
   ARRAY['Threat Intelligence','Vulnerability Analysis'],
   'VIROXEN Research', 'published'::post_status, '2026-04-02T09:00:00Z'::timestamptz),

  ('supply-chain-hardening-for-startups',
   'Supply-chain hardening for startups without a security team',
   'Pragmatic controls that a small engineering team can adopt this quarter to reduce dependency risk.',
   E'Startups routinely ship with hundreds of transitive dependencies and no formal review process. That is not necessarily a problem — but the absence of visibility is.\n\nThe cheapest wins for a small team:\n\n- Pin production dependencies and enable automated update PRs.\n- Enforce provenance checks on build artefacts.\n- Restrict CI secrets by branch and by job.\n- Adopt SLSA level 1 as a baseline; iterate upward each quarter.\n\nNone of this requires a dedicated security hire.',
   ARRAY['Secure Coding','News'],
   'VIROXEN Research', 'published'::post_status, '2026-02-18T09:00:00Z'::timestamptz)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. ADMIN EMAIL RULES — two authorized founder accounts
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name',
             NEW.raw_user_meta_data->>'name',
             split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role)
  ON CONFLICT DO NOTHING;

  IF NEW.email_confirmed_at IS NOT NULL
     AND lower(NEW.email) IN ('admin@example.com', 'viroxencybersec@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT DO NOTHING;
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
  IF NEW.email_confirmed_at IS NOT NULL
     AND (OLD.email_confirmed_at IS NULL
          OR OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at) THEN

    IF lower(NEW.email) IN ('admin@example.com', 'viroxencybersec@gmail.com') THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'admin'::app_role)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Staff invite flow: link a pre-created staff row and grant the staff role.
    UPDATE public.staff SET user_id = NEW.id
      WHERE user_id IS NULL AND lower(email) = lower(NEW.email);

    IF EXISTS (SELECT 1 FROM public.staff WHERE user_id = NEW.id) THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'staff'::app_role)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user()            FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_user_email_confirmed() FROM PUBLIC, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 6. BACKFILL: enforce two-admin rule
-- ----------------------------------------------------------------------------
DELETE FROM public.user_roles
 WHERE role = 'admin'::app_role
   AND user_id NOT IN (
     SELECT id FROM auth.users
      WHERE lower(email) IN ('admin@example.com', 'admin2@gmail.com')
   );

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
  FROM auth.users
 WHERE lower(email) IN ('admin@example.com', 'admin2@gmail.com')
ON CONFLICT DO NOTHING;
