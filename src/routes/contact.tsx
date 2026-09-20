import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { SUPPORT_EMAIL } from "@/lib/site-data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — VIROXEN" },
      { name: "description", content: "Get in touch with VIROXEN about audits, tooling, research, or partnerships." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  company: z.string().trim().max(160).optional(),
  message: z.string().trim().min(1).max(4000),
});

function Contact() {
  const [service, setService] = useState("Security Audit Services");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      company: fd.get("company") || undefined,
      message: fd.get("message"),
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("inquiries").insert({
        user_id: userData.user?.id ?? null,
        name: parsed.data.name,
        email: parsed.data.email,
        company: parsed.data.company ?? null,
        service_type: service,
        message: parsed.data.message,
      });
      if (error) throw error;
      // Notify (email delivery must never block form success)
      try {
        await supabase.functions.invoke("notify-submission", {
          body: {
            type: "inquiry",
            fields: {
              name: parsed.data.name,
              email: parsed.data.email,
              company: parsed.data.company ?? "",
              service_type: service,
              message: parsed.data.message,
            },
          },
        });
      } catch (e) { console.warn("notify failed", e); }
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send your inquiry");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <SiteLayout>
        <PageHeader eyebrow="Inquiry received" title="Thanks — we'll respond soon." description="You'll receive a reply within one business day." />
        <section className="py-16">
          <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
            <div className="rounded-2xl border border-border/60 bg-card p-8">
              <CheckCircle2 className="mx-auto h-12 w-12 text-primary" strokeWidth={1.4} />
              <h2 className="mt-4 text-xl font-semibold">Inquiry submitted</h2>
              <p className="mt-2 text-sm text-muted-foreground">Our team will get back to you at the email you provided.</p>
              <div className="mt-6 flex justify-center gap-3">
                <Link to="/"><Button variant="outline">Back to home</Button></Link>
                <Link to="/services"><Button>View services</Button></Link>
              </div>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Contact"
        title="Talk to VIROXEN."
        description="We reply within one business day. For urgent matters, email us directly."
      />
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
          <aside className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-border/60 bg-card p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border/70 bg-background text-primary">
                <Mail className="h-5 w-5" strokeWidth={1.6} />
              </div>
              <p className="text-sm text-muted-foreground">Email</p>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-1 block text-lg font-medium text-foreground hover:text-primary">
                {SUPPORT_EMAIL}
              </a>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Response time</p>
              <p className="mt-2">Within one business day for all inquiries.</p>
            </div>
          </aside>

          <form className="space-y-5 lg:col-span-3" onSubmit={onSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required className="mt-2" />
              </div>
              <div>
                <Label htmlFor="email">Work email</Label>
                <Input id="email" name="email" type="email" required className="mt-2" />
              </div>
            </div>
            <div>
              <Label htmlFor="company">Company (optional)</Label>
              <Input id="company" name="company" className="mt-2" />
            </div>
            <div>
              <Label>Interested in</Label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Security Audit Services">Security Audit Services</SelectItem>
                  <SelectItem value="Cybersecurity Products">Cybersecurity Products</SelectItem>
                  <SelectItem value="Cybersecurity Research">Cybersecurity Research</SelectItem>
                  <SelectItem value="Partnership / Other">Partnership / Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" required rows={6} className="mt-2" />
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={busy}>
              {busy ? "Sending…" : "Send inquiry"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Your message is stored securely. We only use it to respond to your inquiry.
            </p>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
