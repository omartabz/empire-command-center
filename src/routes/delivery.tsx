import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useEmpire, type DeliveryStatus } from "@/store/empire";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Filter, ArrowUpDown, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/delivery")({
  head: () => ({ meta: [{ title: "Supplier Delivery Report — Empire" }] }),
  component: DeliveryPage,
});

const STATUS_STYLES: Record<DeliveryStatus, string> = {
  "Delivered": "bg-sky-500/10 text-sky-300 border-sky-500/30",
  "Delivered (Late)": "bg-red-600/25 text-red-200 border-red-500/40",
  "Partial": "bg-amber-400/20 text-amber-200 border-amber-400/40",
  "N/A": "bg-muted text-muted-foreground border-border",
};

const ROW_TINT: Record<DeliveryStatus, string> = {
  "Delivered": "",
  "Delivered (Late)": "bg-red-950/40",
  "Partial": "bg-amber-950/30",
  "N/A": "",
};

function DeliveryPage() {
  const { deliveries, addDelivery, suppliers } = useEmpire();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortByStatus, setSortByStatus] = useState(false);

  const filtered = useMemo(() => {
    let d = deliveries.filter((r) =>
      (statusFilter === "all" || r.status === statusFilter) &&
      (q === "" || r.supplier.toLowerCase().includes(q.toLowerCase()) || r.notes.toLowerCase().includes(q.toLowerCase()))
    );
    if (sortByStatus) d = [...d].sort((a, b) => a.status.localeCompare(b.status));
    return d;
  }, [deliveries, q, statusFilter, sortByStatus]);

  const lateBySupplier = useMemo(() => {
    const map = new Map<string, number>();
    deliveries.forEach((d) => { if (d.status === "Delivered (Late)") map.set(d.supplier, (map.get(d.supplier) ?? 0) + 1); });
    return Array.from(map, ([supplier, count]) => ({ supplier: supplier.split(" ")[0], count })).slice(0, 5);
  }, [deliveries]);

  const [newRow, setNewRow] = useState({ supplier: suppliers[0], status: "Delivered" as DeliveryStatus, qty: 1, date: new Date().toISOString().slice(0, 10), notes: "" });

  return (
    <AppShell title="Empire · Project Management" subtitle="Projects › Supplier Performance › Delivery Report">
      <Card className="panel p-0 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border/70 bg-[var(--panel-elevated)]/60">
          <div className="text-lg font-semibold uppercase tracking-wide mr-auto">Supplier Delivery Performance</div>
          <Input placeholder="Search suppliers, notes…" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-64 bg-[var(--panel)]" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-44"><Filter className="w-3.5 h-3.5 mr-1" /><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Delivered (Late)">Delivered (Late)</SelectItem>
              <SelectItem value="Partial">Partial</SelectItem>
              <SelectItem value="N/A">N/A</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setSortByStatus((s) => !s)}><ArrowUpDown className="w-3.5 h-3.5 mr-1" /> Sort {sortByStatus ? "on" : "off"}</Button>
          <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5 mr-1" /> Export</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-[var(--panel-elevated)]/40 border-b border-border/70">
                <th className="px-4 py-3">Supplier Name</th>
                <th className="px-4 py-3">Delivery Status</th>
                <th className="px-4 py-3">Qty Received</th>
                <th className="px-4 py-3">Actual Delivery Date</th>
                <th className="px-4 py-3">Delivery Condition Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className={cn("border-b border-border/40", ROW_TINT[r.status])}>
                  <td className="px-4 py-3 font-medium">{r.supplier}</td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs border", STATUS_STYLES[r.status])}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">{r.qty}</td>
                  <td className="px-4 py-3">{r.date}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.notes}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No rows match.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add row */}
        <div className="p-3 border-t border-border/70 bg-[var(--panel-elevated)]/40 flex flex-wrap items-end gap-2">
          <div className="flex flex-col text-xs">
            <label className="text-muted-foreground mb-1">Supplier</label>
            <Select value={newRow.supplier} onValueChange={(v) => setNewRow({ ...newRow, supplier: v })}>
              <SelectTrigger className="h-8 w-52"><SelectValue /></SelectTrigger>
              <SelectContent>{suppliers.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col text-xs">
            <label className="text-muted-foreground mb-1">Status</label>
            <Select value={newRow.status} onValueChange={(v) => setNewRow({ ...newRow, status: v as DeliveryStatus })}>
              <SelectTrigger className="h-8 w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Delivered (Late)">Delivered (Late)</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="N/A">N/A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col text-xs">
            <label className="text-muted-foreground mb-1">Qty</label>
            <Input type="number" className="h-8 w-20 bg-[var(--panel)]" value={newRow.qty} onChange={(e) => setNewRow({ ...newRow, qty: Number(e.target.value) })} />
          </div>
          <div className="flex flex-col text-xs">
            <label className="text-muted-foreground mb-1">Date</label>
            <Input type="date" className="h-8 w-40 bg-[var(--panel)]" value={newRow.date} onChange={(e) => setNewRow({ ...newRow, date: e.target.value })} />
          </div>
          <div className="flex flex-col text-xs flex-1 min-w-[200px]">
            <label className="text-muted-foreground mb-1">Notes</label>
            <Input className="h-8 bg-[var(--panel)]" value={newRow.notes} onChange={(e) => setNewRow({ ...newRow, notes: e.target.value })} />
          </div>
          <Button onClick={() => {
            addDelivery(newRow);
            toast.success(`Row added for ${newRow.supplier}`, { description: newRow.status === "Delivered (Late)" ? "AI monitoring supplier for repeat late deliveries." : undefined });
            setNewRow({ ...newRow, notes: "" });
          }}><Plus className="w-4 h-4 mr-1" /> Add Row</Button>
        </div>
      </Card>

      {/* Quick dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card className="panel p-4 lg:col-span-1">
          <h3 className="font-semibold mb-2">Quick dashboard</h3>
          <div className="text-xs text-muted-foreground mb-2">Late Delivery Count</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={lateBySupplier}>
              <XAxis dataKey="supplier" stroke="var(--muted-foreground)" fontSize={10} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="count" fill="var(--neon-blue)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="panel p-4 lg:col-span-2 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">AI Supplier Watch</h3>
            <p className="text-sm text-muted-foreground mt-1">Flags suppliers with 2+ late deliveries and pushes an alert to the Fraud Detection dashboard automatically.</p>
          </div>
          <div className="text-4xl font-bold text-[var(--neon-red)] drop-shadow-[0_0_10px_var(--neon-red)]">
            {new Set(deliveries.filter((d) => d.status === "Delivered (Late)").map((d) => d.supplier)).size}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
