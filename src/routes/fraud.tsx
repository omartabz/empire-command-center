import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useEmpire } from "@/store/empire";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertOctagon, TrendingDown, Activity, ShieldAlert, DollarSign, Radio } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart } from "recharts";

export const Route = createFileRoute("/fraud")({
  head: () => ({ meta: [{ title: "AI Fraud Detection Framework — Empire" }] }),
  component: FraudPage,
});

const ICONS: Record<string, typeof AlertOctagon> = {
  "Anomaly Detected": Activity,
  "Revenue Deviation 24%": TrendingDown,
  "Supply Chain Bottleneck": Radio,
  "High-Risk Supplier Flag": ShieldAlert,
  "Data Breach Alert": AlertOctagon,
  "Unusual Spend Pattern": DollarSign,
};

const spark = Array.from({ length: 24 }, (_, i) => ({ i, v: 30 + Math.sin(i / 2) * 12 + (i > 18 ? (i - 18) * 6 : 0) }));

function FraudPage() {
  const { alerts } = useEmpire();

  return (
    <AppShell title="Empire AI Model — Fraud Detection Framework" subtitle="Real-time anomaly detection across ledger, supply, spend, and access streams.">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Sphere */}
        <Card className="panel xl:col-span-3 relative min-h-[520px] overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(56,189,248,0.15),_transparent_55%)]" />
          {/* code streams */}
          <div className="absolute left-0 top-0 h-full w-40 opacity-40 pointer-events-none">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="text-[10px] font-mono text-cyan-300/60" style={{ transform: `translateY(${i * 14}px)` }}>
                {Math.random().toString(16).slice(2, 12)}
              </div>
            ))}
          </div>
          <div className="absolute right-0 top-0 h-full w-40 opacity-30 pointer-events-none">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="text-[10px] font-mono text-red-400/60 text-right pr-2" style={{ transform: `translateY(${i * 14}px)` }}>
                {Math.random().toString(16).slice(2, 10)}
              </div>
            ))}
          </div>

          <div className="relative w-[360px] h-[360px]">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_35%,_rgba(56,189,248,0.9),_rgba(56,189,248,0.15)_45%,_transparent_70%)] pulse-slow" />
            <div className="absolute inset-6 rounded-full border border-cyan-400/40 spin-slow" style={{ boxShadow: "inset 0 0 40px rgba(56,189,248,0.5), 0 0 60px rgba(56,189,248,0.4)" }} />
            <div className="absolute inset-14 rounded-full border border-cyan-300/30 spin-slow" style={{ animationDirection: "reverse", animationDuration: "40s" }} />
            <div className="absolute inset-24 rounded-full bg-[radial-gradient(circle,_#f43f5e_0%,_transparent_60%)] opacity-70 pulse-slow" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-widest text-cyan-300/80">Empire AI Core</div>
                <div className="text-3xl font-bold mt-1">{alerts.length}</div>
                <div className="text-[10px] text-muted-foreground">Live signals</div>
              </div>
            </div>
            {/* radiating red streams */}
            <svg className="absolute -right-32 top-1/2 -translate-y-1/2" width="240" height="200" viewBox="0 0 240 200">
              {[0, 20, -20, 40, -40].map((y, i) => (
                <path key={i} d={`M 0 ${100 + y} Q 100 ${100 + y * 2} 240 ${100 + y * 3}`} stroke="#f43f5e" strokeWidth="1.5" fill="none" opacity={0.7} />
              ))}
            </svg>
          </div>
        </Card>

        {/* Alerts sidebar */}
        <Card className="panel xl:col-span-2 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Active AI Alerts</h3>
            <Badge variant="outline" className="text-xs border-[var(--neon-red)]/50 text-[var(--neon-red)]">{alerts.length} active</Badge>
          </div>
          <div className="space-y-3 max-h-[460px] overflow-auto pr-1">
            {alerts.map((a) => {
              const Icon = ICONS[a.kind] ?? AlertOctagon;
              return (
                <div key={a.id} className="rounded-lg border border-border/60 bg-[var(--panel-elevated)]/60 p-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[var(--neon-red)] drop-shadow-[0_0_6px_var(--neon-red)]" />
                    <div className="font-semibold text-[var(--neon-red)] tracking-wide text-sm">{a.kind}</div>
                    <span className="ml-auto text-[10px] text-muted-foreground uppercase">{a.severity}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 mb-2">Empire AI Model · Analysis [Δc: 10, 12, 14]</div>
                  <p className="text-xs mb-2">{a.detail}</p>
                  <ResponsiveContainer width="100%" height={40}>
                    <AreaChart data={spark}>
                      <Area dataKey="v" stroke="var(--neon-red)" fill="var(--neon-red)" fillOpacity={0.2} strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Bottom analytical row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {["Revenue Detection", "Supply Metrics", "Unusual Spend Pattern"].map((title, i) => (
          <Card key={title} className="panel p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">{title}</h4>
              <span className="text-[10px] text-[var(--neon-red)] font-mono">ALERT</span>
            </div>
            <ResponsiveContainer width="100%" height={90}>
              <LineChart data={spark.map((s) => ({ ...s, v: s.v + i * 4 }))}>
                <XAxis hide dataKey="i" />
                <YAxis hide />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", fontSize: 11 }} />
                <Line dataKey="v" stroke={i === 1 ? "var(--neon-blue)" : "var(--neon-red)"} strokeWidth={1.8} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
