import Link from "next/link";
import { NavLink } from "./NavLink";
import { getSessionUser } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";

// App shell top nav (docs/CONTRACT.md section 5: Meetings, Features,
// Decisions, Conflicts), plus the live Record feature and demo auth state.
// Rendered once in app/layout.tsx.
export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-background/85 backdrop-blur">
      <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="Meeting Source Tracer home" className="flex items-center gap-2.5">
          {/* A claim connected back to its source. */}
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4" aria-hidden>
              <circle cx="6" cy="18" r="2.5" />
              <circle cx="18" cy="6" r="2.5" fill="currentColor" />
              <path d="M8 16.5c3-1 2-7 8-9" />
            </svg>
          </span>
          <span className="hidden font-display font-medium text-xl leading-none text-gray-900 md:inline">
            Meeting Source Tracer
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1">
          <NavLink href="/meetings">Meetings</NavLink>
          <NavLink href="/features">Features</NavLink>
          <NavLink href="/decisions">Decisions</NavLink>
          <NavLink href="/conflicts">Conflicts</NavLink>
          {user ? <NavLink href="/record">Record</NavLink> : null}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden max-w-[10rem] truncate text-sm text-gray-600 sm:inline">
                {user.name}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg px-2 py-1.5 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:px-3 sm:text-sm"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-accent px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover sm:text-sm"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
