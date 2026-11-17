import { getFeatures, getMeetings, getPeople, getTranscript } from "@/lib/data";
import type { TeamId } from "@/lib/types";
import { PageHero } from "@/components/ui/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { ImportDemoBar } from "@/components/ui/ImportDemoBar";
import { RecordedMeetings } from "@/components/ui/RecordedMeetings";
import { FeaturePromo } from "@/components/landing/FeaturePromo";
import { isDemoImported } from "@/lib/demo";
import { getSessionUser } from "@/lib/auth";
import { MeetingsBoard } from "./MeetingsBoard";

// /meetings: your recorded meetings on top, then the sample backlog (opt-in via
// "Import meeting data"). Filterable by feature; supports ?feature=f_data_export.
// Logged-out visitors get a promotional explainer instead of the app view.
export default async function MeetingsPage({ searchParams }: PageProps<"/meetings">) {
  const user = await getSessionUser();
  if (!user) {
    return (
      <FeaturePromo
        eyebrow="Meetings"
        title="Every meeting, on the record."
        blurb="The recorder joins your calls, captures a team-tagged transcript, and hands back an AI summary with the decisions, action items, and anything said without a source."
        points={[
          { title: "Auto-join & record", text: "The bot joins from your calendar and records, so no one has to take notes." },
          { title: "Team-tagged transcript", text: "Every line is attributed, so you can see which team said what, and how much." },
          { title: "AI summary", text: "Key decisions, numbers, and action items pulled out the moment the meeting ends." },
        ]}
      />
    );
  }

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
