import { Button } from "@/components/ui/Button";
import { DotField } from "@/components/ui/DotField";

// Promotional / explanatory version of an app page, shown to logged-out
// visitors in place of the real data views. Each of /meetings, /conflicts,
// /decisions, /features renders this with its own copy, so the public site
// explains the product instead of showing an empty app.
export interface PromoPoint {
  title: string;
  text: string;
}

export function FeaturePromo({
  eyebrow,
  title,
  blurb,
  points,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
  points: PromoPoint[];
}) {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-deep px-6 py-16 text-white sm:px-12 sm:py-20">
        <DotField className="text-emerald-200/70 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="relative max-w-3xl">
          <p className="text-sm font-medium text-emerald-200">{eyebrow}</p>
          <h1 className="mt-4 font-display font-medium text-5xl leading-[1.02] tracking-tight sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">{blurb}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="/login" variant="inverse">
              Sign in to try it
            </Button>
            <Button href="/" variant="ghost">
              How it works
            </Button>
          </div>
          <p className="mt-4 text-xs text-white/60">Mock SSO · no real sign-in · prototype data</p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {points.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="font-display font-medium text-xl text-gray-900">{p.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{p.text}</p>
          </div>
        ))}
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gray-100/70 px-6 py-5">
        <p className="text-sm text-gray-600">
          Sign in to try it on sample data, or record your own meeting.
        </p>
        <Button href="/login">Sign in to try it</Button>
      </div>
    </main>
  );
}

export default FeaturePromo;
