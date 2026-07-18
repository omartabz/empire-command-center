import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useEmpire } from "@/store/empire";
import { Card } from "@/components/ui/card";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/vendors")({
  head: () => ({ meta: [{ title: "Vendor Matrix — Empire Ratings" }] }),
  component: VendorMatrix,
});

function VendorMatrix() {
  const { supplierRatings, deliveries } = useEmpire();
  const [active, setActive] = useState<string | null>(null);

  const slices = useMemo(() => {
    const total = supplierRatings.reduce((s, r) => s + r.percent, 0);
    let acc = 0;
    return supplierRatings.map((r) => {
      const start = (acc / total) * 360;
      acc += r.percent;
      const end = (acc / total) * 360;
      return { ...r, start, end };
    });
  }, [supplierRatings]);

  const cx = 200, cy = 200, rOuter = 180, rInner = 30;
  const activeData = active ? supplierRatings.find((s) => s.name === active) : null;
  const activeDeliveries = active ? deliveries.filter((d) => d.supplier === active) : [];

  return (
    <AppShell title="Empire Supplier Rating Distribution Profile" subtitle="Interactive neon-styled distribution of supplier ratings — click any slice for details.">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="panel p-6 xl:col-span-2 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--neon-blue)/10%,_transparent_60%)] pointer-events-none" />
          <svg viewBox="0 0 400 400" className="w-full max-w-[560px]">
            <defs>
              {slices.map((s) => (
                <radialGradient key={s.name} id={`g-${s.name.replace(/\s+/g, "-")}`}>
                  <stop offset="0%" stopColor={s.color} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={s.color} stopOpacity="0.35" />
                </radialGradient>
              ))}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {slices.map((s) => {
              const isActive = active === s.name;
              const path = donutPath(cx, cy, rInner, isActive ? rOuter + 10 : rOuter, s.start, s.end);
              const mid = (s.start + s.end) / 2;
              const labelR = rOuter + 22;
              const lx = cx + labelR * Math.cos((mid - 90) * Math.PI / 180);
              const ly = cy + labelR * Math.sin((mid - 90) * Math.PI / 180);
              return (
                <g key={s.name} onClick={() => setActive(isActive ? null : s.name)} style={{ cursor: "pointer" }} filter="url(#glow)">
                  <path d={path} fill={`url(#g-${s.name.replace(/\s+/g, "-")})`} stroke={s.color} strokeWidth={isActive ? 2 : 1} opacity={active && !isActive ? 0.35 : 1} />
                  <text x={lx} y={ly} fill={s.color} fontSize="9" textAnchor="middle" opacity={0.9}>{s.name}</text>
                </g>
              );
            })}
            <circle cx={cx} cy={cy} r={rInner - 4} fill="var(--background)" stroke="var(--border)" />
            <text x={cx} y={cy - 2} fill="var(--foreground)" fontSize="10" textAnchor="middle">EMPIRE</text>
            <text x={cx} y={cy + 10} fill="var(--muted-foreground)" fontSize="7" textAnchor="middle">Vendor Matrix</text>
          </svg>
        </Card>

        <Card className="panel p-4">
          <h3 className="font-semibold mb-3">{activeData ? activeData.name : "Supplier Details"}</h3>
          {activeData ? (
            <>
              <div className="rounded-lg p-4 mb-3 border" style={{ borderColor: activeData.color, boxShadow: `0 0 24px -4px ${activeData.color}` }}>
                <div className="text-xs text-muted-foreground">Rating</div>
                <div className="text-4xl font-bold" style={{ color: activeData.color }}>{activeData.rating.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground mt-2">Distribution Share</div>
                <div className="text-xl font-semibold">{activeData.percent}%</div>
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Recent deliveries</div>
              <div className="space-y-2 max-h-64 overflow-auto">
                {activeDeliveries.length === 0 && <p className="text-sm text-muted-foreground">No delivery records yet.</p>}
                {activeDeliveries.map((d) => (
                  <div key={d.id} className="text-xs border border-border/60 rounded p-2 bg-[var(--panel-elevated)]/50">
                    <div className="flex justify-between"><span>{d.date}</span><span className="text-muted-foreground">Qty {d.qty}</span></div>
                    <div className="mt-1">{d.status}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-auto">
              {supplierRatings.map((s) => (
                <button key={s.name} onClick={() => setActive(s.name)} className="w-full flex items-center justify-between rounded-md border border-border/60 p-2 hover:bg-[var(--panel-elevated)]">
                  <span className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} /> {s.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{s.percent}% · ★{s.rating}</span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

function donutPath(cx: number, cy: number, rInner: number, rOuter: number, startDeg: number, endDeg: number) {
  const toRad = (d: number) => (d - 90) * Math.PI / 180;
  const large = endDeg - startDeg > 180 ? 1 : 0;
  const x1 = cx + rOuter * Math.cos(toRad(startDeg));
  const y1 = cy + rOuter * Math.sin(toRad(startDeg));
  const x2 = cx + rOuter * Math.cos(toRad(endDeg));
  const y2 = cy + rOuter * Math.sin(toRad(endDeg));
  const x3 = cx + rInner * Math.cos(toRad(endDeg));
  const y3 = cy + rInner * Math.sin(toRad(endDeg));
  const x4 = cx + rInner * Math.cos(toRad(startDeg));
  const y4 = cy + rInner * Math.sin(toRad(startDeg));
  return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4} Z`;
}
