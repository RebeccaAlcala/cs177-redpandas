"use client";

import { useState } from "react";
import Link from "next/link";
import type { Claim, TeamId } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { TeamTag } from "@/components/ui/TeamTag";
import { TEAM_META } from "@/components/ui/teams";
import { SourceBadge } from "@/components/source";

type Kind = Claim["kind"];

const KINDS: { id: Kind; label: string }[] = [
  { id: "decision", label: "Decisions" },
  { id: "number", label: "Numbers" },
  { id: "commitment", label: "Commitments" },
  { id: "statement", label: "Statements" },
];

// claimId -> the conflict it belongs to, so both sides get highlighted.
export type ConflictRef = { id: string; title: string };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// "By team" view: one column per team with that team's claims on this feature.
// Claims that are one side of a conflict get an orange border + "Conflict" chip.
export function TeamColumns({
  teams,
  claims,
  meetingDates,
  conflictByClaim,
}: {
  teams: TeamId[];
  claims: Claim[];
  meetingDates: Record<string, string>;
  conflictByClaim: Record<string, ConflictRef>;
}) {
  const [shownTeams, setShownTeams] = useState<TeamId[]>(teams);
  const [kinds, setKinds] = useState<Kind[]>([]); // empty = all kinds

  const toggle = <T,>(list: T[], item: T) =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  const visible = teams.filter((t) => shownTeams.includes(t));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-gray-600">Teams</span>
          {teams.map((t) => {
            const on = shownTeams.includes(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => setShownTeams((s) => toggle(s, t))}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors ${
                  on ? "text-white ring-transparent" : "bg-white text-gray-500 ring-gray-300"
                }`}
                style={on ? { backgroundColor: TEAM_META[t].color } : undefined}
              >
                {TEAM_META[t].name}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-gray-600">Kind</span>
          {KINDS.map((k) => {
            const on = kinds.includes(k.id);
            return (
              <button
                key={k.id}
                type="button"
                aria-pressed={on}
                onClick={() => setKinds((s) => toggle(s, k.id))}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors ${
                  on
                    ? "bg-accent text-white ring-accent"
                    : "bg-white text-gray-600 ring-gray-300 hover:bg-gray-50"
                }`}
              >
                {k.label}
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState message="Pick at least one team to compare." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((team) => {
            const list = claims.filter(
              (c) => c.team === team && (kinds.length === 0 || kinds.includes(c.kind)),
            );
            return (
              <section
                key={team}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <TeamTag team={team} />
                  <span className="text-xs text-gray-500">
                    {list.length} claim{list.length === 1 ? "" : "s"}
                  </span>
                </header>
                {list.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-gray-500">
                    Nothing from {TEAM_META[team].name} on this yet.
                  </p>
                ) : (
                  <ul className="space-y-3 p-3">
                    {list.map((c) => {
                      const conflict = conflictByClaim[c.id];
                      const date = c.meetingId ? meetingDates[c.meetingId] : undefined;
                      return (
                        <li
                          key={c.id}
                          className={`rounded-lg border p-3 ${
                            conflict
                              ? "border-orange-200 bg-orange-50"
                              : "border-gray-200"
                          }`}
                        >
                          <p className="text-sm text-gray-800">{c.text}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                            <span className="capitalize">{c.kind}</span>
                            {date ? (
                              <>
                                <span aria-hidden>·</span>
                                <Link
                                  href={`/meetings/${c.meetingId}`}
                                  className="hover:text-gray-800 hover:underline"
                                >
                                  {formatDate(date)}
                                </Link>
                              </>
                            ) : null}
                            <SourceBadge
                              sourceIds={c.sourceIds}
                              contradictsSourceId={c.contradictsSourceId}
                            />
                            {conflict ? (
                              <a
                                href={`#${conflict.id}`}
                                title={conflict.title}
                                className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 font-medium text-orange-800 ring-1 ring-inset ring-orange-300 hover:bg-orange-200"
                              >
                                Conflict
                              </a>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TeamColumns;
