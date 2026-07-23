import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/portal/tickets")({
  component: TicketsPage,
});

interface Row { id: string; title: string; category: string; priority: string; status: string; description: string | null; created_at: string; updated_at: string }

const STATUS_COLORS: Record<string, string> = {
  "Open": "bg-sky-100 text-sky-800 border-sky-200",
  "In Progress": "bg-amber-100 text-amber-800 border-amber-200",
  "Escalated": "bg-red-100 text-red-800 border-red-200",
  "Resolved": "bg-emerald-100 text-emerald-800 border-emerald-200",
};

function TicketsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase.from("tickets")
        .select("*").eq("user_id", u.user.id).order("created_at", { ascending: false });
      setRows(data ?? []);
      setLoading(false);
    })();
  }, []);

  const progress = (s: string) => s === "Resolved" ? 100 : s === "Escalated" ? 75 : s === "In Progress" ? 50 : 20;

  return (
    <div className="space-y-4">
      {loading && <div className="text-sm text-slate-500">Loading…</div>}
      {!loading && rows.length === 0 && (
        <div className="rounded-xl bg-white border border-slate-200 p-8 text-center text-slate-500">
          You haven't logged any tickets yet.
        </div>
      )}
      {rows.map((r) => (
        <div key={r.id} className="rounded-xl bg-white border border-slate-200 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">{r.title}</span>
                <Badge variant="outline" className={cn("text-[10px]", STATUS_COLORS[r.status] ?? "")}>{r.status}</Badge>
                <Badge variant="outline" className="text-[10px]">{r.priority}</Badge>
                <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
              </div>
              <div className="text-xs text-slate-500 mt-1">Ticket ID: {r.id.slice(0, 8).toUpperCase()} · Logged {new Date(r.created_at).toLocaleDateString()}</div>
              {r.description && <p className="text-sm text-slate-700 mt-3 whitespace-pre-wrap">{r.description}</p>}
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Progress</span><span>{progress(r.status)}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-sky-500 transition-all" style={{ width: `${progress(r.status)}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-2">
              <span>Open</span><span>In Progress</span><span>Escalated</span><span>Resolved</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
