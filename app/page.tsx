import type { ReactNode } from "react";
import { getClaim, getPeople, getSources } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { DotField } from "@/components/ui/DotField";
import { UnsourcedFlag } from "@/components/source/UnsourcedFlag";
import { ProductDemo } from "@/components/landing/ProductDemo";
import { TraceVisual } from "@/components/landing/TraceVisual";
import { SignedInHome } from "@/components/landing/SignedInHome";
import { getSessionUser } from "@/lib/auth";
import { isDemoImported } from "@/lib/demo";

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

// Route "/". Signed-in users get a working home base (SignedInHome); logged-out
// visitors get the marketing landing below that explains the product.
export default async function HomePage() {
  const user = await getSessionUser();
  if (user) {
    return <SignedInHome user={user} imported={await isDemoImported()} />;
  }

  const traced = getClaim(TRACED_CLAIM_ID);
  const unsourced = getClaim(UNSOURCED_CLAIM_ID);

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
              <Button href="/login" variant="inverse">
                Sign in to try it
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
          From recording to receipt.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Feature
            title="Record live, summarized by AI"
            text="Hit record. When the meeting ends you get a clean summary, action items, and flags — no note-taking."
          >
            <div className="w-full space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-red-600">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Recording
              </div>
              <div className="rounded-lg bg-white px-3 py-2 text-sm text-gray-700 shadow-sm">
                “Let’s lock the export scope this week.”
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                AI summary ready
              </span>
            </div>
          </Feature>
          <Feature
            title="Conflicts, at your sensitivity"
            text="The AI flags where teams disagree — and you choose how much to surface, from only the clearest to every maybe."
          >
            <div className="w-full space-y-3">
              <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 text-xs">
                <span className="rounded-md px-2 py-1 text-gray-500">Only significant</span>
                <span className="rounded-md bg-accent px-2 py-1 font-medium text-white">Balanced</span>
                <span className="rounded-md px-2 py-1 text-gray-500">Everything</span>
              </div>
              <div>
                <div className="mb-1 text-[11px] text-gray-500">96% confidence</div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full w-[96%] rounded-full bg-orange-500" />
                </div>
              </div>
            </div>
          </Feature>
          <Feature
            title="Every claim traces to its source"
            text="Each statement links to the meeting, message, or doc it came from — and anything unsupported gets flagged."
          >
            <p className="text-sm leading-relaxed text-gray-800">
              {unsourced?.text ?? "A claim with no evidence behind it."}
            </p>
            <div className="mt-3">
              <UnsourcedFlag />
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
              <Button href="/login" variant="inverse">
                Sign in to try it
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
