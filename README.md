<div align="center">

# VIROXEN — Security Engineering Platform

**Evidence-based cybersecurity for engineering teams.**
A full-stack website for a security consultancy: audit services, in-house tools, and applied research, with a database-driven admin panel.

![License](https://img.shields.io/badge/license-MIT-2ea043?style=flat-square)
![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)
![TanStack Start](https://img.shields.io/badge/TanStack-Start%20%2F%20Router-FF4154?style=flat-square)
![Tailwind](https://img.shields.io/badge/TailwindCSS-v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?style=flat-square&logo=supabase&logoColor=white)

</div>

---

## Overview

Viroxen is a marketing site plus a small self-service platform. Public content (audit plans, tools, products, research posts, audited clients) is stored in Postgres and managed from an authenticated admin panel, so content changes need no redeploy.

| Pillar | What it does |
|---|---|
| Security audit services | Structured web, API and infrastructure assessments with priced plans and add-ons |
| Security products | In-house tooling with live links and GitHub links |
| Applied research | Vulnerability write-ups, secure coding notes, threat intel |

## Features

- **Role-based admin panel** with CRUD for plans, tools, products, research and audited clients
- **Supabase backend** (Postgres, Auth, Storage) with Row Level Security enforced through a `has_role()` security-definer function
- **Private storage buckets** served through short-lived signed URLs
- **Server functions** (`createServerFn`) instead of loose API routes
- **OTP-based auth flows** (sign-in guard, password reset) implemented as Supabase Edge Functions that send mail over Gmail SMTP
- **Booking / audit request flow** with email notification to the team
- **Animated UI**: Framer Motion reveals, cursor-reactive hero, Three.js visual layer, dark-first design tokens
- **Legal pages**: privacy, terms, cookies (with cookie banner)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19, TanStack Start / TanStack Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| Animation | Framer Motion, `@react-three/fiber` / Three.js |
| Backend | Supabase (Postgres, Auth, Storage, Edge Functions) |
| Tooling | Vite, ESLint, Prettier |

## Project Structure

```
src/
├── routes/                    # File-based routes (TanStack Router)
│   ├── index.tsx              # Home
│   ├── services.tsx           # Audit plans and add-ons
│   ├── products.tsx           # Tools and products
│   ├── research.index.tsx     # Research list
│   ├── research.$slug.tsx     # Research post
│   ├── methodology.tsx, about.tsx, faq.tsx, contact.tsx, book.tsx
│   ├── privacy.tsx, terms.tsx, cookies.tsx
│   ├── auth.tsx, auth.reset-password.tsx
│   └── _authenticated/        # Protected: admin, dashboard, staff
├── lib/
│   ├── admin.functions.ts     # Server functions for admin CRUD (auth + role checked)
│   ├── queries.ts             # Public read-only queries
│   └── site-data.ts           # Static fallback content and site constants
├── integrations/supabase/     # Supabase clients, auth middleware, generated types
└── components/                # site/, motion/, ui/ (shadcn)

supabase/
├── config.toml
├── migrations/                # Tables, RLS policies, triggers
└── functions/                 # Edge Functions: auth-otp, auth-reset-*, auth-signin-guard, notify-submission
```

## Security Model

1. RLS is enabled on every table.
2. Public read access is limited to rows with `is_active = true`.
3. Writes are gated behind `has_role(auth.uid(), 'admin')`.
4. Storage buckets are private; files are served through signed URLs generated server-side with the service role, never from the client.
5. The service role key is used only on the server and inside Edge Functions. Never expose it in client code or commit it.

## Getting Started

### 1. Prerequisites
- Node.js 20+ and npm
- A [Supabase](https://supabase.com) project
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) (for OTP and notification emails)

### 2. Install
```bash
git clone https://github.com/mespark/viroxen.git
cd viroxen
npm install
```

### 3. Environment variables
```bash
cp .env.example .env
```
Fill in your own values:

| Variable | Used by | Notes |
|---|---|---|
| `SUPABASE_URL` | server | Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | server | Anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Secret. Never commit or expose |
| `VITE_SUPABASE_URL` | browser | Same project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | browser | Anon / publishable key |
| `VITE_SUPABASE_PROJECT_ID` | browser | Project ref |
| `SITE_URL` | server | Public site URL, used for auth links |

Edge Function secrets (set in the Supabase dashboard or with `supabase secrets set`):

| Secret | Purpose |
|---|---|
| `GMAIL_ADDRESS` | Sender account |
| `GMAIL_APP_PASSWORD` | Gmail app password |
| `NOTIFY_TO` | Where booking and contact notifications are sent |

### 4. Database
Apply the SQL files in `supabase/migrations/` in order (Supabase CLI: `supabase db push`, or paste them into the SQL editor). Then optionally run the seed script for sample plans, tools and research posts.

Admin access is granted by email inside the `handle_new_user` trigger. **Replace the placeholder admin email in the migrations/seed with your own before applying.**

### 5. Edge Functions
```bash
supabase functions deploy auth-otp auth-reset-otp auth-reset-request auth-signin-guard notify-submission
```

### 6. Run
```bash
npm run dev       # development server
npm run build     # production build
npm run preview   # preview the build
npm run lint      # ESLint
npm run format    # Prettier
```

## Contributing

Issues and pull requests are welcome. Please do not include real credentials, customer data or personal emails in any contribution.

## License

Released under the [MIT License](./LICENSE). The license covers the source code. The VIROXEN name, logo and written content are not licensed for reuse as your own brand.
