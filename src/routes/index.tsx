import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useEmpire } from "@/store/empire";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, ShieldAlert,
  ArrowUpRight, MessageSquarePlus, MessageSquare, Clock, Activity, Users,
  Sparkles, ChevronRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  ScatterChart, Scatter, ZAxis, CartesianGrid, Legend,
} from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Internal Service Level & Performance — Empire" }] }),
  component: CommandCenter,
});

type CommentMap = Record<string, { author: string; text: string; at: string }[]>;
type Health = "healthy" | "warning" | "critical";

function CommandCenter() {
  const { kpis, ticketVolume, sentimentScatter, tickets, alerts } = useEmpire();
  const [comments, setComments] = useState<CommentMap>({});
  const [open, setOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const critical = tickets.filter((t) => t.status !== "Resolved");
  const escalation = tickets.filter((t) => t.status === "Escalated" || t.priority === "Emergency").slice(0, 4);

  // Health verdict — single source of truth for the 5-second scan
  const health: Health = useMemo(() => {
    if (kpis.slaBreaches >= 7) return "critical";
    if (kpis.slaBreaches >= 4) return "warning";
    return "healthy";
  }, [kpis.slaBreaches]);

  const criticalAlerts = alerts.filter((a) => a.severity === "critical").length;

  const openFor = (id: string | null) => { setActiveTicket(id); setDraft(""); setOpen(true); };
  const submitComment = () => {
    const text = draft.trim();
    if (!text) { toast.error("Comment cannot be empty"); return; }
    if (!activeTicket) { toast.error("Select a ticket first"); return; }
    setComments((prev) => ({
      ...prev,
      [activeTicket]: [
        ...(prev[activeTicket] ?? []),
        { author: "You", text, at: new Date().toLocaleString() },
      ],
    }));
    toast.success(`Comment added to ${activeTicket}`);
    setDraft("");
    setOpen(false);
  };

  // Today's recommended actions — derived from state, not decorative
  const todaysActions = useMemo(() => {
    const emergencies = tickets.filter((t) => t.priority === "Emergency" && t.status !== "Resolved");
    const acts: { id: string; label: string; detail: string; tone: Health }[] = [];
    if (emergencies.length) acts.push({
      id: "resolve-emergencies",
      label: `Resolve ${emergencies.length} emergency ticket${emergencies.length > 1 ? "s" : ""}`,
      detail: emergencies.map((t) => t.id).join(", "),
      tone: "critical",
    });
    if (kpis.slaBreaches >= 4) acts.push({
      id: "sla",
      label: `Review ${kpis.slaBreaches} SLA breach${kpis.slaBreaches > 1 ? "es" : ""}`,
      detail: "Reassign owners on breached tickets",
      tone: "warning",
    });
    if (criticalAlerts) acts.push({
      id: "ai-alerts",
      label: `Triage ${criticalAlerts} AI alert${criticalAlerts > 1 ? "s" : ""}`,
      detail: "Fraud + supplier risk flags awaiting review",
      tone: "warning",
    });
    if (acts.length === 0) acts.push({
      id: "ok", label: "No urgent actions", detail: "Monitor trends and continue routine reviews", tone: "healthy",
    });
    return acts;
  }, [tickets, kpis.slaBreaches, criticalAlerts]);

  return (
    <AppShell
      title="Service Level & Performance"
      subtitle="Period: June 1 – June 30, 2026 · Updated moments ago"
    >
      <div className="space-y-6">
        {/* ── HEALTH BANNER ──────────────────────────────────────── */}
        <HealthBanner
          health={health}
          slaBreaches={kpis.slaBreaches}
          active={kpis.active}
          emergencies={tickets.filter((t) => t.priority === "Emergency" && t.status !== "Resolved").length}
          criticalAlerts={criticalAlerts}
        />

        {/* ── KPI ROW ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Kpi label="SLA Breaches"    value={String(kpis.slaBreaches)} delta="+2 vs last week" trend="up"   status={kpis.slaBreaches >= 7 ? "critical" : kpis.slaBreaches >= 4 ? "warning" : "healthy"} deltaBad />
          <Kpi label="Active Tickets"  value={String(kpis.active)}      delta="+15 vs last week" trend="up"   status="neutral" />
          <Kpi label="Avg. Resolution" value={`${kpis.avgResolution}d`} delta="−5% vs last week" trend="down" status="healthy" />
          <Kpi label="NPS"             value={`+${kpis.nps}`}           delta="+3 pts"           trend="up"   status="healthy" />
        </div>

        {/* ── BENTO: URGENT ATTENTION + TODAY'S ACTIONS ─────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Urgent Attention */}
          <section className="surface-card p-6 xl:col-span-2">
            <SectionHead
              icon={<ShieldAlert className="w-5 h-5" />}
              title="Requires Attention"
              caption={`${critical.length} open · ${escalation.length} escalated`}
            />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground/80 text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4 font-medium">Ticket</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Priority</th>
                    <th className="pb-3 pr-4 font-medium">Days Open</th>
                    <th className="pb-3 pr-4 font-medium">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {critical.slice(0, 6).map((t) => (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4">
                        <div className="font-medium">{t.id}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[220px]">{t.title}</div>
                      </td>
                      <td className="py-3 pr-4"><StatusPill status={t.status} /></td>
                      <td className="py-3 pr-4"><PriorityLabel priority={t.priority} /></td>
                      <td className="py-3 pr-4 tabular-nums text-muted-foreground">{t.daysOpen}d</td>
                      <td className="py-3 pr-4 text-xs uppercase tracking-wide text-muted-foreground">{t.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Today's Actions */}
          <section className="surface-card p-6">
            <SectionHead
              icon={<Sparkles className="w-5 h-5" />}
              title="Today's Actions"
              caption="What to do next"
            />
            <ul className="mt-4 space-y-2">
              {todaysActions.map((a) => (
                <li key={a.id} className="flex items-start gap-3 rounded-xl border border-border/40 bg-white/[0.015] p-3 hover:bg-white/[0.03] transition-colors">
                  <StatusDot tone={a.tone} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium leading-snug">{a.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{a.detail}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ── BENTO: ESCALATION PIPELINE + TRENDS ───────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Escalation pipeline */}
          <section className="surface-card p-6 xl:col-span-1">
            <SectionHead
              icon={<AlertTriangle className="w-5 h-5" />}
              title="Escalation Pipeline"
              caption={`${escalation.length} tickets`}
            />
            <div className="mt-4 space-y-3 max-h-[360px] overflow-auto pr-1">
              {escalation.map((t) => {
                const list = comments[t.id] ?? [];
                return (
                  <div key={t.id} className="rounded-xl border border-border/50 bg-white/[0.015] p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-primary">{t.id}</span>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground/60" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{t.description}</p>
                    {list.length > 0 && (
                      <ul className="mt-3 space-y-2 border-t border-border/40 pt-3">
                        {list.map((c, i) => (
                          <li key={i} className="text-xs">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <MessageSquare className="w-3 h-3" />
                              <span className="font-medium text-foreground">{c.author}</span>
                              <span>· {c.at}</span>
                            </div>
                            <p className="text-foreground/90 mt-0.5 whitespace-pre-wrap">{c.text}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button
                      onClick={() => openFor(t.id)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" /> Add comment
                    </button>
                  </div>
                );
              })}
              {escalation.length === 0 && (
                <p className="text-sm text-muted-foreground">No escalations. All clear.</p>
              )}
            </div>
          </section>

          {/* Ticket Volume Trends */}
          <section className="surface-card p-6 xl:col-span-1">
            <SectionHead
              icon={<Activity className="w-5 h-5" />}
              title="Ticket Volume"
              caption="By category · June 2026"
            />
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ticketVolume} margin={{ top: 16, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
                <Bar dataKey="neutral"    stackId="a" name="Neutral"    fill="var(--muted-foreground)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="negative"   stackId="a" name="Negative"   fill="var(--neon-amber)" />
                <Bar dataKey="frustrated" stackId="a" name="Frustrated" fill="var(--neon-red)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* Sentiment */}
          <section className="surface-card p-6 xl:col-span-1">
            <SectionHead
              icon={<Users className="w-5 h-5" />}
              title="Sentiment Severity"
              caption="Volume vs. category"
            />
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart margin={{ top: 16, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="category" type="category" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="count" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <ZAxis dataKey="count" range={[60, 260]} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
                <Scatter name="Neutral"    data={sentimentScatter.filter((s) => s.sentiment === "Neutral")}    fill="var(--muted-foreground)" />
                <Scatter name="Negative"   data={sentimentScatter.filter((s) => s.sentiment === "Negative")}   fill="var(--neon-amber)" />
                <Scatter name="Frustrated" data={sentimentScatter.filter((s) => s.sentiment === "Frustrated")} fill="var(--neon-red)" />
              </ScatterChart>
            </ResponsiveContainer>
          </section>
        </div>
      </div>

      {/* Comment dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add comment{activeTicket ? ` — ${activeTicket}` : ""}</DialogTitle>
            <DialogDescription>Your comment will be attached to this escalation ticket.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a comment about this ticket…"
            rows={5}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submitComment}>Post comment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

/* ─────────── Sub-components ─────────── */

function HealthBanner({
  health, slaBreaches, active, emergencies, criticalAlerts,
}: {
  health: Health; slaBreaches: number; active: number; emergencies: number; criticalAlerts: number;
}) {
  const cfg = {
    healthy:  { label: "Business is healthy",     Icon: CheckCircle2, tone: "text-[var(--neon-green)]", ring: "ring-[var(--neon-green)]/25", bar: "bg-[var(--neon-green)]" },
    warning:  { label: "Attention needed",        Icon: AlertTriangle, tone: "text-[var(--neon-amber)]", ring: "ring-[var(--neon-amber)]/25", bar: "bg-[var(--neon-amber)]" },
    critical: { label: "Critical: act immediately", Icon: ShieldAlert, tone: "text-[var(--neon-red)]",   ring: "ring-[var(--neon-red)]/30",   bar: "bg-[var(--neon-red)]" },
  }[health];
  const { Icon } = cfg;

  const summary =
    health === "critical"
      ? `${slaBreaches} SLA breaches and ${emergencies} emergency ticket${emergencies !== 1 ? "s" : ""} are open.`
      : health === "warning"
      ? `${slaBreaches} SLA breaches trending upward. Resolution time is improving.`
      : `All SLAs within target. ${active} active tickets under management.`;

  return (
    <section className={cn("surface-card p-6 ring-1", cfg.ring)}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-5">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={cn("shrink-0 w-1 rounded-full self-stretch", cfg.bar)} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Icon className={cn("w-5 h-5", cfg.tone)} />
              <h2 className={cn("text-2xl font-semibold tracking-tight", cfg.tone)}>{cfg.label}</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 lg:gap-8 lg:border-l lg:border-border/60 lg:pl-8">
          <MiniStat label="Emergencies" value={emergencies} tone={emergencies ? "critical" : "healthy"} />
          <MiniStat label="SLA breaches" value={slaBreaches} tone={slaBreaches >= 7 ? "critical" : slaBreaches >= 4 ? "warning" : "healthy"} />
          <MiniStat label="AI alerts" value={criticalAlerts} tone={criticalAlerts ? "warning" : "healthy"} />
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone: Health }) {
  const toneCls = tone === "critical" ? "text-[var(--neon-red)]" : tone === "warning" ? "text-[var(--neon-amber)]" : "text-foreground";
  return (
    <div>
      <div className={cn("text-2xl font-bold tabular-nums leading-none", toneCls)}>{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1.5">{label}</div>
    </div>
  );
}

function Kpi({
  label, value, delta, trend, status, deltaBad,
}: {
  label: string; value: string; delta: string; trend: "up" | "down";
  status: "healthy" | "warning" | "critical" | "neutral"; deltaBad?: boolean;
}) {
  const Icon = trend === "up" ? TrendingUp : TrendingDown;
  const accent =
    status === "critical" ? "bg-[var(--neon-red)]" :
    status === "warning"  ? "bg-[var(--neon-amber)]" :
    status === "healthy"  ? "bg-[var(--neon-green)]" :
    "bg-muted-foreground/40";
  const valueTone = status === "critical" ? "text-[var(--neon-red)]" : "";
  const deltaTone = deltaBad
    ? "text-[var(--neon-red)]"
    : status === "healthy" ? "text-[var(--neon-green)]" : "text-muted-foreground";

  return (
    <div className="surface-card surface-card-hover p-5 flex gap-4">
      <div className={cn("w-1 rounded-full", accent)} />
      <div className="flex-1 min-w-0">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
        <div className={cn("text-4xl font-bold tracking-tight mt-2 tabular-nums", valueTone)}>{value}</div>
        <div className={cn("mt-2 text-xs flex items-center gap-1.5", deltaTone)}>
          <Icon className="w-3.5 h-3.5" /> {delta}
        </div>
      </div>
    </div>
  );
}

function SectionHead({ icon, title, caption }: { icon: React.ReactNode; title: string; caption?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      </div>
      {caption && <span className="text-xs text-muted-foreground">{caption}</span>}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Escalated" ? "bg-[var(--neon-red)]/12 text-[var(--neon-red)] border-[var(--neon-red)]/25" :
    status === "In Progress" ? "bg-[var(--neon-amber)]/12 text-[var(--neon-amber)] border-[var(--neon-amber)]/25" :
    status === "Resolved" ? "bg-[var(--neon-green)]/12 text-[var(--neon-green)] border-[var(--neon-green)]/25" :
    "bg-muted/40 text-muted-foreground border-border/60";
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs border font-medium", tone)}>
      {status}
    </span>
  );
}

function PriorityLabel({ priority }: { priority: string }) {
  const tone =
    priority === "Emergency" ? "text-[var(--neon-red)]" :
    priority === "High" || priority === "Frustrated" ? "text-[var(--neon-amber)]" :
    "text-foreground/80";
  return <span className={cn("text-sm font-medium", tone)}>{priority}</span>;
}

function StatusDot({ tone }: { tone: Health }) {
  const color =
    tone === "critical" ? "bg-[var(--neon-red)]" :
    tone === "warning" ? "bg-[var(--neon-amber)]" :
    "bg-[var(--neon-green)]";
  return (
    <span className="mt-1.5 shrink-0 relative inline-flex">
      <span className={cn("w-2 h-2 rounded-full", color)} />
      {tone !== "healthy" && (
        <span className={cn("absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-40", color)} />
      )}
    </span>
  );
}

// Unused imports guard — keep Clock/AlertTriangle referenced by TS if tree-shaken
void Clock;
