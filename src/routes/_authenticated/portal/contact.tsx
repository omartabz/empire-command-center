import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Phone, Clock, MapPin } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/contact")({
  component: ContactPage,
});

function ContactPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setBusy(false); return; }
    const { error } = await supabase.from("tickets").insert({
      user_id: u.user.id,
      title: subject || "General enquiry",
      category: "Other",
      priority: "Neutral",
      description: message,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Message sent — we'll be in touch soon.");
    setSubject(""); setMessage("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={submit} className="lg:col-span-2 rounded-xl bg-white border border-slate-200 p-6 space-y-4">
        <div className="text-xs font-semibold tracking-widest text-sky-700">SEND US A MESSAGE</div>
        <div><Label>Subject</Label><Input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="How can we help?" /></div>
        <div><Label>Message</Label><Textarea rows={6} required value={message} onChange={(e) => setMessage(e.target.value)} /></div>
        <Button type="submit" disabled={busy} className="bg-sky-600 hover:bg-sky-700">{busy ? "Sending…" : "Send message"}</Button>
      </form>

      <aside className="rounded-xl bg-white border border-slate-200 p-6 space-y-4">
        <div className="text-xs font-semibold tracking-widest text-slate-500">GET IN TOUCH</div>
        <div className="flex items-start gap-3"><Mail className="w-5 h-5 text-sky-600 mt-0.5" /><div><div className="text-sm font-medium">Email</div><div className="text-sm text-slate-600">support@empire.logistics</div></div></div>
        <div className="flex items-start gap-3"><Phone className="w-5 h-5 text-sky-600 mt-0.5" /><div><div className="text-sm font-medium">Phone</div><div className="text-sm text-slate-600">+27 21 555 0100</div></div></div>
        <div className="flex items-start gap-3"><Clock className="w-5 h-5 text-sky-600 mt-0.5" /><div><div className="text-sm font-medium">Hours</div><div className="text-sm text-slate-600">Mon–Fri, 07:00–18:00 SAST</div></div></div>
        <div className="flex items-start gap-3"><MapPin className="w-5 h-5 text-sky-600 mt-0.5" /><div><div className="text-sm font-medium">Head office</div><div className="text-sm text-slate-600">15 Harbour Road, Cape Town, 8001</div></div></div>
      </aside>
    </div>
  );
}
