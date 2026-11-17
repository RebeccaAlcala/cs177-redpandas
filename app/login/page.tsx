import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth-actions";
import { getSessionUser } from "@/lib/auth";

// Demo login: type a name + email and you're in. Not real auth — see lib/auth.ts.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getSessionUser()) redirect("/record");
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex max-w-md flex-col px-6 py-20">
      <h1 className="font-display font-medium text-4xl tracking-tight text-gray-900">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Demo sign-in — just enter a name and email to try recording a meeting.
        No password, no account.
      </p>

      <form action={signIn} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-800">Name</span>
          <input
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Maya Chen"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-800">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="maya@acme.com"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-accent"
          />
        </label>

        {error ? (
          <p className="text-sm text-red-600">Please enter both a name and an email.</p>
        ) : null}

        <button
          type="submit"
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Continue
        </button>
      </form>

      <p className="mt-6 text-xs text-gray-400">
        This is a prototype. Your name and email are stored only in a cookie on
        this device.
      </p>
    </main>
  );
}
