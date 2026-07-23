## What we're building

A separate **client portal** at `/portal/*`, gated by login, with its own light-themed shell and 5 sections:

1. **Support Portal** — log a new ticket (form) + Recent Logged Tickets
2. **My Deliveries** — read-only view of the client's deliveries (status, ETA, condition notes)
3. **My Tickets** — status tracker for tickets the signed-in client has logged (progress, comments)
4. **Announcements / Service Status** — Empire announcements and live system status
5. **Contact Us** — contact form + support channels (email, phone, hours)

## Access & auth

- Enable **Lovable Cloud** (Postgres + Auth).
- Add email/password + Google sign-in on a public `/auth` route.
- Create `profiles` (id, email, company, full_name) and `user_roles` (`app_role` enum: `admin`, `client`) tables with RLS + `has_role()` security-definer function (per platform pattern — roles never on profiles).
- New signups default to the `client` role via a trigger.
- New `_authenticated/portal/*` subtree (integration-managed gate) — signed-in users land here. Admin users can still reach the existing internal dashboards.

## Portal shell

- Its own light-themed shell (`PortalShell`) with logo variation, top bar (profile menu, notifications), and left nav for the 5 sections.
- The existing dark internal shell stays for `/`, `/delivery`, `/vendors`, `/fraud` (admin only).

## Data model additions

- `tickets` table (id, user_id, title, category, priority, status, description, created_at) — RLS: clients see/write only their own; admins see all.
- `announcements` table (id, title, body, severity, published_at) — admins write, everyone reads.
- `deliveries` gains an optional `client_email` column so "My Deliveries" filters by the signed-in user; seeded mock rows for the demo client.
- The internal Command Center already reads from the same tickets store — new client tickets automatically flow into the "Active Tickets" KPI and Escalation Pipeline (Phase 4 integration preserved).

## Routes

```
src/routes/
  auth.tsx                          (public login/signup)
  _authenticated/
    route.tsx                       (managed gate)
    portal/
      route.tsx                     (PortalShell + role check → clients only)
      index.tsx                     (redirect to support)
      support.tsx                   (new ticket form + recent)
      deliveries.tsx                (My Deliveries)
      tickets.tsx                   (My Tickets tracker)
      announcements.tsx             (announcements + service status)
      contact.tsx                   (Contact Us)
```

Existing internal routes (`/`, `/delivery`, `/vendors`, `/fraud`) get admin-role gating in the same edit.

## Technical notes

- `src/integrations/supabase/*` auto-generated when Cloud is enabled.
- Server functions via `createServerFn` + `requireSupabaseAuth` for ticket create/list, deliveries-for-me, announcements list.
- Google OAuth via `lovable.auth.signInWithOAuth('google', ...)` + `supabase--configure_social_auth`.
- Light theme scoped via a `.portal-light` class on the PortalShell root; internal dashboards keep the neon-dark theme.

Ready to build?