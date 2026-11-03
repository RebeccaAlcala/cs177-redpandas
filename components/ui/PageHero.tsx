import { DotField } from "./DotField";

// Dark banner for the top-level pages: title, subtitle, and a few headline
// numbers computed from the data on that page.
export function PageHero({
  title,
  subtitle,
  stats = [],
}: {
  title: string;
  subtitle?: string;
  stats?: { label: string; value: number | string }[];
}) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl bg-deep px-6 py-8 text-white sm:px-10 sm:py-10">
      <DotField className="text-emerald-200/70 [mask-image:linear-gradient(to_right,transparent_30%,black_55%,transparent_80%)]" />
      <div className="relative flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
        <div className="max-w-xl">
          <h1 className="font-display font-medium text-5xl leading-none tracking-tight sm:text-6xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 text-base leading-relaxed text-white/75">{subtitle}</p>
          ) : null}
        </div>
        {stats.length > 0 ? (
          <dl className="flex gap-8 sm:gap-10">
            {stats.map((s) => (
              <div key={s.label}>
                <dd className="font-display font-medium text-4xl leading-none sm:text-5xl">{s.value}</dd>
                <dt className="mt-2 text-xs text-white/70">{s.label}</dt>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </div>
  );
}

export default PageHero;
