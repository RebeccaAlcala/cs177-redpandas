import type { ReactNode } from "react";
import { getClaim, getClaims, getPeople, getSources } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { DotField } from "@/components/ui/DotField";
import { TeamShareBar } from "@/components/ui/TeamShareBar";
import { TeamTag } from "@/components/ui/TeamTag";
import { TEAM_IDS } from "@/components/ui/teams";
import { UnsourcedFlag } from "@/components/source/UnsourcedFlag";
import { FreshnessTag } from "@/components/source/FreshnessTag";
import { ProductDemo } from "@/components/landing/ProductDemo";
import { TraceVisual } from "@/components/landing/TraceVisual";

// The claims the landing visuals are built around, read from the seed data.
const TRACED_CLAIM_ID = "c_009";
const UNSOURCED_CLAIM_ID = "c_016";

function Feature({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <div className="reveal flex flex-col rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex min-h-40 flex-col justify-center rounded-2xl bg-gray-50 p-4">{children}</div>
      <h3 className="mt-5 font-display font-medium text-2xl text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{text}</p>
    </div>
  );
}

// Landing + mock SSO sign-in (docs/CONTRACT.md route "/").
export default function HomePage() {
  const traced = getClaim(TRACED_CLAIM_ID);
  const unsourced = getClaim(UNSOURCED_CLAIM_ID);
  const claims = getClaims();
  const claimsByTeam = TEAM_IDS.map((team) => ({
    team,
    amount: claims.filter((c) => c.team === team).length,
  })).filter((s) => s.amount > 0);

  return (
    <main>
      <div className="px-3 pt-3 sm:px-4 sm:pt-4">
        <section className="relative overflow-hidden rounded-[2rem] bg-deep text-white">
          <DotField
            cols={84}
            rows={60}
            className="text-emerald-200/80 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
          />
          <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-8 text-center sm:px-8 sm:pt-24 sm:pb-12">
            <p className="text-sm font-medium text-emerald-200">For product managers</p>
            <h1 className="mx-auto mt-5 max-w-5xl font-display font-medium text-6xl leading-[0.98] tracking-tight sm:text-8xl lg:text-[7.5rem]">
              Every decision has a receipt.
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
              Meeting Source Tracer records meetings, catches cross-team conflict,
              and traces every claim back to its source.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button href="/connect" variant="inverse">
                Sign in with company SSO
              </Button>
              <Button href="/meetings" variant="ghost">
                View the demo
              </Button>
            </div>
            <p className="mt-5 text-xs text-white/70">
              Mock SSO &middot; no real sign-in &middot; prototype data
            </p>

            {traced ? (
              <div className="mt-14 sm:mt-20">
                <TraceVisual
                  claim={traced}
                  sources={getSources(traced.sourceIds)}
                  people={getPeople()}
                />
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <section className="reveal mx-auto max-w-6xl px-6 pt-20 sm:pt-28">
        <h2 className="max-w-3xl font-display font-medium text-5xl leading-[1.05] tracking-tight text-gray-900 sm:text-6xl">
          From what was said to why it was decided.
        </h2>
        <div className="mt-10 sm:mt-14">
          <ProductDemo />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pt-20 sm:pt-28">
        <h2 className="reveal max-w-3xl font-display font-medium text-5xl leading-[1.05] tracking-tight text-gray-900 sm:text-6xl">
          Know what you can repeat as fact.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Feature
            title="Unsourced claims get flagged"
            text="If nothing backs a claim up, you see that before anyone builds on it."
          >
            <p className="text-sm leading-relaxed text-gray-800">
              {unsourced?.text ?? "A claim with no evidence behind it."}
            </p>
            <div className="mt-3">
              <UnsourcedFlag />
            </div>
          </Feature>
          <Feature
            title="Old answers stay labeled"
            text="Each source shows whether it's still current, changed, or overturned."
          >
            <ul className="space-y-3 text-sm text-gray-800">
              <li className="flex items-center justify-between gap-3">
                Risk Policy v4 <FreshnessTag status="current" />
              </li>
              <li className="flex items-center justify-between gap-3">
                Vendor Spec v1 <FreshnessTag status="updated" />
              </li>
              <li className="flex items-center justify-between gap-3">
                Trial MFA call <FreshnessTag status="overturned" />
              </li>
            </ul>
          </Feature>
          <Feature
            title="Every team in one view"
            text="See each team's position on a feature without reading every transcript."
          >
            <TeamShareBar shares={claimsByTeam} label="Claims by team" />
            <div className="mt-4 flex flex-wrap gap-1.5">
              {claimsByTeam.map((s) => (
                <TeamTag key={s.team} team={s.team} />
              ))}
            </div>
          </Feature>
        </div>
      </section>

      <div className="px-3 pt-20 pb-3 sm:px-4 sm:pt-28 sm:pb-4">
        <section className="reveal relative overflow-hidden rounded-[2rem] bg-deep px-6 py-16 text-center text-white sm:py-24">
          <DotField className="text-emerald-200/70 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_90%)]" />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl font-display font-medium text-5xl leading-[1.05] tracking-tight sm:text-7xl">
              Stop being the search engine between teams.
            </h2>
            <div className="mt-9 flex justify-center">
              <Button href="/connect" variant="inverse">
                Sign in with company SSO
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
