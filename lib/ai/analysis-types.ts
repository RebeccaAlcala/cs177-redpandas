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
