"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AnalysisView } from "@/components/record/AnalysisView";
import type { LiveAnalysis } from "@/lib/ai/analysis-types";
import { saveMeeting, newMeetingId, loadMeetings } from "@/lib/local-meetings";

// Minimal typing for the Web Speech API (not in the TS DOM lib).
type SpeechResult = { 0: { transcript: string }; isFinal: boolean };
interface SpeechEvent {
  resultIndex: number;
  results: ArrayLike<SpeechResult>;
}
interface Recognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
}
type RecognitionCtor = new () => Recognition;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// One line of the transcript, shown as a chat bubble.
interface Line {
  id: string;
  text: string;
  at: string; // clock time label
}

function clock(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

let lineSeq = 0;
function makeLine(text: string): Line {
  lineSeq += 1;
  return { id: `l_${Date.now()}_${lineSeq}`, text: text.trim(), at: clock() };
}

export default function RecordPage() {
  const [title, setTitle] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [interim, setInterim] = useState("");
  const [composer, setComposer] = useState("");
  const [recording, setRecording] = useState(false);
  const [supported, setSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<LiveAnalysis | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const recognitionRef = useRef<Recognition | null>(null);
  const recordingRef = useRef(false);
  const feedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
    return () => {
      recordingRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  // Keep the chat feed scrolled to the latest line.
  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight });
  }, [lines, interim]);

  function addLines(text: string) {
    const parts = text
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setLines((prev) => [...prev, ...parts.map(makeLine)]);
  }

  function startRecording() {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    setError(null);

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e: SpeechEvent) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          const finalText = r[0].transcript.trim();
          if (finalText) setLines((prev) => [...prev, makeLine(finalText)]);
        } else {
          interimText += r[0].transcript;
        }
      }
      setInterim(interimText);
    };
    rec.onerror = (e) => {
      if (e.error !== "no-speech" && e.error !== "aborted") {
        setError(`Microphone error: ${e.error}`);
      }
    };
    // Chrome ends the session on a pause; restart while still recording.
    rec.onend = () => {
      if (recordingRef.current) {
        try {
          rec.start();
        } catch {
          /* already starting */
        }
      } else {
        setInterim("");
      }
    };

    recognitionRef.current = rec;
    recordingRef.current = true;
    setRecording(true);
    rec.start();
  }

  function stopRecording() {
    recordingRef.current = false;
    setRecording(false);
    recognitionRef.current?.stop();
    setInterim("");
  }

  function removeLine(id: string) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  function clearAll() {
    setLines([]);
    setInterim("");
    setAnalysis(null);
    setSavedId(null);
    setError(null);
  }

  async function analyze() {
    setError(null);
    setAnalysis(null);
    setSavedId(null);
    if (recording) stopRecording();

    const transcript = lines.map((l) => l.text).join("\n");
    if (transcript.trim().length < 20) {
      setError("Record or add a bit more before summarizing.");
      return;
    }
    setLoading(true);
    try {
      // Send earlier recordings as context so the AI can catch contradictions
      // with prior meetings and cite which meeting the earlier claim came from.
      const priorMeetings = loadMeetings()
        .slice(0, 8)
        .map((m) => ({
          title: m.title,
          summaryPoints: m.analysis.summaryPoints,
          transcript: m.transcript,
        }));
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcript, title, priorMeetings }),
      });
      const data = (await res.json()) as { analysis?: LiveAnalysis; error?: string };
      if (!res.ok || !data.analysis) {
        throw new Error(data.error ?? "Something went wrong.");
      }
      setAnalysis(data.analysis);
      const id = newMeetingId();
      saveMeeting({
        id,
        title: title.trim() || "Untitled meeting",
        createdAt: new Date().toISOString(),
        transcript,
        analysis: data.analysis,
      });
      setSavedId(id);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const empty = lines.length === 0 && !interim;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display font-medium text-4xl tracking-tight text-gray-900">
          Record a meeting
        </h1>
        <Link href="/my-meetings" className="text-sm font-medium text-accent hover:underline">
          My meetings →
        </Link>
      </div>

      <div className="mb-6 flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
        <span aria-hidden>💡</span>
        <p>
          Start recording (or paste a transcript below), then{" "}
          <span className="font-medium text-gray-900">Summarize with AI</span> to get the
          summary, action items, conflicts, and unsourced-claim flags.
        </p>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Meeting title (e.g. Data export scoping)"
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-accent"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {supported ? (
          recording ? (
            <Button variant="secondary" onClick={stopRecording}>
              <span className="mr-2 inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
              Stop recording
            </Button>
          ) : (
            <Button onClick={startRecording}>● Start recording</Button>
          )
        ) : null}
        <Button variant="secondary" onClick={analyze} disabled={loading}>
          {loading ? "Summarizing…" : "Summarize with AI"}
        </Button>
        {lines.length > 0 ? (
          <button
            onClick={clearAll}
            className="text-sm text-gray-400 hover:text-red-600"
          >
            Clear
          </button>
        ) : null}
      </div>

      <p className="mt-3 text-sm text-gray-500">
        {supported
          ? "Click Start recording and talk — each thing said appears as a chat bubble below. "
          : "Live mic transcription needs Chrome or Edge. "}
        You can also type or paste lines using the box under the transcript.
      </p>

      {/* Chat-style transcript feed */}
      <div
        ref={feedRef}
        className="mt-4 flex h-80 flex-col gap-2 overflow-y-auto rounded-xl border border-gray-300 bg-gray-50/60 p-4"
      >
        {empty ? (
          <p className="m-auto text-sm text-gray-400">
            Your transcript will appear here, one message per line.
          </p>
        ) : (
          <>
            {lines.map((l) => (
              <div key={l.id} className="group flex flex-col items-start">
                <div className="flex max-w-[85%] items-end gap-2">
                  <div className="rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-800 shadow-sm">
                    {l.text}
                  </div>
                  <button
                    onClick={() => removeLine(l.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100 text-xs text-gray-400 hover:text-red-600"
                    aria-label="Delete line"
                  >
                    ✕
                  </button>
                </div>
                <span className="mt-0.5 pl-1 text-[11px] text-gray-400">{l.at}</span>
              </div>
            ))}
            {interim ? (
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-dashed border-gray-300 bg-white/70 px-3.5 py-2 text-sm italic text-gray-500">
                {interim}
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Add a line manually / paste */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addLines(composer);
          setComposer("");
        }}
        className="mt-3 flex items-start gap-2"
      >
        <textarea
          value={composer}
          onChange={(e) => setComposer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              addLines(composer);
              setComposer("");
            }
          }}
          rows={1}
          placeholder="Type a line and press Enter, or paste a transcript…"
          className="min-h-[42px] flex-1 resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-accent"
        />
        <Button type="submit" variant="secondary">
          Add
        </Button>
      </form>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {analysis ? (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-medium text-2xl text-gray-900">
              AI summary
            </h2>
            {savedId ? (
              <span className="text-xs text-gray-400">Saved to your browser ✓</span>
            ) : null}
          </div>
          <AnalysisView analysis={analysis} />
        </section>
      ) : null}
    </main>
  );
}
