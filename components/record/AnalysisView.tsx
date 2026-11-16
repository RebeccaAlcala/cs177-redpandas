import type { LiveAnalysis } from "@/lib/ai/analysis-types";
import { Card } from "@/components/ui/Card";
import { UnsourcedFlag } from "@/components/source/UnsourcedFlag";

// Renders a live analysis (summary, action items, conflicts, unsourced claims,
// confusions). Shared by the recorder and the saved-meeting view.
export function AnalysisView({ analysis }: { analysis: LiveAnalysis }) {
  const {
    summaryPoints,
    actionItems,
    conflicts,
    unsourcedClaims,
    confusions,
  } = analysis;

  const empty =
    summaryPoints.length === 0 &&
    actionItems.length === 0 &&
    conflicts.length === 0 &&
    unsourcedClaims.length === 0 &&
    confusions.length === 0;

  if (empty) {
    return (
      <div className="rounded-2xl bg-gray-100/70 px-6 py-10 text-center text-sm text-gray-500">
        No summary yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {summaryPoints.length > 0 ? (
        <Card title="Summary">
          <ul className="list-disc space-y-2 pl-5 text-sm text-gray-800">
            {summaryPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      {actionItems.length > 0 ? (
        <Card title="Action items">
          <ul className="space-y-2 text-sm text-gray-800">
            {actionItems.map((a, i) => (
              <li key={i} className="flex items-start gap-2">
                <span aria-hidden className="mt-0.5 text-accent">
                  ☐
                </span>
                <span>
                  {a.text}
                  {a.owner ? (
                    <span className="text-gray-500"> — {a.owner}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {conflicts.length > 0 ? (
        <Card title={`Conflicts detected (${conflicts.length})`}>
          <ul className="space-y-4">
            {conflicts.map((c, i) => (
              <li
                key={i}
                className="rounded-xl border border-red-200 bg-red-50/60 p-4"
              >
                <p className="font-medium text-gray-900">{c.title}</p>
                {c.teamA || c.teamB ? (
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                    {c.teamA ?? "Side A"} vs {c.teamB ?? "Side B"}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-gray-700">{c.explanation}</p>
                {c.quoteA || c.quoteB ? (
                  <div className="mt-3 space-y-1.5 text-sm text-gray-600">
                    {c.quoteA ? (
                      <p className="border-l-2 border-gray-300 pl-3 italic">
                        “{c.quoteA}”
                      </p>
                    ) : null}
                    {c.quoteB ? (
                      <p className="border-l-2 border-gray-300 pl-3 italic">
                        “{c.quoteB}”
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {unsourcedClaims.length > 0 ? (
        <Card title={`Unsourced claims (${unsourcedClaims.length})`}>
          <ul className="space-y-3">
            {unsourcedClaims.map((u, i) => (
              <li key={i} className="text-sm">
                <div className="flex items-start gap-2">
                  <UnsourcedFlag />
                  <span className="text-gray-800">{u.text}</span>
                </div>
                <p className="mt-1 pl-1 text-xs text-gray-500">{u.why}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {confusions.length > 0 ? (
        <Card title="Points of confusion">
          <ul className="space-y-2 text-sm text-gray-800">
            {confusions.map((c, i) => (
              <li key={i}>
                {c.term ? <span className="font-medium">{c.term}: </span> : null}
                {c.text}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}

export default AnalysisView;
