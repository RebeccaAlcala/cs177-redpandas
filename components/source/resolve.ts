// SERVER ONLY: reads data through lib/data.ts (which uses fs). Import this
// from route handlers and server components, never from a client component.
import { getMeeting, getPerson, getSource, getSources, getTranscript } from "@/lib/data";
import type { ContradictionInfo, ResolvedSource } from "./types";

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
