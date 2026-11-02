"use client";

import { useEffect } from "react";

// Nearest ancestor that actually scrolls vertically (e.g. the transcript box).
function scrollParent(el: HTMLElement): HTMLElement | null {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const { overflowY } = getComputedStyle(p);
    if ((overflowY === "auto" || overflowY === "scroll") && p.scrollHeight > p.clientHeight) {
      return p;
    }
  }
  return null;
}

// Scrolls the transcript line with this id into view on mount / when it
// changes. Rendered by TranscriptViewer when highlightSegmentId is set.
//
// We scroll the transcript's own scroll box directly, and instantly, instead
// of el.scrollIntoView({ behavior: "smooth" }): Chrome can drop one of two
// simultaneous smooth scrolls (window + inner box), leaving the line hidden.
// An instant jump is also the right feel for "go to the source moment".
export function ScrollToSegment({ segmentId }: { segmentId: string }) {
  useEffect(() => {
    const el = document.getElementById(segmentId);
    if (!el) return;
    const box = scrollParent(el);
    if (!box) {
      el.scrollIntoView({ block: "center" });
      return;
    }
    // Make sure the transcript box itself is on screen (instant), then
    // scroll inside it so the line sits in the middle.
    box.scrollIntoView({ block: "nearest" });
    const boxTop = box.getBoundingClientRect().top;
    const elRect = el.getBoundingClientRect();
    const top = box.scrollTop + (elRect.top - boxTop) - (box.clientHeight - elRect.height) / 2;
    box.scrollTo({ top: Math.max(0, top) });
  }, [segmentId]);
  return null;
}

export default ScrollToSegment;
