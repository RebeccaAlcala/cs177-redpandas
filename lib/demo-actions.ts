"use server";

// Server actions behind the "Import meeting data" / "Clear" toggle.
// They flip the `mst_demo` cookie and revalidate the pages that read it, so
// the seed backlog appears or disappears on the next render.

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { DEMO_COOKIE } from "./demo";

const DEMO_PATHS = ["/meetings", "/conflicts", "/decisions", "/features"];

export async function importDemoData(): Promise<void> {
  const store = await cookies();
  store.set(DEMO_COOKIE, "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: "lax",
  });
  for (const p of DEMO_PATHS) revalidatePath(p);
}

export async function clearDemoData(): Promise<void> {
  const store = await cookies();
  store.delete(DEMO_COOKIE);
  for (const p of DEMO_PATHS) revalidatePath(p);
}
