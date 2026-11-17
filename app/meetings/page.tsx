import { getFeatures, getMeetings, getPeople, getTranscript } from "@/lib/data";
import type { TeamId } from "@/lib/types";
import { PageHero } from "@/components/ui/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { ImportDemoBar } from "@/components/ui/ImportDemoBar";
import { RecordedMeetings } from "@/components/ui/RecordedMeetings";
import { isDemoImported } from "@/lib/demo";
import { MeetingsBoard } from "./MeetingsBoard";

// /meetings: your recorded meetings on top, then the sample backlog (opt-in via
// "Import meeting data"). Filterable by feature; supports ?feature=f_data_export.
export default async function MeetingsPage({ searchParams }: PageProps<"/meetings">) {
  const sp = await searchParams;
  const feature = typeof sp.feature === "string" ? sp.feature : "";
  const imported = await isDemoImported();
  const meetings = imported ? getMeetings() : [];

  // How much each team spoke in each meeting, by length of what they said.
  const talkShare = Object.fromEntries(
    meetings.map((m) => {
      const totals = new Map<TeamId, number>();
      for (const s of getTranscript(m.id)) {
        totals.set(s.team, (totals.get(s.team) ?? 0) + s.text.length);
      }
      return [m.id, [...totals].map(([team, amount]) => ({ team, amount }))];
    }),
  );
  const minutes = meetings.reduce((sum, m) => sum + (m.durationMin ?? 0), 0);
  const lines = meetings.reduce((sum, m) => sum + getTranscript(m.id).length, 0);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <PageHero
        title="Meetings"
        subtitle="Every meeting the recorder joined, with team-tagged transcripts and AI summaries."
        stats={[
          { label: "Meetings", value: meetings.length },
          { label: "Minutes", value: minutes },
          { label: "Lines", value: lines },
        ]}
      />

      <ImportDemoBar imported={imported} />

      <RecordedMeetings />

      {meetings.length === 0 ? (
        <EmptyState message="No sample meetings loaded. Click “Import meeting data” above to load the demo backlog, or record your own on the Record page." />
      ) : (
        <MeetingsBoard
          meetings={meetings}
          features={getFeatures()}
          people={getPeople()}
          talkShare={talkShare}
          initialFeatureId={feature}
        />
      )}
    </main>
  );
}
