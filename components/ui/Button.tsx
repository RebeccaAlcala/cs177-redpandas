import type { ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary";

const base =
  "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-gray-900 text-white hover:bg-gray-800",
  secondary: "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
};

// Simple shared Button. Renders a Next <Link> when `href` is given, otherwise
// a <button>. onClick/type are for use inside client components.
export function Button({
  children,
  variant = "primary",
  href,
  type = "button",
  onClick,
  disabled,
  className = "",
}: {
  children: ReactNode;
  variant?: Variant;
  href?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export default Button;
