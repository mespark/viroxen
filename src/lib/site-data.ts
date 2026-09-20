export type Plan = {
  slug: string;
  name: string;
  price: string;
  priceNote?: string;
  audience: string;
  delivery: string;
  popular?: boolean;
  includes: string[];
  notIncluded?: string[];
  cta: string;
};

export const plans: Plan[] = [
  {
    slug: "community",
    name: "Community Edition",
    price: "Free",
    audience: "Students, personal & portfolio sites, educational and open-source projects",
    delivery: "2–3 business days",
    includes: [
      "Scope: 1 Domain, 1 Website",
      "Domain & DNS configuration review",
      "WHOIS & SSL/TLS check",
      "HTTP security headers review",
      "Tech stack & public info exposure check",
      "Basic security score & risk summary",
      "Basic PDF report",
    ],
    notIncluded: [
      "Manual penetration testing",
      "Auth / authorization testing",
      "API security testing",
      "Retests, consultations, priority support",
    ],
    cta: "Request Free Scan",
  },
  {
    slug: "essential",
    name: "Essential",
    price: "₹999",
    priceNote: "Launch pricing",
    audience: "Small businesses, company websites, landing pages, small web apps",
    delivery: "3–5 business days",
    includes: [
      "Everything in Community",
      "Manual verification of findings",
      "Basic OWASP Top 10 assessment",
      "Authentication & session management review",
      "Sensitive files & directories review",
      "Security configuration review",
      "Input validation checks",
      "Detailed risk assessment",
      "Prioritized remediation recommendations",
      "Executive summary & professional PDF report",
    ],
    cta: "Book Essential",
  },
  {
    slug: "professional",
    name: "Professional",
    price: "₹2,999",
    priceNote: "Launch pricing",
    audience: "SaaS, e-commerce, business applications",
    delivery: "5–7 business days",
    popular: true,
    includes: [
      "Everything in Essential",
      "Complete manual web app security assessment",
      "Authentication, authorization & session testing",
      "Basic business logic review",
      "File upload testing",
      "Basic API security assessment",
      "Error handling & information disclosure testing",
      "CVSS risk scoring",
      "One free retest",
      "30-minute security consultation",
      "Comprehensive technical report",
    ],
    cta: "Book Professional",
  },
  {
    slug: "business",
    name: "Business",
    price: "₹6,999",
    priceNote: "Launch pricing",
    audience: "Growing companies, SaaS platforms, multi-service applications",
    delivery: "1–2 weeks",
    includes: [
      "Everything in Professional",
      "Advanced web app security assessment",
      "Advanced API security assessment",
      "Business logic testing",
      "Access control review",
      "Third-party dependency review",
      "Security configuration assessment",
      "External attack surface review",
      "Security scorecard & risk matrix",
      "Detailed remediation roadmap",
      "Executive presentation",
      "Two free retests",
      "Security consultation meeting",
    ],
    cta: "Book Business",
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    price: "Custom",
    audience: "Large organizations, enterprises, high-value applications",
    delivery: "Scope-based",
    includes: [
      "Everything in Business",
      "Multiple domains & applications",
      "Large API environment assessment",
      "External attack surface assessment",
      "Cloud security review (scope-based)",
      "Infrastructure security review (scope-based)",
      "Dedicated security engineer",
      "Continuous communication",
      "Executive presentation",
      "Compliance mapping (OWASP ASVS, OWASP Top 10, CWE)",
      "Priority support",
      "Three free retests",
      "Custom reporting & deliverables",
    ],
    cta: "Request Custom Quote",
  },
];

export const includedInAllPaid = [
  "Executive Summary",
  "Professional PDF Report",
  "Technical Findings",
  "Risk Ratings (CVSS where applicable)",
  "Business Impact Analysis",
  "Remediation Recommendations",
  "Conclusion",
];

export const addons: { name: string; price: string }[] = [
  { name: "Secure Code Review", price: "₹2,499" },
  { name: "Mobile Application Security Assessment", price: "₹3,999" },
  { name: "Network Security Assessment", price: "₹4,999" },
  { name: "Cloud Security Assessment", price: "₹4,999" },
  { name: "Advanced API Security Assessment", price: "₹2,999" },
  { name: "Security Consultation (1 hour)", price: "₹999" },
  { name: "Security Awareness Training", price: "Starting at ₹2,999" },
  { name: "Secure Development Guidance", price: "₹2,499" },
  { name: "Additional Re-test", price: "₹999" },
  { name: "Quarterly Security Review", price: "₹4,999 / quarter" },
  { name: "Continuous Security Monitoring", price: "Starting at ₹2,999 / month" },
  { name: "Additional Domain Scope", price: "₹499" },
  { name: "Additional Web Application Environment Assessment", price: "₹999" },
  { name: "Extra Targeted Remediation Retest", price: "₹799" },
  { name: "Fast Track Priority Delivery", price: "₹999" },
  { name: "Extended 30-Min Consultation", price: "₹499" },
  { name: "Deep-Dive 60-Min Consultation", price: "₹899" },
];

export type Tool = {
  slug: string;
  name: string;
  tagline: string;
  isPaid: boolean;
  status: "available" | "coming-soon";
  externalLink?: string;
  githubLink?: string;
  features: string[];
  usage?: string;
};

export const tools: Tool[] = [
  {
    slug: "cyber-exposure-scanner",
    name: "VIROXEN Cyber Exposure Scanner",
    tagline:
      "A web-based reconnaissance and exposure analysis suite for domains, IPs, and public identifiers.",
    isPaid: false,
    status: "available",
    externalLink: "https://viroxen-project.vercel.app",
    features: [
      "Domain & IP analysis",
      "Email & username analysis",
      "SSL / TLS analysis",
      "DNS record analysis",
      "WHOIS information",
      "Security header analysis",
      "Port scanning",
      "Risk scoring",
      "PDF report generation",
    ],
  },
  {
    slug: "reconforge-toolkit",
    name: "ReconForge Toolkit",
    tagline:
      "Modular reconnaissance toolkit for surface discovery on web applications and infrastructure.",
    isPaid: false,
    status: "available",
    githubLink: "https://github.com/kaizenanonymous/recon-forge-toolkit.git",
    features: [
      "Admin panel finder",
      "Directory finder",
      "JavaScript analysis",
      "Technology detector",
      "Subdomain finder",
    ],
    usage:
      "git clone https://github.com/kaizenanonymous/recon-forge-toolkit.git\ncd recon-forge-toolkit\n# Follow the setup instructions in the repository README.",
  },
  {
    slug: "xss-viper",
    name: "XSS-VIPER",
    tagline:
      "A research-grade cross-site scripting analysis framework with WAF-aware payload generation.",
    isPaid: false,
    status: "available",
    githubLink: "https://github.com/kaizenanonymous/Xss-viper.git",
    features: [
      "WAF-aware bypass engine (Cloudflare, AWS, ModSecurity)",
      "Context-aware payload generation",
      "Silent verification mode for authorized testing",
      "Full ecosystem: CLI, web dashboard, browser extension",
      "Callback server for authorized monitoring",
      "DOM XSS detection across React, Vue and Angular",
    ],
    usage:
      "git clone https://github.com/kaizenanonymous/Xss-viper.git\ncd Xss-viper\n# Follow the setup instructions in the repository README.",
  },
  {
    slug: "phishguard",
    name: "PhishGuard",
    tagline: "A lightweight phishing URL analyzer designed for defensive and educational use.",
    isPaid: false,
    status: "available",
    githubLink: "https://github.com/kaizenanonymous/PhishGuard.git",
    features: [
      "Suspicious / phishing URL detection",
      "SSL certificate validation",
      "WHOIS domain lookup",
      "Keyword-based phishing detection",
      "IP-based and long URL detection",
      "Clean modular Python codebase",
    ],
    usage:
      "git clone https://github.com/kaizenanonymous/PhishGuard.git\ncd PhishGuard\n# Follow the setup instructions in the repository README.",
  },
  {
    slug: "vx-monitor",
    name: "VX Monitor",
    tagline: "Continuous perimeter monitoring for production environments. Coming soon.",
    isPaid: true,
    status: "coming-soon",
    features: [
      "Change detection on public surface",
      "TLS & certificate lifecycle alerts",
      "Header & configuration drift monitoring",
    ],
  },
  {
    slug: "vx-codegate",
    name: "VX CodeGate",
    tagline: "CI-integrated source review assistant for build pipelines. Coming soon.",
    isPaid: true,
    status: "coming-soon",
    features: [
      "Static analysis with CVSS mapping",
      "Dependency review",
      "Pull-request annotated findings",
    ],
  },
];

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  tags: string[];
  body: string;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Locale- and timezone-independent date formatter to avoid SSR/CSR hydration mismatches. */
export function formatPostDate(iso: string): string {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export const posts: Post[] = [
  {
    slug: "owasp-top-10-2024-what-changed",
    title: "OWASP Top 10 (2024): What actually changed for engineering teams",
    excerpt:
      "A practical read on the latest OWASP Top 10 update and how build pipelines should adapt — no fear, just the changes that matter.",
    author: "VIROXEN Research",
    date: "2026-05-12",
    tags: ["Vulnerability Analysis", "Secure Coding"],
    body: `The 2024 revision of the OWASP Top 10 continues the trend of consolidating categories around root causes rather than individual vulnerabilities.\n\nFor engineering teams the practical shift is smaller than it appears: the categories that most affect day-to-day work — broken access control, insecure design, and vulnerable and outdated components — remain unchanged in priority.\n\nWhat we recommend:\n\n- Treat access control as a design-time concern, not a middleware afterthought.\n- Track third-party dependency risk continuously, not only at release.\n- Ship security requirements alongside functional requirements in the same ticket.\n\nThese three habits address roughly 70% of what we see in mid-market audits.`,
  },
  {
    slug: "cvss-scoring-practical-guide",
    title: "A practical guide to CVSS scoring for busy teams",
    excerpt:
      "CVSS is not a marketing number. This guide explains how we score findings and how teams can use those scores to prioritize remediation.",
    author: "VIROXEN Research",
    date: "2026-04-02",
    tags: ["Threat Intelligence", "Vulnerability Analysis"],
    body: `CVSS scoring becomes useful when it is applied consistently across an engagement. In our reports we publish base, temporal, and environmental metrics separately so teams can adjust for their own context.\n\nA common mistake is to remediate strictly by score. In practice, business impact — data classification, blast radius, and recovery time — often re-orders the queue. We recommend pairing each finding's CVSS score with a one-line business impact statement written by someone who owns the affected system.`,
  },
  {
    slug: "supply-chain-hardening-for-startups",
    title: "Supply-chain hardening for startups without a security team",
    excerpt:
      "Pragmatic controls that a small engineering team can adopt this quarter to reduce dependency risk.",
    author: "VIROXEN Research",
    date: "2026-02-18",
    tags: ["Secure Coding", "News"],
    body: `Startups routinely ship with hundreds of transitive dependencies and no formal review process. That is not necessarily a problem — but the absence of visibility is.\n\nThe cheapest wins for a small team:\n\n- Pin production dependencies and enable automated update PRs.\n- Enforce provenance checks on build artefacts.\n- Restrict CI secrets by branch and by job.\n- Adopt SLSA level 1 as a baseline; iterate upward each quarter.\n\nNone of this requires a dedicated security hire.`,
  },
];

export const NAV_LINKS = [
  { to: "/services", label: "Services" },
  { to: "/products", label: "Products" },
  { to: "/research", label: "Research" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export const SUPPORT_EMAIL = "viroxencybersec@gmail.com";

export type Phase = {
  n: string;
  name: string;
  goal: string;
  activities: string[];
  output: string;
};

export const methodology: Phase[] = [
  {
    n: "01",
    name: "Scoping & Rules of Engagement",
    goal: "Define assets, environments, windows, and legal boundaries before any test traffic is generated.",
    activities: [
      "Confirm in-scope domains, IP ranges, and APIs in writing",
      "Agree on test windows, rate limits, and out-of-band contacts",
      "Sign engagement authorisation and safe-harbour terms",
    ],
    output: "Signed Rules of Engagement document.",
  },
  {
    n: "02",
    name: "Reconnaissance & Attack Surface Mapping",
    goal: "Enumerate every reachable asset associated with the target — nothing tested is assumed.",
    activities: [
      "Passive OSINT, DNS, and certificate transparency review",
      "Subdomain, port, and service enumeration",
      "Technology fingerprinting and version inventory",
    ],
    output: "Attack surface inventory with ownership mapping.",
  },
  {
    n: "03",
    name: "Automated Analysis",
    goal: "Run structured tooling against the inventory to surface known-class issues at coverage.",
    activities: [
      "Authenticated and unauthenticated vulnerability scanning",
      "TLS, header, and configuration compliance checks",
      "Dependency and SBOM analysis for known CVEs",
    ],
    output: "Raw findings queued for manual verification.",
  },
  {
    n: "04",
    name: "Manual Testing & Exploitation",
    goal: "Verify every finding by hand and hunt for business-logic and chained issues automation cannot see.",
    activities: [
      "OWASP Top 10 and ASVS Level 2 test cases",
      "Authentication, authorisation, and session boundary testing",
      "Business logic, IDOR, race condition, and workflow abuse tests",
      "Proof-of-concept exploitation within Rules of Engagement",
    ],
    output: "Verified findings with reproduction steps and evidence.",
  },
  {
    n: "05",
    name: "Risk Scoring & Reporting",
    goal: "Translate technical findings into decisions engineering and leadership can act on.",
    activities: [
      "CVSS 3.1 base, temporal, and environmental scoring",
      "Business-impact statement per finding",
      "Prioritised remediation guidance mapped to owners",
      "Executive summary + full technical report (PDF)",
    ],
    output: "Executive summary + technical report.",
  },
  {
    n: "06",
    name: "Retest & Handover",
    goal: "Confirm fixes actually close the finding — not just the ticket.",
    activities: [
      "Free retest of remediated findings (plan-dependent)",
      "Fix-verification notes appended to the report",
      "Optional consultation on architectural follow-ups",
    ],
    output: "Signed-off remediation report.",
  },
];

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: "Do you perform unauthorised testing?",
    a: "No. Every engagement begins with a signed Rules of Engagement document that names the assets, windows, and contacts. We do not touch anything you do not own or explicitly authorise.",
  },
  {
    q: "How is a VIROXEN audit different from a scanner report?",
    a: "Automated tooling is a starting point, not the deliverable. Every finding in a VIROXEN report is manually verified with reproduction steps, evidence, and a CVSS score adjusted for your environment.",
  },
  {
    q: "What standards do you align with?",
    a: "OWASP Top 10, OWASP ASVS Level 2, and CVSS 3.1 for scoring. Where relevant we also reference NIST SP 800-115 for testing methodology.",
  },
  {
    q: "Will testing affect our production systems?",
    a: "By default we test against staging environments that mirror production. When production testing is required we agree on windows, rate limits, and a rollback contact before any traffic is generated.",
  },
  {
    q: "How are findings delivered?",
    a: "You receive an executive summary and a full technical report in PDF, plus a walkthrough call on request. Findings can also be delivered as ticket-ready entries mapped to owners.",
  },
  {
    q: "Do you offer retests?",
    a: "Yes. Professional and higher plans include one free retest of remediated findings. Additional retests can be added at any time.",
  },
  {
    q: "Can you sign an NDA?",
    a: "Yes — mutual NDAs are standard. We also support customer paperwork on request.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We invoice in INR or USD. Bank transfer, UPI, and card payment via invoice link are all supported.",
  },
];

export const SITE_URL = "https://viroxen.com";