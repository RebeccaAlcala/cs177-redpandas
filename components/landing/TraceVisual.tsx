import type { Claim, Person, Source } from "@/lib/types";
import { TeamTag } from "@/components/ui/TeamTag";
import { TYPE_META, TypeIcon } from "@/components/source/meta";
import { UnsourcedFlag } from "@/components/source/UnsourcedFlag";

// Line endpoints, as percentages across the row of three source cards.
const STARTS = [16.6, 50, 83.4];

// Hero visual: one real claim from the seed, wired up to the sources behind it.
export function TraceVisual({
  claim,
  sources,
  people,
}: {
  claim: Claim;
  sources: Source[];
  people: Person[];
}) {
  const shown = sources.slice(0, 3);
  return (
    <div aria-hidden>
      <div className="grid gap-3 md:grid-cols-3">
        {shown.map((s) => {
          const meta = TYPE_META[s.type];
          const author = people.find((p) => p.id === s.authorId);
          return (
            <div key={s.id} className="flex flex-col rounded-2xl bg-white p-4 text-left shadow-lg">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ring-1 ring-inset ${meta.bg} ${meta.text} ${meta.ring}`}
                >
                  <TypeIcon type={s.type} className="h-4 w-4" />
                </span>
                <span className="min-w-0 truncate text-xs font-semibold text-gray-900">{s.title}</span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-snug text-gray-700">{s.excerpt}</p>
              {author ? <p className="mt-auto pt-3 text-xs text-gray-500">{author.name}</p> : null}
            </div>
          );
        })}
      </div>

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
        className="hidden h-16 w-full md:block"
      >
        {STARTS.slice(0, shown.length).map((x) => (
          <path
            key={x}
            d={`M${x} 0C${x} 55 50 45 50 100`}
            stroke="#8fd3b6"
            strokeWidth={1.5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="trace-line"
          />
        ))}
      </svg>

      <div className="mx-auto mt-3 max-w-2xl rounded-2xl bg-white p-5 text-left shadow-lg md:mt-0">
        <div className="flex flex-wrap items-center gap-2">
          {claim.team ? <TeamTag team={claim.team} /> : null}
          <span className="text-xs font-medium text-gray-500">
            Traced to {claim.sourceIds.length} sources
          </span>
          {claim.sourceIds.length === 0 ? <UnsourcedFlag /> : null}
        </div>
        <p className="mt-3 font-display font-medium text-2xl leading-snug text-gray-900">{claim.text}</p>
      </div>
    </div>
  );
}

export default TraceVisual;
