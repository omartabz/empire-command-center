import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Paperclip } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/support")({
  component: SupportPage,
});

const CATEGORIES = ["Integration", "Data Quality", "Billing", "Login Access", "Negative", "Positive", "Frustrated", "Other"];
const PRIORITIES = ["Neutral", "Negative", "Frustrated", "Emergency"];

interface Row { id: string; title: string; category: string; priority: string; status: string; created_at: string }

function SupportPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Integration");
  const [priority, setPriority] = useState("Neutral");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [recent, setRecent] = useState<Row[]>([]);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data } = await supabase.from("tickets")
      .select("id, title, category, priority, status, created_at")
      .eq("user_id", u.user.id)
      .order("created_at", { ascending: false })
      .limit(6);
    setRecent(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setBusy(false); return; }
    const desc = attachment ? `${description}\n\n[Attachment: ${attachment}]` : description;
    const { error } = await supabase.from("tickets").insert({
      user_id: u.user.id, title, category, priority, description: desc,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Ticket submitted");
    setTitle(""); setDescription(""); setAttachment(""); setCategory("Integration"); setPriority("Neutral");
    load();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={submit} className="lg:col-span-2 rounded-xl bg-white border border-slate-200 p-6 space-y-4">
        <div className="text-xs font-semibold tracking-widest text-sky-700">LOG NEW SUPPORT TICKET</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Ticket name / subject</Label>
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Integration sync failing" />
          </div>
          <div>
            <Label>Date</Label>
            <Input value={new Date().toISOString().slice(0, 10)} readOnly />
          </div>
          <div>
            <Label>Issue category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea rows={5} required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue in detail…" />
        </div>
        <div>
          <Label>Attachments</Label>
          <div className="mt-1 flex items-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3">
            <Paperclip className="w-4 h-4 text-slate-500" />
            <Input placeholder="Paste a file link or reference (e.g. drive URL)" value={attachment} onChange={(e) => setAttachment(e.target.value)} className="border-0 bg-transparent shadow-none focus-visible:ring-0" />
          </div>
        </div>
        <div className="pt-2">
          <Button type="submit" disabled={busy} className="bg-sky-600 hover:bg-sky-700">{busy ? "Submitting…" : "SUBMIT TICKET"}</Button>
        </div>
      </form>

      <aside className="rounded-xl bg-white border border-slate-200 p-5">
        <div className="text-xs font-semibold tracking-widest text-slate-500 mb-3">RECENT LOGGED TICKETS</div>
        <div className="space-y-3">
          {recent.length === 0 && <div className="text-sm text-slate-500">No tickets yet.</div>}
          {recent.map((r) => (
            <Link key={r.id} to="/portal/tickets" className="block rounded-lg border border-slate-200 p-3 hover:border-sky-300 hover:bg-sky-50 transition">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium truncate">{r.title}</div>
                <Badge variant="outline" className="text-[10px]">{r.status}</Badge>
              </div>
              <div className="text-xs text-slate-500 mt-1">{r.category} · {r.priority}</div>
              <div className="text-[10px] text-slate-400 mt-1">{new Date(r.created_at).toLocaleString()}</div>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}
