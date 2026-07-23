import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/portal/deliveries")({
  component: DeliveriesPage,
});

interface Row { id: string; ref: string; item: string; supplier: string; status: "Delivered" | "In Transit" | "Delayed" | "Scheduled"; qty: number; eta: string; notes: string }

const MOCK: Row[] = [
  { id: "d1", ref: "PO-88214", item: "Safety helmets (Bulk)", supplier: "Ndlovu Safety Gear", status: "Delivered", qty: 120, eta: "2026-06-24", notes: "Delivered as expected." },
  { id: "d2", ref: "PO-88251", item: "Print collateral — brochures", supplier: "Amandla Print Works", status: "In Transit", qty: 500, eta: "2026-07-02", notes: "On the road from Cape Town depot." },
  { id: "d3", ref: "PO-88266", item: "Catering — off-site event", supplier: "Ikhaya Catering", status: "Scheduled", qty: 1, eta: "2026-07-08", notes: "Confirmed for 07:30 arrival." },
  { id: "d4", ref: "PO-88198", item: "Office supplies (Q3 restock)", supplier: "Kwezi Office Supplies", status: "Delayed", qty: 42, eta: "2026-07-04", notes: "Regional bottleneck at Cape Town hub. ETA +48h." },
  { id: "d5", ref: "PO-88129", item: "Cleaning services — monthly", supplier: "Metsi Cleaning Services", status: "Delivered", qty: 1, eta: "2026-06-30", notes: "Completed and signed off." },
];

const COLOR: Record<Row["status"], string> = {
  "Delivered": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "In Transit": "bg-sky-100 text-sky-800 border-sky-200",
  "Scheduled": "bg-slate-100 text-slate-700 border-slate-200",
  "Delayed": "bg-red-100 text-red-800 border-red-200",
};

function DeliveriesPage() {
  return (
    <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
          <tr>
            <th className="text-left px-4 py-3">Reference</th>
            <th className="text-left px-4 py-3">Item</th>
            <th className="text-left px-4 py-3">Supplier</th>
            <th className="text-left px-4 py-3">Qty</th>
            <th className="text-left px-4 py-3">ETA</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-left px-4 py-3">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {MOCK.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-mono text-xs">{r.ref}</td>
              <td className="px-4 py-3 font-medium">{r.item}</td>
              <td className="px-4 py-3 text-slate-600">{r.supplier}</td>
              <td className="px-4 py-3">{r.qty}</td>
              <td className="px-4 py-3">{r.eta}</td>
              <td className="px-4 py-3"><Badge variant="outline" className={cn("text-[10px]", COLOR[r.status])}>{r.status}</Badge></td>
              <td className="px-4 py-3 text-slate-600 text-xs">{r.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
