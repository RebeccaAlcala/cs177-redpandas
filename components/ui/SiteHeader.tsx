import Link from "next/link";
import { NavLink } from "./NavLink";

// App shell top nav (docs/CONTRACT.md section 5: Meetings, Features,
// Decisions, Conflicts). Rendered once in app/layout.tsx.
export function SiteHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-gray-900"
        >
          Meeting Source Tracer
        </Link>
        <nav className="flex items-center gap-1">
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
