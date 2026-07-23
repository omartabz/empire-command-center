import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/layout/PortalShell";

export const Route = createFileRoute("/_authenticated/portal")({
  component: PortalLayout,
});

const TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/portal": { title: "Welcome", subtitle: "Your Empire client portal" },
  "/portal/support": { title: "Log a new support ticket", subtitle: "Our team responds within 4 business hours." },
  "/portal/deliveries": { title: "My Deliveries", subtitle: "Track status, ETAs, and condition notes for your orders." },
  "/portal/tickets": { title: "My Tickets", subtitle: "Status and updates for every ticket you've logged." },
  "/portal/announcements": { title: "Announcements & Service Status", subtitle: "Updates and incidents from the Empire operations team." },
  "/portal/contact": { title: "Contact Us", subtitle: "Reach the Empire team any way that works for you." },
};

function PortalLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const meta = TITLES[pathname] ?? TITLES["/portal"];
  const [profile, setProfile] = useState<{ email: string | null; full_name: string | null }>({ email: null, full_name: null });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: p } = await supabase.from("profiles").select("email, full_name").eq("id", u.user.id).maybeSingle();
      setProfile({ email: p?.email ?? u.user.email ?? null, full_name: p?.full_name ?? null });
    })();
  }, []);

  return (
    <PortalShell title={meta.title} subtitle={meta.subtitle} user={profile}>
      <Outlet />
    </PortalShell>
  );
}
