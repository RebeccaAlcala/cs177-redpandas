"use server";

// Server actions for the demo login. Setting/clearing cookies must happen in a
// Server Action or Route Handler, so they live here.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "./auth";

const WEEK = 60 * 60 * 24 * 7;

export async function signIn(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  // On missing input, bounce back to the login page with a flag.
  if (!name || !email) redirect("/login?error=missing");

  const store = await cookies();
  store.set(
    SESSION_COOKIE,
    encodeURIComponent(JSON.stringify({ name, email })),
    { httpOnly: true, sameSite: "lax", path: "/", maxAge: WEEK },
  );
  redirect("/record");
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/");
}
