import { NextResponse } from "next/server";
import { analyzeTranscript } from "@/lib/ai/analyze";
import type { PriorMeetingContext } from "@/lib/ai/analysis-types";
import { getSessionUser } from "@/lib/auth";

// Coerce the client's prior-meeting context into a safe, bounded shape.
function coercePrior(raw: unknown): PriorMeetingContext[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, 8)
    .map((m) => {
      const it = (m ?? {}) as Record<string, unknown>;
      const title = typeof it.title === "string" ? it.title : "";
      const summaryPoints = Array.isArray(it.summaryPoints)
        ? it.summaryPoints.filter((p): p is string => typeof p === "string").slice(0, 12)
        : [];
      const transcript =
        typeof it.transcript === "string" ? it.transcript.slice(0, 4000) : undefined;
      return { title, summaryPoints, transcript };
    })
    .filter((m) => m.title.trim().length > 0);
}

// The Claude call can take a while; allow up to 60s (Vercel's max on Hobby).
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The server is missing ANTHROPIC_API_KEY. Add it in the Vercel project settings." },
      { status: 500 },
    );
  }

  let body: { transcript?: unknown; title?: unknown; priorMeetings?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const transcript = typeof body.transcript === "string" ? body.transcript : "";
  const title = typeof body.title === "string" ? body.title : "Untitled meeting";
  const prior = coercePrior(body.priorMeetings);
  if (transcript.trim().length < 20) {
    return NextResponse.json(
      { error: "The transcript is too short to analyze. Record or paste a bit more." },
      { status: 400 },
    );
  }

  try {
    const analysis = await analyzeTranscript(transcript, title, apiKey, prior);
    return NextResponse.json({ analysis });
  } catch (err) {
    return NextResponse.json(
      { error: `Analysis failed: ${(err as Error).message}` },
      { status: 502 },
    );
  }
}
