// Shape of a live analysis produced from a raw transcript (no seed coupling).
// Shared by the API route, the recorder, and localStorage, so it is kept free
// of any server-only imports.

export interface LiveConflict {
  title: string;
  teamA?: string;
  teamB?: string;
  explanation: string;
  quoteA?: string;
  quoteB?: string;
  // How confident the AI is that this is a real, substantive conflict (0..1).
  // Used by the conflict-sensitivity control to filter borderline / likely
  // false-positive flags. Older recordings may not have it.
  significance?: number;
  // When this conflict contradicts an EARLIER meeting, the exact title of that
  // prior meeting (the "source" of the earlier claim). Empty for conflicts
  // contained within the current transcript.
  sourceMeeting?: string;
}

// Compact context about an earlier recorded meeting, passed to the analyzer so
// it can catch contradictions across meetings and cite the source.
export interface PriorMeetingContext {
  title: string;
  summaryPoints: string[];
  transcript?: string;
}

export interface LiveAnalysis {
  summaryPoints: string[];
  actionItems: { text: string; owner?: string }[];
  conflicts: LiveConflict[];
  unsourcedClaims: { text: string; why: string }[];
  confusions: { text: string; term?: string }[];
}

export const EMPTY_ANALYSIS: LiveAnalysis = {
  summaryPoints: [],
  actionItems: [],
  conflicts: [],
  unsourcedClaims: [],
  confusions: [],
};
