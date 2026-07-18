import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Table2, Users, ShieldAlert, Radar, LifeBuoy, Search, Bell, Settings, HelpCircle, LogOut } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useEmpire } from "@/store/empire";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Command Center", icon: LayoutDashboard, exact: true },
  { to: "/delivery", label: "Delivery Report", icon: Table2 },
  { to: "/vendors", label: "Vendor Matrix", icon: Users },
  { to: "/fraud", label: "AI Fraud Detection", icon: ShieldAlert },
  { to: "/support", label: "Customer Portal", icon: LifeBuoy },
];

export function AppShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { alerts, markAlertsRead } = useEmpire();
  const unread = alerts.filter((a) => !a.read).length;
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-16 shrink-0 border-r border-border/70 bg-[var(--sidebar)] py-4">
        <div className="flex flex-col items-center gap-1 flex-1">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link key={n.to} to={n.to} className={cn(
                "relative grid place-items-center w-11 h-11 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[var(--sidebar-accent)] transition group",
                active && "text-primary bg-[var(--sidebar-accent)]"
              )} title={n.label}>
                <Icon className="w-5 h-5" />
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r bg-primary shadow-[0_0_12px_var(--neon-blue)]" />}
              </Link>
            );
          })}
        </div>
        <div className="flex flex-col items-center gap-1">
          <button className="grid place-items-center w-11 h-11 rounded-lg text-muted-foreground hover:text-foreground"><HelpCircle className="w-5 h-5" /></button>
          <button className="grid place-items-center w-11 h-11 rounded-lg text-muted-foreground hover:text-foreground"><Settings className="w-5 h-5" /></button>
          <button className="grid place-items-center w-11 h-11 rounded-lg text-muted-foreground hover:text-foreground"><LogOut className="w-5 h-5" /></button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-border/70 bg-[var(--panel)]/60 backdrop-blur px-4 md:px-6 flex items-center gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Radar className="w-6 h-6 text-primary drop-shadow-[0_0_8px_var(--neon-blue)]" />
            <span className="text-xl font-semibold tracking-tight">Empire</span>
            <span className="text-muted-foreground/70 mx-2 hidden sm:inline">/</span>
            <span className="text-sm text-muted-foreground truncate hidden sm:inline">{title}</span>
          </div>

          <div className="flex-1" />

          <div className="hidden lg:flex items-center gap-2 px-3 h-9 w-72 rounded-md bg-[var(--panel-elevated)] border border-border/70 text-sm text-muted-foreground">
            <Search className="w-4 h-4" />
            <span>Search tickets, suppliers, alerts…</span>
          </div>

          <Popover open={open} onOpenChange={(v) => { setOpen(v); if (v) markAlertsRead(); }}>
            <PopoverTrigger asChild>
              <button className="relative w-10 h-10 grid place-items-center rounded-md hover:bg-[var(--panel-elevated)]">
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold grid place-items-center bg-[var(--neon-red)] text-white shadow-[0_0_10px_var(--neon-red)]">
                    {unread}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96 p-0 border-border/70">
              <div className="p-3 border-b border-border/70 flex items-center justify-between">
                <div className="font-semibold">AI Alerts</div>
                <Badge variant="outline" className="text-xs">{alerts.length} active</Badge>
              </div>
              <div className="max-h-96 overflow-auto divide-y divide-border/60">
                {alerts.map((a) => (
                  <div key={a.id} className="p-3 hover:bg-[var(--panel-elevated)]">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full",
                        a.severity === "critical" ? "bg-[var(--neon-red)] shadow-[0_0_8px_var(--neon-red)]" :
                        a.severity === "warning" ? "bg-[var(--neon-amber)]" : "bg-[var(--neon-blue)]")} />
                      <div className="font-medium text-sm">{a.kind}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{a.detail}</div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-2">
            <div className="hidden md:block text-right text-xs leading-tight">
              <div className="font-medium">Admin</div>
              <div className="text-muted-foreground">Operations</div>
            </div>
            <Avatar className="w-9 h-9 border border-border/70">
              <AvatarFallback className="bg-[var(--panel-elevated)] text-foreground text-xs">AD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page header */}
        <div className="px-4 md:px-8 pt-6 pb-3">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>

        <main className="flex-1 px-4 md:px-8 pb-10">{children}</main>

        <footer className="border-t border-border/70 px-6 h-10 flex items-center justify-between text-xs text-muted-foreground">
          <span>Data refreshing: June 1, 2026 – June 30, 2026</span>
          <span className="flex items-center gap-2">System Status: <span className="w-2 h-2 rounded-full bg-[var(--neon-green)] shadow-[0_0_8px_var(--neon-green)]" /> Live · Online</span>
        </footer>
      </div>
    </div>
  );
}
