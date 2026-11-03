import type { ReactNode } from "react";

// <Card title? children /> — (docs/CONTRACT.md section 4)
export function Card({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {title ? (
        <h3 className="mb-4 text-sm font-semibold text-gray-900">{title}</h3>
      ) : null}
      {children}
    </div>
  );
}

export default Card;
