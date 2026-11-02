// SERVER ONLY: reads data through lib/data.ts (which uses fs). Import this
// from route handlers and server components, never from a client component.
import { getClaims, getMeeting, getPerson, getSource, getSources, getTranscript } from "@/lib/data";
import type { ContradictionInfo, RelatedSource, ResolvedSource } from "./types";

export function resolveSources(ids: string[]): ResolvedSource[] {
  return getSources(ids).map((source) => {
    const segment =
      source.meetingId && source.segmentId
        ? getTranscript(source.meetingId).find((s) => s.id === source.segmentId)
        : undefined;
    const authorId = source.authorId ?? segment?.speakerId;
    return {
      source,
      author: authorId ? getPerson(authorId) : undefined,
      meetingTitle: source.meetingId ? getMeeting(source.meetingId)?.title : undefined,
      jumpSec: source.timestampSec ?? segment?.startSec,
    };
  });
}

export function resolveContradiction(id?: string): ContradictionInfo | undefined {
  const s = id ? getSource(id) : undefined;
  return s ? { id: s.id, title: s.title, version: s.version } : undefined;
}

// Other sources on the same topic as `ids`, strongest link first:
// shares a claim > conflicts with it > belongs to the same feature.
export function resolveRelated(ids: string[], limit = 6): RelatedSource[] {
  const claims = getClaims();
  const mine = new Set(ids);
  const found = new Map<string, string>(); // source id -> reason (first one wins)
  const add = (id: string | undefined, reason: string) => {
    if (id && !mine.has(id) && !found.has(id)) found.set(id, reason);
  };

  const touching = claims.filter(
    (c) => c.sourceIds.some((id) => mine.has(id)) || (c.contradictsSourceId && mine.has(c.contradictsSourceId)),
  );
  for (const c of touching) {
    if (c.sourceIds.some((id) => mine.has(id))) c.sourceIds.forEach((id) => add(id, "Backs the same claim"));
  }
  for (const c of touching) {
    add(c.contradictsSourceId, "Conflicts with this");
    if (c.contradictsSourceId && mine.has(c.contradictsSourceId)) {
      c.sourceIds.forEach((id) => add(id, "Conflicts with this"));
    }
  }
  const features = new Set(touching.map((c) => c.featureId).filter(Boolean));
  for (const c of claims) {
    if (c.featureId && features.has(c.featureId)) {
      c.sourceIds.forEach((id) => add(id, "Same feature"));
      add(c.contradictsSourceId, "Same feature");
    }
  }

  return getSources([...found.keys()])
    .slice(0, limit)
    .map((s) => ({ id: s.id, type: s.type, title: s.title, date: s.date, reason: found.get(s.id)! }));
}
