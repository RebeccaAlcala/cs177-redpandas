// Demo auth (CLAUDE.md pivot: the app is going live for a demo). This is NOT
// real authentication — it just stores the name/email the visitor types in a
// cookie so the app can greet them and gate the recording feature. No accounts,
// no passwords, no database.

import { cookies } from "next/headers";

export const SESSION_COOKIE = "mst_session";

export type SessionUser = { name: string; email: string };

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<SessionUser>;
    if (typeof parsed.name === "string" && typeof parsed.email === "string") {
      return { name: parsed.name, email: parsed.email };
    }
    return null;
  } catch {
    return null;
  }
}
