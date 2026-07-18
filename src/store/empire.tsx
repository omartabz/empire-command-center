import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type DeliveryStatus = "Delivered" | "Delivered (Late)" | "Partial" | "N/A";
export interface DeliveryRow {
  id: string;
  supplier: string;
  status: DeliveryStatus;
  qty: number;
  date: string;
  notes: string;
}

export type TicketStatus = "Open" | "In Progress" | "Escalated" | "Resolved";
export type TicketPriority = "Emergency" | "High" | "Medium" | "Low" | "Neutral" | "Negative" | "Frustrated";
export type TicketCategory = "Integration" | "Data Quality" | "Billing" | "Login Access" | "Other" | "Negative" | "Positive" | "Frustrated";
export interface Ticket {
  id: string;
  title: string;
  email: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  daysOpen: number;
  createdAt: string;
  description: string;
  attachment?: string;
  source: "customer" | "internal";
}

export type AlertKind =
  | "Anomaly Detected"
  | "Revenue Deviation 24%"
  | "Supply Chain Bottleneck"
  | "High-Risk Supplier Flag"
  | "Data Breach Alert"
  | "Unusual Spend Pattern";
export interface AiAlert {
  id: string;
  kind: AlertKind;
  detail: string;
  severity: "critical" | "warning" | "info";
  createdAt: string;
  read?: boolean;
}

const SUPPLIERS = [
  "Ubuntu Logistics", "Ikhaya Catering", "CapePoint Facilities",
  "Amandla Print Works", "Kwezi Office Supplies", "Ndlovu Safety Gear",
  "Mabena Tech", "Metsi Cleaning Services", "Sisonke Maintenance",
  "Bayline Electrical", "Thrive HR Consultants", "Limpopo Packaging Co",
];

const seedDeliveries = (): DeliveryRow[] => [
  { id: "d1", supplier: "Ottam Baltford", status: "Delivered", qty: 20, date: "2026-01-24", notes: "Delivered as expected." },
  { id: "d2", supplier: "Amandla Print Works", status: "Delivered", qty: 20, date: "2026-01-24", notes: "Delivered as expected." },
  { id: "d3", supplier: "Print Companies", status: "Delivered", qty: 20, date: "2026-01-24", notes: "Delivered as expected." },
  { id: "d4", supplier: "Canner Supplies", status: "Delivered", qty: 20, date: "2026-01-24", notes: "Delivered as expected." },
  { id: "d5", supplier: "Ikhaya Catering", status: "Delivered (Late)", qty: 3, date: "2026-02-05", notes: "Labels differed from PO description but goods usable." },
  { id: "d6", supplier: "Alkanya Print Works", status: "Partial", qty: 20, date: "2026-02-24", notes: "Delivered as expected." },
  { id: "d7", supplier: "Amandla Print Works", status: "Partial", qty: 10, date: "2026-03-05", notes: "Delivered as expected." },
  { id: "d8", supplier: "Ikhaya Catering", status: "Delivered", qty: 10, date: "2026-03-04", notes: "Delivered as expected." },
  { id: "d9", supplier: "Ikhaya Catering", status: "Delivered (Late)", qty: 20, date: "2026-03-04", notes: "Delivered as expected." },
  { id: "d10", supplier: "Amandla Print Works", status: "Delivered (Late)", qty: 105, date: "N/A", notes: "Delivered as expected." },
];

const seedTickets = (): Ticket[] => [
  { id: "TCK-0024", title: "Integration sync failing", email: "ops@empire.co", category: "Integration", priority: "Emergency", status: "Escalated", daysOpen: 0, createdAt: "2026-06-28", description: "Integration payloads dropping intermittently.", source: "internal" },
  { id: "TCK-0023", title: "Data quality drift", email: "ops@empire.co", category: "Data Quality", priority: "High", status: "Open", daysOpen: 0, createdAt: "2026-06-27", description: "Vendor rows arriving with null fields.", source: "internal" },
  { id: "TCK-0028", title: "Billing mismatch", email: "billing@empire.co", category: "Billing", priority: "Medium", status: "Escalated", daysOpen: 0, createdAt: "2026-06-26", description: "Invoice totals differ from PO.", source: "internal" },
  { id: "TCK-0021", title: "Login access lost", email: "user@empire.co", category: "Login Access", priority: "Medium", status: "Open", daysOpen: 0, createdAt: "2026-06-25", description: "SSO redirect loop for finance group.", source: "internal" },
  { id: "CUST-011", title: "Correct support of sentiment", email: "customont@gmail.com", category: "Integration", priority: "Neutral", status: "Open", daysOpen: 1, createdAt: "2026-03-15", description: "Correct support of sentiment.", source: "customer" },
  { id: "CUST-012", title: "Late shipment", email: "customont@gmail.com", category: "Negative", priority: "Negative", status: "Open", daysOpen: 2, createdAt: "2026-03-14", description: "Shipment arrived past SLA.", source: "customer" },
  { id: "CUST-013", title: "Portal error", email: "customont@gmail.com", category: "Frustrated", priority: "Frustrated", status: "Open", daysOpen: 2, createdAt: "2026-03-14", description: "Portal 500 error at checkout.", source: "customer" },
  { id: "CUST-014", title: "Great experience", email: "customont@gmail.com", category: "Positive", priority: "Neutral", status: "Resolved", daysOpen: 3, createdAt: "2026-03-13", description: "Really appreciate the fast turnaround.", source: "customer" },
];

const seedAlerts = (): AiAlert[] => [
  { id: "a1", kind: "Anomaly Detected", detail: "Model flagged unusual signal on ledger stream 10, 12, 14.", severity: "critical", createdAt: "2026-06-30T08:41:00Z" },
  { id: "a2", kind: "Revenue Deviation 24%", detail: "Regional revenue down 24% vs 30d baseline.", severity: "critical", createdAt: "2026-06-30T08:12:00Z" },
  { id: "a3", kind: "Supply Chain Bottleneck", detail: "Bottleneck detected at Cape Town hub.", severity: "warning", createdAt: "2026-06-30T07:55:00Z" },
  { id: "a4", kind: "High-Risk Supplier Flag", detail: "Amandla Print Works: repeated late deliveries.", severity: "critical", createdAt: "2026-06-30T07:30:00Z" },
  { id: "a5", kind: "Data Breach Alert", detail: "Credential stuffing attempts on admin surface.", severity: "critical", createdAt: "2026-06-30T06:59:00Z" },
  { id: "a6", kind: "Unusual Spend Pattern", detail: "Category spend 3σ above rolling mean.", severity: "warning", createdAt: "2026-06-30T06:12:00Z" },
];

interface Ctx {
  deliveries: DeliveryRow[];
  addDelivery: (r: Omit<DeliveryRow, "id">) => void;
  suppliers: string[];
  tickets: Ticket[];
  addTicket: (t: Omit<Ticket, "id" | "daysOpen" | "createdAt" | "status" | "source"> & { id?: string }) => Ticket;
  alerts: AiAlert[];
  markAlertsRead: () => void;
  supplierRatings: { name: string; rating: number; percent: number; color: string }[];
  kpis: { avgResolution: number; nps: number; slaBreaches: number; active: number };
  ticketVolume: { category: string; frustrated: number; negative: number; neutral: number }[];
  sentimentScatter: { category: string; sentiment: "Frustrated" | "Negative" | "Neutral"; count: number }[];
}

const EmpireCtx = createContext<Ctx | null>(null);

const RATING_COLORS = ["#6ee7ff", "#a78bfa", "#f472b6", "#f87171", "#fbbf24", "#34d399", "#f0abfc", "#93c5fd", "#fde68a", "#fca5a5", "#c4b5fd", "#5eead4"];

export function EmpireProvider({ children }: { children: ReactNode }) {
  const [deliveries, setDeliveries] = useState<DeliveryRow[]>(seedDeliveries);
  const [tickets, setTickets] = useState<Ticket[]>(seedTickets);
  const [alerts, setAlerts] = useState<AiAlert[]>(seedAlerts);

  const addDelivery: Ctx["addDelivery"] = (r) => {
    const row: DeliveryRow = { ...r, id: `d${Date.now()}` };
    setDeliveries((prev) => {
      const next = [...prev, row];
      // AI logic: 2+ late deliveries → high-risk supplier flag
      const lateCount = next.filter((d) => d.supplier === row.supplier && d.status === "Delivered (Late)").length;
      if (lateCount >= 2) {
        setAlerts((a) => {
          if (a.some((x) => x.kind === "High-Risk Supplier Flag" && x.detail.includes(row.supplier))) return a;
          return [
            { id: `a${Date.now()}`, kind: "High-Risk Supplier Flag", severity: "critical", createdAt: new Date().toISOString(), detail: `${row.supplier}: ${lateCount} late deliveries detected — auto-flagged by Empire AI.` },
            ...a,
          ];
        });
      }
      return next;
    });
  };

  const addTicket: Ctx["addTicket"] = (t) => {
    const id = t.id || `CUST-${String(15 + tickets.filter((x) => x.source === "customer").length).padStart(3, "0")}`;
    const ticket: Ticket = {
      ...t, id,
      status: "Open", daysOpen: 0, source: "customer",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setTickets((prev) => [ticket, ...prev]);
    return ticket;
  };

  const markAlertsRead = () => setAlerts((a) => a.map((x) => ({ ...x, read: true })));

  const value = useMemo<Ctx>(() => {
    const suppliers = Array.from(new Set([...deliveries.map((d) => d.supplier), ...SUPPLIERS]));

    // Supplier ratings: base 5, penalize late/partial
    const supplierRatings = SUPPLIERS.map((name, i) => {
      const rows = deliveries.filter((d) => d.supplier === name);
      const late = rows.filter((r) => r.status === "Delivered (Late)").length;
      const partial = rows.filter((r) => r.status === "Partial").length;
      const raw = Math.max(1, 5 - late * 0.7 - partial * 0.4 + Math.sin(i) * 0.2);
      return { name, rating: Math.round(raw * 10) / 10, weight: raw, color: RATING_COLORS[i % RATING_COLORS.length] };
    });
    const totalW = supplierRatings.reduce((s, x) => s + x.weight, 0);
    const withPct = supplierRatings.map((s) => ({ name: s.name, rating: s.rating, color: s.color, percent: Math.round((s.weight / totalW) * 1000) / 10 }));

    const active = tickets.filter((t) => t.status !== "Resolved").length;
    const slaBreaches = tickets.filter((t) => t.priority === "Emergency" || t.priority === "Frustrated").length + 5;
    const avgResolution = Math.max(0.5, 3.8 + (tickets.filter((t) => t.source === "customer").length - 4) * 0.15);
    const kpis = { avgResolution: Math.round(avgResolution * 10) / 10, nps: 32, slaBreaches, active: active + 140 };

    const cats: Array<Ticket["category"]> = ["Integration", "Data Quality", "Billing", "Login Access"];
    const ticketVolume = cats.map((c) => {
      const inCat = tickets.filter((t) => t.category === c);
      return {
        category: c,
        frustrated: 40 + inCat.filter((t) => t.priority === "Frustrated" || t.priority === "Emergency").length * 20,
        negative: 60 + inCat.filter((t) => t.priority === "Negative" || t.priority === "High").length * 15,
        neutral: 80 + inCat.length * 5,
      };
    });

    const sentimentScatter = cats.flatMap((c) => ([
      { category: c, sentiment: "Frustrated" as const, count: 8 + tickets.filter((t) => t.category === c && (t.priority === "Frustrated" || t.priority === "Emergency")).length * 4 },
      { category: c, sentiment: "Negative" as const, count: 14 + tickets.filter((t) => t.category === c && t.priority === "Negative").length * 3 },
      { category: c, sentiment: "Neutral" as const, count: 22 },
    ]));

    return { deliveries, addDelivery, suppliers, tickets, addTicket, alerts, markAlertsRead, supplierRatings: withPct, kpis, ticketVolume, sentimentScatter };
  }, [deliveries, tickets, alerts]);

  return <EmpireCtx.Provider value={value}>{children}</EmpireCtx.Provider>;
}

export function useEmpire() {
  const c = useContext(EmpireCtx);
  if (!c) throw new Error("useEmpire must be inside EmpireProvider");
  return c;
}
