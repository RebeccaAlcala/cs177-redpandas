"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AnalysisView } from "@/components/record/AnalysisView";
import type { LiveAnalysis } from "@/lib/ai/analysis-types";
import { saveMeeting, newMeetingId } from "@/lib/local-meetings";

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

export default function RecordPage() {
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [supported, setSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<LiveAnalysis | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const recognitionRef = useRef<Recognition | null>(null);
  const recordingRef = useRef(false);
  const baseRef = useRef(""); // finalized transcript text, without interim words

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
    return () => {
      recordingRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  function startRecording() {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    setError(null);
    baseRef.current = transcript ? transcript.trimEnd() + " " : "";

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e: SpeechEvent) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) baseRef.current += r[0].transcript + " ";
        else interim += r[0].transcript;
      }
      setTranscript(baseRef.current + interim);
    };
    rec.onerror = (e) => {
      if (e.error !== "no-speech" && e.error !== "aborted") {
        setError(`Microphone error: ${e.error}`);
      }
    };
    // Chrome ends the session on a pause; restart while the user is still recording.
    rec.onend = () => {
      if (recordingRef.current) {
        try {
          rec.start();
        } catch {
          /* already starting */
        }
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
  }

  async function analyze() {
    setError(null);
    setAnalysis(null);
    setSavedId(null);
    if (recording) stopRecording();
    if (transcript.trim().length < 20) {
      setError("Record or paste a bit more before summarizing.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcript, title }),
      });
      const data = (await res.json()) as { analysis?: LiveAnalysis; error?: string };
      if (!res.ok || !data.analysis) {
        throw new Error(data.error ?? "Something went wrong.");
      }
      setAnalysis(data.analysis);
      // Auto-save to the browser.
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
      </div>

      {!supported ? (
        <p className="mt-3 text-sm text-gray-500">
          Live mic transcription needs Chrome or Edge. In other browsers, type or
          paste a transcript below and hit <strong>Summarize with AI</strong>.
        </p>
      ) : (
        <p className="mt-3 text-sm text-gray-500">
          Click <strong>Start recording</strong> and talk — your words appear
          below. You can also edit or paste a transcript before summarizing.
        </p>
      )}

      <textarea
        value={transcript}
        onChange={(e) => {
          setTranscript(e.target.value);
          baseRef.current = e.target.value;
        }}
        readOnly={recording}
        rows={10}
        placeholder="Transcript will appear here as you speak, or paste one in…"
        className="mt-4 w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-relaxed text-gray-900 outline-none focus:border-accent"
      />

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
