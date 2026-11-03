import Link from "next/link";
import type { Person } from "@/lib/types";
import { TeamTag } from "@/components/ui/TeamTag";
import { TEAM_META } from "@/components/ui/teams";
import { CopyLinkButton } from "./CopyLinkButton";
import { FreshnessTag } from "./FreshnessTag";
import { TYPE_META, TypeIcon } from "./meta";
import { formatMmSs, formatSourceDate, initials, isHttpUrl } from "./format";
import type { ResolvedSource } from "./types";

function PersonAvatar({ person, square }: { person?: Person; square?: boolean }) {
  const color = person ? TEAM_META[person.team]?.color : undefined;
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center text-xs font-semibold text-white ${square ? "rounded-md" : "rounded-full"}`}
      style={{ backgroundColor: color ?? "#9ca3af" }}
    >
      {person ? initials(person.name) : "?"}
    </span>
  );
}

const actionCls =
  "inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700";

// "Open in Slack" / "Open in Docs": the URLs are fixtures, so a real link is
// used when there is one, otherwise a button that does nothing.
function MockOpenLink({ url, label }: { url?: string; label: string }) {
  if (isHttpUrl(url)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={actionCls}>
        {label} <span aria-hidden>↗</span>
      </a>
    );
  }
  return (
    <button type="button" className={actionCls} title="Mock link">
      {label} <span aria-hidden>↗</span>
    </button>
  );
}

function Speaker({ person, team }: { person?: Person; team?: ResolvedSource["source"]["team"] }) {
  const teamId = team ?? person?.team;
  return (
    <div className="flex items-center gap-2">
      <PersonAvatar person={person} />
      <div className="min-w-0 text-sm leading-tight">
        <div className="font-medium text-gray-900">{person?.name ?? "Unknown speaker"}</div>
        {person?.role ? <div className="text-xs text-gray-500">{person.role}</div> : null}
      </div>
      {teamId ? <TeamTag team={teamId} /> : null}
    </div>
  );
}

// One source rendered as a card: meeting quote, Slack message or doc preview.
// Presentational (no data fetching) so the slide-over panel and the
// /trace/[sourceId] page share it.
export function SourceCard({
  item,
  onNavigate,
  standalone = false,
}: {
  item: ResolvedSource;
  onNavigate?: () => void; // e.g. close the panel after following a link
  standalone?: boolean; // on /trace/[sourceId] itself: hide the "Full page" link
}) {
  const { source, author, meetingTitle, jumpSec } = item;
  const type = TYPE_META[source.type] ?? TYPE_META.doc;
  const channel = source.title.startsWith("#") ? source.title.split(/\s+/)[0] : undefined;

  return (
    <article className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <header className="flex items-start gap-3 p-4 pb-3">
        <span
          className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${type.bg} ${type.text} ${type.ring}`}
        >
          <TypeIcon type={source.type} className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[11px] font-semibold uppercase tracking-wide ${type.text}`}>
              {type.label}
            </span>
            <FreshnessTag status={source.status} />
          </div>
          <h3 className="mt-0.5 break-words text-sm font-semibold text-gray-900">{source.title}</h3>
          <p className="text-xs text-gray-500">
            {formatSourceDate(source.date, source.type !== "doc")}
            {source.version ? ` · ${source.version}` : ""}
          </p>
        </div>
      </header>

      <div className="space-y-3 px-4 pb-4">
        {source.type === "meeting" ? (
          <>
            <blockquote className="whitespace-pre-wrap break-words border-l-4 border-violet-300 bg-violet-50/60 py-2 pl-3 pr-2 text-sm text-gray-800">
              {source.excerpt}
            </blockquote>
            <Speaker person={author} team={source.team} />
            {meetingTitle ? (
              <p className="text-xs text-gray-500">
                From <span className="font-medium text-gray-700">{meetingTitle}</span>
              </p>
            ) : null}
          </>
        ) : null}

        {source.type === "slack" ? (
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500">
              {channel ?? "Slack"}
            </div>
            <div className="flex gap-3 p-3">
              <PersonAvatar person={author} square />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-bold text-gray-900">
                    {author?.name ?? "Unknown user"}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {formatSourceDate(source.date, true)}
                  </span>
                  {source.team ?? author?.team ? (
                    <TeamTag team={(source.team ?? author?.team)!} />
                  ) : null}
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-800">
                  {source.excerpt}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {source.type === "doc" ? (
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-inner">
            <div className="mb-2 flex items-center justify-between text-[11px] text-gray-400">
              <span className="font-medium text-gray-500">{source.title}</span>
              {source.version ? <span>{source.version}</span> : null}
            </div>
            <div className="space-y-1.5" aria-hidden>
              <div className="h-1.5 w-11/12 rounded bg-gray-100" />
              <div className="h-1.5 w-4/5 rounded bg-gray-100" />
            </div>
            <p className="my-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-900">
              <mark className="rounded bg-yellow-200 px-0.5 py-0.5 box-decoration-clone">
                {source.excerpt}
              </mark>
            </p>
            <div className="space-y-1.5" aria-hidden>
              <div className="h-1.5 w-full rounded bg-gray-100" />
              <div className="h-1.5 w-3/5 rounded bg-gray-100" />
            </div>
            {source.team || author ? (
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                {author ? <span>{author.name}</span> : <span>Owned by</span>}
                {(source.team ?? author?.team) ? (
                  <TeamTag team={(source.team ?? author?.team)!} />
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          {source.type === "meeting" && source.meetingId ? (
            <Link
              href={
                source.segmentId
                  ? `/meetings/${source.meetingId}?segment=${source.segmentId}`
                  : `/meetings/${source.meetingId}`
              }
              onClick={onNavigate}
              className={actionCls}
            >
              Jump to moment{jumpSec !== undefined ? ` (${formatMmSs(jumpSec)})` : ""}
            </Link>
          ) : null}
          {source.type === "slack" ? <MockOpenLink url={source.url} label="Open in Slack" /> : null}
          {source.type === "doc" ? <MockOpenLink url={source.url} label="Open in Docs" /> : null}
          <CopyLinkButton sourceId={source.id} />
          {standalone ? null : (
            <Link
              href={`/trace/${source.id}`}
              onClick={onNavigate}
              className="ml-auto text-xs font-medium text-gray-500 hover:text-gray-900"
            >
              Full page →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default SourceCard;
