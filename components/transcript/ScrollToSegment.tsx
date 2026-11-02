"use client";

import { useEffect } from "react";

// Scrolls the transcript line with this id into view on mount / when it
// changes. Rendered by TranscriptViewer when highlightSegmentId is set.
export function ScrollToSegment({ segmentId }: { segmentId: string }) {
  useEffect(() => {
    const el = document.getElementById(segmentId);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [segmentId]);
  return null;
}

export default ScrollToSegment;
