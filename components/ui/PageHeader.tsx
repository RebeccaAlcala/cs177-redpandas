import type { ReactNode } from "react";

// <PageHeader title subtitle? actions? /> — (docs/CONTRACT.md section 4)
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-4xl leading-tight tracking-tight text-gray-900 sm:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-gray-600">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2 pt-2">{actions}</div>
      ) : null}
    </div>
  );
}

export default PageHeader;
