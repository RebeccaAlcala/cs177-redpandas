// Server-side read of the "demo data imported" flag.
//
// The mocked seed backlog (meetings, conflicts, decisions, features) is OPT-IN:
// pages show it only once the person clicks "Import meeting data", which sets
// the `mst_demo` cookie (see lib/demo-actions.ts). Until then the pages show
// only the person's own recorded meetings (read client-side from localStorage).
//
// A cookie is used (not localStorage) so the server components that render
// these pages can decide whether to include the seed data.

import { cookies } from "next/headers";

export const DEMO_COOKIE = "mst_demo";

export async function isDemoImported(): Promise<boolean> {
  try {
    const store = await cookies();
    return store.get(DEMO_COOKIE)?.value === "1";
  } catch {
    return false;
  }
}
