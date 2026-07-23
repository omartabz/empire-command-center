import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LifeBuoy, Package, Ticket, Megaphone, Mail, LogOut, Radar, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NAV = [
  { to: "/portal/support", label: "Support Portal", icon: LifeBuoy },
  { to: "/portal/deliveries", label: "My Deliveries", icon: Package },
  { to: "/portal/tickets", label: "My Tickets", icon: Ticket },
  { to: "/portal/announcements", label: "Announcements", icon: Megaphone },
  { to: "/portal/contact", label: "Contact Us", icon: Mail },
];

export function PortalShell({ children, title, subtitle, user }: { children: ReactNode; title: string; subtitle?: string; user: { email?: string | null; full_name?: string | null } }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const initials = (user.full_name || user.email || "C").slice(0, 2).toUpperCase();

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  return (
    <div className="portal-light min-h-screen flex w-full bg-slate-50 text-slate-900">
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200 bg-white">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-200">
          <Radar className="w-6 h-6 text-sky-600" />
          <span className="text-lg font-semibold tracking-tight">Empire</span>
          <span className="text-xs text-slate-500 ml-1">Client</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV.map((n) => {
            const active = pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link key={n.to} to={n.to} className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-sky-50 transition",
                active && "bg-sky-100 text-sky-900 font-medium"
              )}>
                <Icon className="w-4 h-4" />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-200">
          <Button variant="ghost" size="sm" className="w-full justify-start text-slate-600" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 bg-white px-4 md:px-6 flex items-center gap-4">
          <div className="text-sm text-slate-500 hidden md:block">Empire Logistics · Client Portal</div>
          <div className="flex-1" />
          <button className="w-9 h-9 grid place-items-center rounded-md hover:bg-slate-100 text-slate-600"><Bell className="w-5 h-5" /></button>
          <div className="flex items-center gap-2">
            <div className="hidden md:block text-right text-xs leading-tight">
              <div className="font-medium">{user.full_name || "Client"}</div>
              <div className="text-slate-500">{user.email}</div>
            </div>
            <Avatar className="w-9 h-9 border border-slate-200">
              <AvatarFallback className="bg-sky-100 text-sky-800 text-xs">{initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="px-4 md:px-8 pt-6 pb-3">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>

        <main className="flex-1 px-4 md:px-8 pb-10">{children}</main>

        <footer className="border-t border-slate-200 px-6 h-10 flex items-center justify-between text-xs text-slate-500 bg-white">
          <span>© Empire Logistics · Client Portal</span>
          <span className="flex items-center gap-2">Service Status: <span className="w-2 h-2 rounded-full bg-emerald-500" /> All systems normal</span>
        </footer>
      </div>
    </div>
  );
}
