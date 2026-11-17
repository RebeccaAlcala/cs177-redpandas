"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { importDemoData, clearDemoData } from "@/lib/demo-actions";

// Toggle shown on each demo page. Off: prompts the person to load the mocked
// team backlog. On: confirms it's loaded and offers Clear. Both call a server
// action (which flips the mst_demo cookie) then refresh the server render.
export function ImportDemoBar({ imported }: { imported: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(action: () => Promise<void>) {
    start(async () => {
      await action();
      router.refresh();
    });
  }

  if (imported) {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/25 bg-accent/5 px-4 py-3">
        <span className="text-sm text-gray-700">
          <span className="font-medium text-accent">Demo backlog loaded ✓</span> — sample
          meetings, conflicts, and decisions are mixed in with your recordings.
        </span>
        <button
          onClick={() => run(clearDemoData)}
          disabled={pending}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
        >
          {pending ? "Clearing…" : "Clear demo data"}
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <span className="text-sm text-gray-600">
        Showing only your recorded meetings. Load a sample team backlog to see the full picture.
      </span>
      <button
        onClick={() => run(importDemoData)}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {pending ? "Importing…" : "Import meeting data"}
      </button>
    </div>
  );
}

export default ImportDemoBar;
