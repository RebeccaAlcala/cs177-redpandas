"use client";

import { useState } from "react";
import Link from "next/link";
import type { Feature } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { FeatureStatusBadge, STATUS_META } from "./FeatureStatusBadge";

export type FeatureRow = Feature & { meetingCount: number; conflictCount: number };

// /features list: search box + status filter over feature cards.
export function FeatureList({ features }: { features: FeatureRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const q = query.trim().toLowerCase();
  const listed = features.filter(
    (f) =>
      (!status || f.status === status) &&
      (!q || f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search features…"
          className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder:text-gray-400"
        />
        <label className="flex items-center gap-2 text-sm text-gray-600">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800"
          >
            <option value="">All statuses</option>
            {Object.entries(STATUS_META).map(([id, m]) => (
              <option key={id} value={id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {listed.length === 0 ? (
        <EmptyState message="No features match your search." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {listed.map((f) => (
            <li key={f.id}>
              <Link
                href={`/features/${f.id}`}
                className="block h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-sm font-semibold text-gray-900">{f.name}</h2>
                  <FeatureStatusBadge status={f.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">{f.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span>
                    {f.meetingCount} meeting{f.meetingCount === 1 ? "" : "s"}
                  </span>
                  <span aria-hidden>·</span>
                  {f.conflictCount > 0 ? (
                    <span className="font-medium text-orange-700">
                      {f.conflictCount} open conflict{f.conflictCount === 1 ? "" : "s"}
                    </span>
                  ) : (
                    <span>No open conflicts</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FeatureList;
