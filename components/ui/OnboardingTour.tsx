"use client";

import { useEffect, useState } from "react";

// First-run onboarding tour. Shows automatically the first time a signed-in
// user lands (until dismissed), and can be reopened any time via <TourButton />,
// which dispatches the "mst:open-tour" event. "Done" is remembered in
// localStorage so it doesn't nag on every visit.

const DONE_KEY = "mst.onboarded.v1";
const OPEN_EVENT = "mst:open-tour";

interface Step {
  label: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    label: "Welcome",
    title: "Turn a messy meeting into a clear record",
    body: "Meeting Source Tracer pulls the summary, decisions, cross-team conflicts, and sources out of your meetings. Here's the 60-second tour.",
  },
  {
    label: "Step 1",
    title: "Capture a meeting",
    body: "On the Record page, start your mic or paste a transcript, then “Summarize with AI.” No meeting handy? Click “Import meeting data” anywhere to load a sample backlog to explore.",
  },
  {
    label: "Step 2",
    title: "Read the AI's take",
    body: "You get a plain-language summary, action items, the points where teams conflict, and any claim made without a source — all generated automatically.",
  },
  {
    label: "Step 3",
    title: "Tune the conflicts, then trace",
    body: "On Conflicts, choose how many to surface (Only significant → Catch everything) and mark anything that isn't real as “Not a conflict.” Follow any claim to its source, and review the decision log.",
  },
];

function readDone(): boolean {
  try {
    return localStorage.getItem(DONE_KEY) === "1";
  } catch {
    return false;
  }
}
function writeDone(): void {
  try {
    localStorage.setItem(DONE_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!readDone()) setOpen(true);
    const onOpen = () => {
      setI(0);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  function close() {
    writeDone();
    setOpen(false);
  }

  if (!open) return null;

  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="How to use Meeting Source Tracer"
      onClick={close}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-deep px-6 pt-6 pb-5 text-white">
          <button
            onClick={close}
            aria-label="Skip the tour"
            className="absolute top-4 right-4 text-white/60 hover:text-white"
          >
            ✕
          </button>
          <p className="text-xs font-medium tracking-wide text-emerald-200 uppercase">
            {step.label}
          </p>
          <h2 className="mt-2 font-display font-medium text-2xl leading-snug">
            {step.title}
          </h2>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm leading-relaxed text-gray-700">{step.body}</p>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-1.5" aria-hidden>
              {STEPS.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === i ? "w-5 bg-accent" : "w-1.5 bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {i > 0 ? (
                <button
                  onClick={() => setI((n) => n - 1)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Back
                </button>
              ) : (
                <button
                  onClick={close}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100"
                >
                  Skip
                </button>
              )}
              {last ? (
                <button
                  onClick={close}
                  className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
                >
                  Start exploring
                </button>
              ) : (
                <button
                  onClick={() => setI((n) => n + 1)}
                  className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Link/button that reopens the tour on demand.
export function TourButton({ className = "" }: { className?: string }) {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_EVENT))}
      className={className}
    >
      How it works
    </button>
  );
}

export default OnboardingTour;
