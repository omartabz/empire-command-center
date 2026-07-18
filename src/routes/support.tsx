import { createFileRoute } from "@tanstack/react-router";
import { useEmpire, type TicketCategory, type TicketPriority } from "@/store/empire";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Bot, Paperclip, Trash2, Radar } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Empire Customer Support — Log a Ticket" }] }),
  component: SupportPortal,
});

function SupportPortal() {
  const { tickets, addTicket } = useEmpire();
  const customerTickets = tickets.filter((t) => t.source === "customer").slice(0, 5);
  const nextId = `CUST-${String(15 + tickets.filter((t) => t.source === "customer").length - 4).padStart(3, "0")}`;

  const [form, setForm] = useState({
    id: nextId,
    date: new Date().toISOString().slice(0, 10),
    email: "",
    title: "",
    category: "Integration" as TicketCategory,
    description: "",
    priority: "Neutral" as TicketPriority,
    attachment: "" as string | undefined,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.description) { toast.error("Email and description are required."); return; }
    const t = addTicket({
      id: form.id,
      title: form.title || form.description.slice(0, 40),
      email: form.email,
      category: form.category,
      priority: form.priority,
      description: form.description,
      attachment: form.attachment,
    });
    toast.success(`Ticket ${t.id} submitted`, { description: "Your ticket has been routed to Empire operations." });
    setForm({ ...form, id: `CUST-${String(15 + tickets.filter((x) => x.source === "customer").length + 1 - 4).padStart(3, "0")}`, description: "", title: "", attachment: "" });
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="portal-light min-h-screen bg-background text-foreground">
      {/* Portal header */}
      <header className="border-b border-border bg-[var(--panel)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radar className="w-6 h-6 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground leading-tight">Empire Customer Support</div>
              <div className="font-semibold leading-tight">empire.logistics/support</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-xs text-primary hover:underline">Switch to internal ›</a>
            <Bell className="w-5 h-5 text-muted-foreground" />
            <Avatar className="w-9 h-9 border-2 border-primary/40">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-8 bg-white shadow-lg border-0">
          <div className="mb-6">
            <div className="text-sm text-primary/70">Empire Customer Support</div>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-primary border-b-2 border-[color:var(--primary)]/80 pb-2 inline-block">Log New Support Ticket</h1>
          </div>

          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label className="font-bold text-primary">Ticket name</Label>
              <Input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} className="mt-1 bg-primary/5 border-primary/20" />
            </div>
            <div>
              <Label className="font-bold text-primary">Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="font-bold text-primary">Email</Label>
              <Input type="email" placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="font-bold text-primary">Issue Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as TicketCategory })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Integration">Integration</SelectItem>
                  <SelectItem value="Negative">Negative</SelectItem>
                  <SelectItem value="Frustrated">Frustrated</SelectItem>
                  <SelectItem value="Positive">Positive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="font-bold text-primary">Description</Label>
              <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" placeholder="Describe your issue…" />
            </div>

            <div>
              <Label className="font-bold text-primary">Priority</Label>
              <RadioGroup value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as TicketPriority })} className="mt-2 space-y-1">
                {(["Neutral", "Negative", "Frustrated"] as const).map((p) => (
                  <label key={p} className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value={p} /> {p}
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="font-bold text-primary">Attachments</Label>
              <div className="mt-1 border border-dashed border-border rounded-md p-3 min-h-[100px]">
                {form.attachment ? (
                  <div className="flex items-center justify-between text-sm bg-primary/5 rounded px-2 py-1">
                    <span>{form.attachment}</span>
                    <button type="button" onClick={() => setForm({ ...form, attachment: "" })}><Trash2 className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground py-4">
                    <Paperclip className="w-4 h-4" /> Click to attach a file
                  </button>
                )}
                <input ref={fileRef} type="file" className="hidden" onChange={(e) => setForm({ ...form, attachment: e.target.files?.[0]?.name })} />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" className="uppercase tracking-wider px-8 py-6 text-base">Submit Ticket</Button>
            </div>
          </form>
        </Card>

        {/* Recent tickets */}
        <div className="space-y-4">
          <Card className="p-0 overflow-hidden bg-white border-0 shadow-lg">
            <div className="bg-primary text-primary-foreground px-4 py-3 font-bold">Recent Logged Tickets</div>
            <ul className="divide-y divide-border">
              {customerTickets.map((t) => {
                const dot = t.priority === "Frustrated" || t.priority === "Emergency" ? "bg-red-500" :
                            t.priority === "Negative" ? "bg-red-400" :
                            t.status === "Resolved" ? "bg-green-500" : "bg-amber-400";
                return (
                  <li key={t.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-primary">{t.id}</div>
                      <div className="text-xs text-muted-foreground">Last Logged Ticket</div>
                    </div>
                    <span className={`w-3 h-3 rounded-full ${dot}`} />
                  </li>
                );
              })}
            </ul>
          </Card>

          <div className="flex justify-end">
            <button className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/40 grid place-items-center shadow-xl hover:scale-105 transition">
              <div className="text-center">
                <Bot className="w-8 h-8 text-primary mx-auto" />
                <div className="text-[10px] font-bold text-primary mt-1">AI ASSISTANT</div>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
