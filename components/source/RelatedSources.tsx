import Link from "next/link";
import { formatSourceDate } from "./format";
import { TYPE_META, TypeIcon } from "./meta";
import type { RelatedSource } from "./types";

// "Related context": other sources on the same topic, as compact links to
// their /trace pages. Renders nothing when there are none.
export function RelatedSources({
  related,
  onNavigate,
}: {
  related: RelatedSource[];
  onNavigate?: () => void;
}) {
  if (!related || related.length === 0) return null;
  return (
    <section aria-label="Related context">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Related context
      </h3>
      <ul className="space-y-2">
        {related.map((r) => {
          const t = TYPE_META[r.type] ?? TYPE_META.doc;
          return (
            <li key={r.id}>
              <Link
                href={`/trace/${r.id}`}
                onClick={onNavigate}
                className="flex items-start gap-2.5 rounded-lg border border-gray-200 bg-white p-2.5 hover:border-gray-300 hover:bg-gray-50"
              >
                <span className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${t.bg} ${t.text} ${t.ring}`}>
                  <TypeIcon type={r.type} className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block break-words text-sm font-medium text-gray-900">{r.title}</span>
                  <span className="block text-xs text-gray-500">
                    {t.label} · {formatSourceDate(r.date)} · {r.reason}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default RelatedSources;
