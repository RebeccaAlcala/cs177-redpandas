import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DotField } from "@/components/ui/DotField";
import { ImportDemoBar } from "@/components/ui/ImportDemoBar";
import { RecordedMeetings } from "@/components/ui/RecordedMeetings";
import type { SessionUser } from "@/lib/auth";

// Signed-in home ("/"). Distinct from the logged-out marketing page: a working
// home base with the primary actions and quick links into the app, instead of a
// "sign in to try it" pitch.
const EXPLORE = [
  {
    href: "/conflicts",
    title: "Conflicts",
    desc: "Cross-team disagreements, at the sensitivity you choose. Dismiss false positives.",
  },
  {
    href: "/decisions",
    title: "Decisions",
    desc: "The decision log, each one traced back to its source.",
  },
  {
    href: "/features",
    title: "Features",
    desc: "What every team said about each feature, and where they clash.",
  },
  {
    href: "/meetings",
    title: "Meetings",
    desc: "Team-tagged transcripts and AI summaries for every meeting.",
  },
];

export function SignedInHome({
  user,
  imported,
}: {
  user: SessionUser;
  imported: boolean;
}) {
  const firstName = user.name.trim().split(/\s+/)[0] || user.name;

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      {/* Welcome hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-deep px-6 py-12 text-white sm:px-10 sm:py-16">
        <DotField className="text-emerald-200/70 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="relative">
          <p className="text-sm font-medium text-emerald-200">Welcome back</p>
          <h1 className="mt-3 font-display font-medium text-5xl leading-[1.0] tracking-tight sm:text-6xl">
            {firstName}, what was said?
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
            Record a meeting and the AI pulls out the summary, action items,
            cross-team conflicts, and any claim made without a source.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="/record" variant="inverse">
              ● Record a meeting
            </Button>
            <Button href="/my-meetings" variant="ghost">
              My meetings
            </Button>
          </div>
        </div>
      </section>

      <div className="mt-8">
        <ImportDemoBar imported={imported} />
      </div>

      <RecordedMeetings />

      {/* Quick links into the app */}
      <h2 className="mt-4 mb-4 font-display font-medium text-2xl text-gray-900">
        Explore
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {EXPLORE.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-accent/40"
          >
            <div>
              <h3 className="font-display font-medium text-xl text-gray-900">
                {c.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{c.desc}</p>
            </div>
            <span className="mt-1 shrink-0 text-accent transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default SignedInHome;
