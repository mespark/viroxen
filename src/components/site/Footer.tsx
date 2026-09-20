import { Link } from "@tanstack/react-router";
import { Linkedin, Instagram, Youtube, Twitter, Mail } from "lucide-react";
import { NAV_LINKS, SUPPORT_EMAIL } from "@/lib/site-data";
import { Wordmark } from "./Logo";

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/viroxen-cybersecurity/", icon: Linkedin },
  { label: "Instagram", href: "https://www.instagram.com/viroxen.co?igsh=dnVpaDRoejFveTBt", icon: Instagram },
  { label: "YouTube", href: "https://youtube.com/@viroxen-cybersec?si=GKqgTx-RsOk1ecKq", icon: Youtube },
  { label: "X (Twitter)", href: "https://x.com/ViroxenHQ", icon: Twitter },
  {
    label: "WhatsApp Channel",
    href: "https://whatsapp.com/channel/0029VbDPr5LF1YlKBCoKVR2z",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.174.198-.298.298-.496.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 2.003a9.995 9.995 0 00-8.427 15.328L2 22l4.792-1.257A9.994 9.994 0 1012 2.003z"/>
      </svg>
    ),
  },
  {
    label: "Reddit",
    href: "https://www.reddit.com/user/viroxen009/?utm_source=share&utm_medium=web3x",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M22 12.14a2.14 2.14 0 00-3.63-1.53c-1.42-1-3.34-1.65-5.45-1.72l1.11-3.5 3.02.71a1.68 1.68 0 101.68-1.78 1.68 1.68 0 00-1.5.94l-3.34-.78a.5.5 0 00-.6.35l-1.28 4.06c-2.14.06-4.09.71-5.52 1.72a2.14 2.14 0 10-2.35 3.52 4.1 4.1 0 00-.05.62c0 3.13 3.58 5.66 8 5.66s8-2.53 8-5.66c0-.21-.02-.42-.05-.62A2.14 2.14 0 0022 12.14zM8.5 13.5a1.36 1.36 0 111.36 1.36 1.36 1.36 0 01-1.36-1.36zm6.98 3.87A5.4 5.4 0 0112 18.3a5.4 5.4 0 01-3.48-.93.44.44 0 11.55-.69A4.55 4.55 0 0012 17.4a4.55 4.55 0 002.93-.72.44.44 0 11.55.69zm-.34-2.51a1.36 1.36 0 111.36-1.36 1.36 1.36 0 01-1.36 1.36z"/>
      </svg>
    ),
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Wordmark />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              A cybersecurity company offering security assessments, security products, and
              applied security research for engineering teams.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {socials.map((s) => {
                const Icon = "icon" in s ? s.icon : undefined;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {Icon ? <Icon className="h-4 w-4" /> : (s as any).svg}
                  </a>
                );
              })}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                aria-label="Email"
                title="Email us"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li><Link to="/methodology" className="text-muted-foreground transition-colors hover:text-foreground">Methodology</Link></li>
              <li><Link to="/faq" className="text-muted-foreground transition-colors hover:text-foreground">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Support</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href={`mailto:${SUPPORT_EMAIL}`} className="text-muted-foreground transition-colors hover:text-foreground">{SUPPORT_EMAIL}</a></li>
              <li><Link to="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground transition-colors hover:text-foreground">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-muted-foreground transition-colors hover:text-foreground">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {year} VIROXEN. All rights reserved.</p>
          <p className="tracking-wide">Evidence-based security engineering.</p>
        </div>
      </div>
    </footer>
  );
}
