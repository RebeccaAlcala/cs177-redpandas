import Link from "next/link";
import { NavLink } from "./NavLink";

// App shell top nav (docs/CONTRACT.md section 5: Meetings, Features,
// Decisions, Conflicts). Rendered once in app/layout.tsx.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
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
        </nav>
      </div>
    </header>
  );
}

export default SiteHeader;
