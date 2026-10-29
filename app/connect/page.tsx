"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TeamTag } from "@/components/ui/TeamTag";
import { TEAM_META, TEAM_IDS } from "@/components/ui/teams";
import type { TeamId } from "@/lib/types";

type SourceKey = "calendar" | "slack" | "docs";

const SOURCES: { key: SourceKey; name: string; blurb: string }[] = [
  { key: "calendar", name: "Google Calendar", blurb: "Pull meetings and attendees" },
  { key: "slack", name: "Slack", blurb: "Import channel discussions" },
  { key: "docs", name: "Google Docs", blurb: "Link specs and policies" },
];

// Channels / folders the PM tags to a team.
const ITEMS: { id: string; source: SourceKey; label: string }[] = [
  { id: "cal_product_syncs", source: "calendar", label: "Product syncs" },
  { id: "cal_compliance_sync", source: "calendar", label: "Compliance sync" },
  { id: "slack_data_export", source: "slack", label: "#data-export" },
  { id: "slack_compliance", source: "slack", label: "#compliance" },
  { id: "slack_eng", source: "slack", label: "#eng" },
  { id: "docs_privacy", source: "docs", label: "Privacy & Policy" },
  { id: "docs_specs", source: "docs", label: "Product Specs" },
];

type State = {
  connected: Record<SourceKey, boolean>;
  tags: Record<string, TeamId | "">;
};

const STORAGE_KEY = "mst.connect.v1";
const INITIAL: State = {
  connected: { calendar: false, slack: false, docs: false },
  tags: {},
};

export default function ConnectPage() {
  const [state, setState] = useState<State>(INITIAL);
  const [loaded, setLoaded] = useState(false);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<State>;
        setState({
          connected: { ...INITIAL.connected, ...parsed.connected },
          tags: { ...parsed.tags },
        });
      }
    } catch {
      // ignore unreadable/blocked storage; start from defaults
    }
    setLoaded(true);
  }, []);

  // Persist after the first load so we never clobber stored state with defaults.
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage failures (private mode, quota, etc.)
    }
  }, [state, loaded]);

  const toggleConnect = (key: SourceKey) =>
    setState((s) => ({
      ...s,
      connected: { ...s.connected, [key]: !s.connected[key] },
    }));

  const setTag = (itemId: string, team: TeamId | "") =>
    setState((s) => ({ ...s, tags: { ...s.tags, [itemId]: team } }));

  const anyConnected = Object.values(state.connected).some(Boolean);
  const visibleItems = ITEMS.filter((it) => state.connected[it.source]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <PageHeader
        title="Connect your workspace"
        subtitle="Mock SSO — toggle the sources to connect, then tag each channel or folder to the team that owns it."
      />

      {/* Source toggle cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {SOURCES.map((src) => {
          const on = state.connected[src.key];
          return (
            <Card key={src.key}>
              <div className="flex h-full flex-col">
                <div className="text-sm font-semibold text-gray-900">
                  {src.name}
                </div>
                <p className="mt-1 mb-4 text-xs text-gray-500">{src.blurb}</p>
                <div className="mt-auto">
                  <Button
                    variant={on ? "secondary" : "primary"}
                    onClick={() => toggleConnect(src.key)}
                    className="w-full"
                  >
                    {on ? "Connected ✓" : "Connect"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Team tagging */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold text-gray-900">
          Tag channels &amp; folders
        </h2>
        <p className="mt-1 mb-4 text-sm text-gray-600">
          Assign each connected channel or folder to the team that owns it.
        </p>

        {visibleItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
            Connect a source above to start tagging its channels and folders.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {visibleItems.map((it) => {
              const team = state.tags[it.id] ?? "";
              return (
                <li
                  key={it.id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-800">{it.label}</span>
                    <span className="text-xs uppercase tracking-wide text-gray-400">
                      {SOURCES.find((s) => s.key === it.source)?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {team ? <TeamTag team={team} /> : null}
                    <select
                      value={team}
                      onChange={(e) =>
                        setTag(it.id, e.target.value as TeamId | "")
                      }
                      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800"
                    >
                      <option value="">Unassigned</option>
                      {TEAM_IDS.map((t) => (
                        <option key={t} value={t}>
                          {TEAM_META[t].name}
                        </option>
                      ))}
                    </select>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Next step */}
      <div className="mt-10 flex items-center gap-3">
        {anyConnected ? (
          <Button href="/meetings">Go to meetings</Button>
        ) : (
          <Button variant="secondary" disabled>
            Go to meetings
          </Button>
        )}
        <span className="text-xs text-gray-400">
          Saved locally in your browser.
        </span>
      </div>
    </main>
  );
}
