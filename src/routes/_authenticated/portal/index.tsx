import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/portal/")({
  beforeLoad: () => { throw redirect({ to: "/portal/support" }); },
});
