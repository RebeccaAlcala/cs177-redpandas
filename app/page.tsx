import { Button } from "@/components/ui/Button";
import { TeamTag } from "@/components/ui/TeamTag";
import { TYPE_META, TypeIcon } from "@/components/source/meta";

const STEPS = [
  {
    title: "Record",
    text: "The recorder joins your meetings and labels every line by speaker and team.",
  },
  {
    title: "Catch",
    text: "Conflicts surface when two teams leave the room believing different things.",
  },
  {
    title: "Trace",
    text: "Every claim links to the transcript moment, Slack thread, or doc behind it.",
  },
];

// Landing + mock SSO sign-in (docs/CONTRACT.md route "/").
export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6">
      <section className="grid items-center gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-16 lg:py-24">
        <div>
          <p className="text-sm font-medium text-accent">For product managers</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            Every decision has a receipt.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600">
            Meeting Source Tracer records meetings, catches cross-team conflict,
            and traces every claim back to its source.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="/connect">Sign in with company SSO</Button>
            <Button href="/meetings" variant="secondary">
              View the demo
            </Button>
          </div>
          <p className="mt-6 text-xs text-gray-500">
            Mock SSO &middot; no real sign-in &middot; prototype data
          </p>
        </div>

        {/* Static preview of the product's core idea: a claim and its evidence. */}
        <div
          aria-hidden
          className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-orange-800">Conflict detected</span>
            <span className="text-xs text-gray-500">96% confidence</span>
          </div>
          <p className="mt-2 font-display text-2xl leading-snug text-gray-900">
            Risk requires a 2% threshold, but Eng built to 5%
          </p>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl bg-gray-50 p-4">
              <TeamTag team="risk" />
              <p className="mt-2 text-sm text-gray-800">
                The false-positive threshold must be at or below 2%.
              </p>
              <PreviewSource type="doc" label="Risk Policy v4" />
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <TeamTag team="eng" />
              <p className="mt-2 text-sm text-gray-800">
                Identity checks were built to a 5% threshold.
              </p>
              <PreviewSource type="meeting" label="Pilot readiness, 02:38" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 border-t border-gray-200 py-12 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.title}>
            <h2 className="font-display text-2xl text-gray-900">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

function PreviewSource({ type, label }: { type: "doc" | "meeting"; label: string }) {
  return (
    <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${TYPE_META[type].text}`}>
      <TypeIcon type={type} className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}
