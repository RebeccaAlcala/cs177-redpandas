import type { Person, Source } from "@/lib/types";

// A Source plus the related records the UI needs. Built on the server
// (resolve.ts) because lib/data.ts reads files; client components only ever
// see this plain, serializable shape.
export interface ResolvedSource {
  source: Source;
  author?: Person;
  meetingTitle?: string;
  jumpSec?: number; // meeting sources: where to jump to in the recording
}

export interface ContradictionInfo {
  id: string;
  title: string;
  version?: string;
}

export interface SourcesPayload {
  sources: ResolvedSource[];
  contradicts?: ContradictionInfo;
}
