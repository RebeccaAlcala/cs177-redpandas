import type { ReactNode } from "react";
import Link from "next/link";

// One filter option, as a link so filters work in server components and the
// filtered view can be shared by URL. Used by /decisions and /conflicts.
export function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors ${
        active
          ? "bg-gray-900 text-white ring-gray-900"
          : "bg-white text-gray-700 ring-gray-300 hover:bg-gray-50"
      }`}
    >
      {children}
    </Link>
  );
}

export default FilterPill;
