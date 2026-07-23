import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/portal/announcements")({
  component: AnnouncementsPage,
});

interface Row { id: string; title: string; body: string; severity: string; published_at: string }

const SEVERITY: Record<string, string> = {
  info: "bg-sky-100 text-sky-800 border-sky-200",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

const SERVICES = [
  { name: "Delivery tracking", status: "operational" },
  { name: "Support portal", status: "operational" },
  { name: "Regional hub — Cape Town", status: "degraded" },
  { name: "Regional hub — Johannesburg", status: "operational" },
  { name: "Notifications", status: "operational" },
];

function AnnouncementsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    supabase.from("announcements").select("*").order("published_at", { ascending: false }).then(({ data }) => setRows(data ?? []));
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {rows.map((a) => (
          <div key={a.id} className="rounded-xl bg-white border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold">{a.title}</div>
              <Badge variant="outline" className={cn("text-[10px] uppercase", SEVERITY[a.severity])}>{a.severity}</Badge>
            </div>
            <p className="text-sm text-slate-600 mt-2">{a.body}</p>
            <div className="text-xs text-slate-400 mt-3">{new Date(a.published_at).toLocaleString()}</div>
          </div>
        ))}
        {rows.length === 0 && <div className="text-sm text-slate-500">No announcements right now.</div>}
      </div>

      <aside className="rounded-xl bg-white border border-slate-200 p-5">
        <div className="text-xs font-semibold tracking-widest text-slate-500 mb-3">SERVICE STATUS</div>
        <ul className="space-y-3">
          {SERVICES.map((s) => (
            <li key={s.name} className="flex items-center justify-between text-sm">
              <span>{s.name}</span>
              <span className="flex items-center gap-2 text-xs">
                <span className={cn("w-2 h-2 rounded-full", s.status === "operational" ? "bg-emerald-500" : "bg-amber-500")} />
                <span className={cn(s.status === "operational" ? "text-emerald-700" : "text-amber-700")}>{s.status === "operational" ? "Operational" : "Degraded"}</span>
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
