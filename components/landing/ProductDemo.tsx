"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { TeamId } from "@/lib/types";
import { TeamTag } from "@/components/ui/TeamTag";
import { TYPE_META, TypeIcon } from "@/components/source/meta";

const STEP_MS = 5500;

const STEPS = [
  { title: "Record", text: "The recorder joins and labels every line by speaker and team." },
  { title: "Catch", text: "Two teams believe different things? It gets flagged, with both sides." },
  { title: "Trace", text: "Click any claim to see the exact words behind it." },
  { title: "Decide", text: "Every decision keeps its reasons, even after it's overturned." },
];

function Line({ name, team, time, children }: { name: string; team: TeamId; time: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3.5">
      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-900">
        {name}
        <TeamTag team={team} />
        <span className="font-mono text-xs font-normal text-gray-500">{time}</span>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-700">{children}</p>
    </div>
  );
}

function RecordStep() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl bg-red-50 px-3.5 py-2.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        <span className="text-sm font-medium text-red-800">Recording</span>
        <div className="ml-auto flex h-5 items-center gap-0.5">
          {Array.from({ length: 16 }, (_, i) => (
            <span
              key={i}
              className="wave-bar h-full w-0.5 rounded-full bg-red-400"
              style={{ animationDelay: `${(i * 137) % 900}ms` }}
            />
          ))}
        </div>
      </div>
      <Line name="Rafael Mendes" team="risk" time="00:31">
        Our tolerance for false positives is two percent.
      </Line>
      <Line name="Yuki Tanaka" team="eng" time="02:38">
        Hold on, we built to five percent.
      </Line>
    </div>
  );
}

function CatchStep() {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-orange-800">
        Conflict detected
        <span className="font-normal">96% confidence</span>
      </div>
      <p className="mt-2 font-display font-medium text-2xl leading-snug text-gray-900">
        Risk requires 2%, but Eng built to 5%
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="rounded-xl bg-gray-50 p-4">
          <TeamTag team="risk" />
          <p className="mt-2 font-display font-medium text-4xl text-gray-900">2%</p>
          <p className="mt-1 text-xs text-gray-500">Risk Policy v4, September</p>
        </div>
        <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-800">
          vs
        </span>
        <div className="rounded-xl bg-gray-50 p-4">
          <TeamTag team="eng" />
          <p className="mt-2 font-display font-medium text-4xl text-gray-900">5%</p>
          <p className="mt-1 text-xs text-gray-500">Vendor Spec v1, April</p>
        </div>
      </div>
    </div>
  );
}

function TraceStep() {
  const doc = TYPE_META.doc;
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-gray-700">
        Automated identity checks were built to a 5% false-positive threshold.
        <span className="ml-2 inline-flex items-center rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
          3 sources
        </span>
      </p>
      <div className="rounded-xl border border-gray-200 p-4 shadow-md">
        <div className="flex items-center gap-2">
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ring-1 ring-inset ${doc.bg} ${doc.text} ${doc.ring}`}>
            <TypeIcon type="doc" className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold text-gray-900">KYC Vendor Integration Spec v1</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-gray-900">
          <mark className="rounded bg-amber-100 px-1 py-0.5 text-gray-900">
            Target false-positive threshold: 5%.
          </mark>
        </p>
        <p className="mt-3 text-xs font-medium text-orange-800">Conflicts with Risk Policy v4</p>
      </div>
    </div>
  );
}

function DecideStep() {
  return (
    <ol className="space-y-3">
      <li className="rounded-xl bg-gray-50 p-4">
        <p className="text-sm leading-relaxed text-gray-900">
          MFA is required before any workspace enables SSO, trials included.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          Oct 28
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">Current</span>
        </div>
      </li>
      <li className="rounded-xl bg-gray-50 p-4">
        <p className="text-sm leading-relaxed text-gray-500 line-through">
          MFA is optional during trials, to be revisited after the pen test.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          Oct 21
          <span className="rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-700">Overturned</span>
          <span className="ml-auto font-medium text-accent">Why →</span>
        </div>
      </li>
    </ol>
  );
}

const SCREENS = [RecordStep, CatchStep, TraceStep, DecideStep];

// Auto-advancing walkthrough of the product. Click a step to stop on it.
export function ProductDemo() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Only start after mount, and never for people who asked for reduced motion.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser preference is only readable after mount
    setPlaying(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), STEP_MS);
    return () => clearTimeout(timer);
  }, [playing, step]);

  const Screen = SCREENS[step];

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-12">
      <ol className="space-y-1">
        {STEPS.map((s, i) => {
          const on = i === step;
          return (
            <li key={s.title}>
              <button
                type="button"
                aria-current={on ? "step" : undefined}
                onClick={() => {
                  setStep(i);
                  setPlaying(false);
                }}
                className={`w-full rounded-2xl p-4 text-left transition-colors ${
                  on ? "bg-white shadow-md" : "hover:bg-gray-100"
                }`}
              >
                <span className={`font-display font-medium text-2xl ${on ? "text-accent" : "text-gray-500"}`}>
                  {i + 1}. {s.title}
                </span>
                {on ? <p className="mt-1 text-sm leading-relaxed text-gray-600">{s.text}</p> : null}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="overflow-hidden rounded-3xl bg-deep p-3 shadow-lg sm:p-6">
        <div className="min-h-[22rem] rounded-2xl bg-white p-5 sm:p-6">
          <div key={step} className="demo-enter">
            <Screen />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDemo;
