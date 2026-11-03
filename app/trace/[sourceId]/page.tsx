import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SourceCard } from "@/components/source/SourceCard";
import { RelatedSources } from "@/components/source/RelatedSources";
import { resolveContradiction, resolveRelated, resolveSources } from "@/components/source/resolve";
import { getClaims } from "@/lib/data";

// /trace/[sourceId] — full-page version of the source panel. Fallback link
// target when a slide-over isn't convenient, and what "Copy link" points at.
export default async function TracePage({
  params,
}: {
  params: Promise<{ sourceId: string }>;
}) {
  const { sourceId } = await params;
  const [item] = resolveSources([sourceId]);

  if (!item) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <PageHeader title="Source not found" subtitle={sourceId} />
        <EmptyState message="We couldn't find that source. It may have been removed, or the link is wrong." />
        <p className="mt-4 text-sm">
          <Link href="/meetings" className="text-gray-600 underline underline-offset-2 hover:text-gray-900">
            Back to meetings
          </Link>
        </p>
      </main>
    );
  }

  // Claims this source backs, and any that conflict with it.
  const all = getClaims();
  const backed = all.filter((c) => c.sourceIds.includes(sourceId));
  const conflicting = all.filter((c) => c.contradictsSourceId === sourceId);
  const warnings = backed
    .filter((c) => c.contradictsSourceId)
    .map((c) => ({ claim: c, target: resolveContradiction(c.contradictsSourceId) }))
    .filter((w) => w.target);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <PageHeader title="Source" subtitle="Where a claim came from" />

      <div className="space-y-4">
        {warnings.map(({ claim, target }) => (
          <div key={claim.id} className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <div className="font-semibold">⚠ Conflict</div>
            <p className="mt-0.5">
              &ldquo;{claim.text}&rdquo; conflicts with{" "}
              <Link href={`/trace/${target!.id}`} className="font-medium underline underline-offset-2">
                {target!.title}
              </Link>
              .
            </p>
          </div>
        ))}

        <SourceCard item={item} standalone />

        <Card title="Claims backed by this source">
          {backed.length === 0 ? (
            <EmptyState message="No claims reference this source yet." />
          ) : (
            <ul className="space-y-2 text-sm text-gray-800">
              {backed.map((c) => (
                <li key={c.id} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                  {c.text}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <RelatedSources related={resolveRelated([sourceId])} />

        {conflicting.length > 0 ? (
          <Card title="Claims that conflict with this source">
            <ul className="space-y-2 text-sm text-gray-800">
              {conflicting.map((c) => (
                <li key={c.id} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  {c.text}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

      </div>
    </main>
  );
}
