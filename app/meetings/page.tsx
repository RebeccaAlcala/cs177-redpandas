import { getFeatures, getMeetings, getPeople } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { MeetingsBoard } from "./MeetingsBoard";

// /meetings: auto-join card + list of all meetings, filterable by feature.
// Supports ?feature=f_data_export so other pages can link to a filtered list.
export default async function MeetingsPage({ searchParams }: PageProps<"/meetings">) {
  const sp = await searchParams;
  const feature = typeof sp.feature === "string" ? sp.feature : "";
  const meetings = getMeetings();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Meetings"
        subtitle="Every meeting the recorder joined, with team-tagged transcripts and AI summaries."
      />
      {meetings.length === 0 ? (
        <EmptyState message="No meetings yet. Connect your calendar to start recording." />
      ) : (
        <MeetingsBoard
          meetings={meetings}
          features={getFeatures()}
          people={getPeople()}
          initialFeatureId={feature}
        />
      )}
    </main>
  );
}
