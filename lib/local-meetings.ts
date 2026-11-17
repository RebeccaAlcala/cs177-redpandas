// Meetings the user records live only in their browser (localStorage) — the
// chosen storage for this demo, so there's no backend or database. All reads
// and writes are guarded so a blocked/full store never crashes a page.

import type { LiveAnalysis } from "./ai/analysis-types";

export interface SavedMeeting {
  id: string;
  title: string;
  createdAt: string; // ISO
  transcript: string;
  analysis: LiveAnalysis;
}

const KEY = "mst.meetings.v1";

export function loadMeetings(): SavedMeeting[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as SavedMeeting[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveMeeting(meeting: SavedMeeting): void {
  try {
    const all = loadMeetings().filter((m) => m.id !== meeting.id);
    all.unshift(meeting);
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // ignore storage failures (private mode, quota)
  }
}

export function getSavedMeeting(id: string): SavedMeeting | undefined {
  return loadMeetings().find((m) => m.id === id);
}

export function deleteMeeting(id: string): void {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify(loadMeetings().filter((m) => m.id !== id)),
    );
  } catch {
    // ignore
  }
}

export function newMeetingId(): string {
  return `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
