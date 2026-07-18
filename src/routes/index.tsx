import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useEmpire } from "@/store/empire";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, Ticket as TicketIcon, ArrowUpRight, MessageSquarePlus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ScatterChart, Scatter, ZAxis, CartesianGrid, Legend } from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Internal Service Level & Performance — Empire" }] }),
  component: CommandCenter,
});

function CommandCenter() {
  const { kpis, ticketVolume, sentimentScatter, tickets, alerts } = useEmpire();
  const critical = tickets.filter((t) => t.status !== "Resolved").slice(0, 5);
  const escalation = tickets.filter((t) => t.status === "Escalated" || t.priority === "Emergency").slice(0, 4);

  return (
    <AppShell title="Internal Service Level & Performance Dashboard" subtitle="Period: June 1, 2026 – June 30, 2026 · Live Status: Online">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Avg. Resolution Time" value={`${kpis.avgResolution} days`} delta="-5%" trend="down" good />
        <Kpi label="NPS" value={`+${kpis.nps}`} delta="+3%" trend="up" good />
        <Kpi label="SLA Breaches" value={String(kpis.slaBreaches)} delta="+2" trend="up" critical />
        <Kpi label="Active Tickets" value={String(kpis.active)} delta="+15" trend="up" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <Card className="panel p-4 xl:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Ticket Volume Trends by Category</h3>
            <span className="text-xs text-muted-foreground">June 2026</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ticketVolume}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="frustrated" stackId="a" fill="var(--neon-red)" />
              <Bar dataKey="negative" stackId="a" fill="var(--neon-blue)" />
              <Bar dataKey="neutral" stackId="a" fill="var(--neon-green)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="panel p-4 xl:col-span-1">
          <h3 className="font-semibold mb-3">Sentiment Severity vs. Categorical Trends</h3>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="category" type="category" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis dataKey="count" stroke="var(--muted-foreground)" fontSize={11} />
              <ZAxis dataKey="count" range={[60, 260]} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Scatter name="Frustrated" data={sentimentScatter.filter((s) => s.sentiment === "Frustrated")} fill="var(--neon-red)" />
              <Scatter name="Negative" data={sentimentScatter.filter((s) => s.sentiment === "Negative")} fill="var(--neon-amber)" />
              <Scatter name="Neutral" data={sentimentScatter.filter((s) => s.sentiment === "Neutral")} fill="var(--neon-blue)" />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>

        {/* Escalation Pipeline */}
        <Card className="panel p-4 xl:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Escalation Pipeline</h3>
            <Badge variant="outline" className="text-xs">Key Tickets</Badge>
          </div>
          <div className="space-y-3 max-h-[260px] overflow-auto pr-1">
            {escalation.map((t) => (
              <div key={t.id} className="rounded-md border border-border/70 bg-[var(--panel-elevated)]/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">{t.id}</span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-[10px]">ENG-1045: Integration Sync Fix</Badge>
                </div>
              </div>
            ))}
            {escalation.length === 0 && <p className="text-sm text-muted-foreground">No escalations.</p>}
          </div>
          <button className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-primary hover:underline">
            <MessageSquarePlus className="w-4 h-4" /> Add comment…
          </button>
        </Card>
      </div>

      {/* Critical tickets + Knowledge base */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <Card className="panel p-4 xl:col-span-2">
          <h3 className="font-semibold mb-3">Critical Tickets requiring Attention (Escalated & Open)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border/70">
                  <th className="py-2 pr-4">Ticket ID</th><th className="py-2 pr-4">Status</th><th className="py-2 pr-4">Priority</th><th className="py-2 pr-4">Days Open</th><th className="py-2 pr-4">Source</th>
                </tr>
              </thead>
              <tbody>
                {critical.map((t) => (
                  <tr key={t.id} className="border-b border-border/40">
                    <td className="py-2 pr-4 font-medium">{t.id}</td>
                    <td className="py-2 pr-4"><span className={cn(
                      "px-2 py-0.5 rounded text-xs",
                      t.status === "Escalated" ? "bg-[var(--neon-red)]/15 text-[var(--neon-red)]" :
                      t.status === "In Progress" ? "bg-[var(--neon-amber)]/15 text-[var(--neon-amber)]" :
                      "bg-[var(--neon-blue)]/15 text-[var(--neon-blue)]"
                    )}>{t.status}</span></td>
                    <td className={cn("py-2 pr-4 font-medium",
                      t.priority === "Emergency" ? "text-[var(--neon-red)]" :
                      t.priority === "High" ? "text-[var(--neon-amber)]" : "")}>{t.priority}</td>
                    <td className="py-2 pr-4">{t.daysOpen}</td>
                    <td className="py-2 pr-4 text-muted-foreground text-xs uppercase">{t.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="panel p-4">
          <h3 className="font-semibold mb-3">Knowledge Base Activity</h3>
          <div className="space-y-3">
            <ActivityRow label="Most Linked Articles" value={16} />
            <ActivityRow label="Article Upvotes" value={10} />
            <ActivityRow label="AI Alert Feed" value={alerts.length} accent />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Kpi({ label, value, delta, trend, good, critical }: { label: string; value: string; delta: string; trend: "up" | "down"; good?: boolean; critical?: boolean }) {
  const Icon = trend === "up" ? TrendingUp : TrendingDown;
  return (
    <Card className={cn("panel p-4 relative overflow-hidden", critical && "border-[var(--neon-red)]/50 glow-red")}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("text-3xl font-bold mt-1", critical && "text-[var(--neon-red)]")}>{value}</div>
      <div className={cn("mt-1 text-xs flex items-center gap-1",
        critical ? "text-[var(--neon-red)]" : good ? "text-[var(--neon-green)]" : "text-muted-foreground")}>
        <Icon className="w-3 h-3" /> {delta}
      </div>
      {critical && <AlertTriangle className="w-4 h-4 text-[var(--neon-red)] absolute top-3 right-3" />}
      {!critical && trend === "up" && <TicketIcon className="w-4 h-4 text-muted-foreground/50 absolute top-3 right-3" />}
    </Card>
  );
}

function ActivityRow({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-2">
      <span className="text-sm">{label}</span>
      <span className={cn("text-lg font-semibold", accent && "text-primary")}>{value}</span>
    </div>
  );
}
