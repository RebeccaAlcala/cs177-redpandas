"use client";

import { useEffect, useRef, useState } from "react";

// Copies the full-page /trace/<sourceId> URL to the clipboard.
export function CopyLinkButton({ sourceId }: { sourceId: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    const url = `${window.location.origin}/trace/${sourceId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard can be blocked (insecure context); fall back to a hidden textarea.
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
        <path d="M10 14a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66l-1 1" />
        <path d="M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 005.66 5.66l1-1" />
      </svg>
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}

export default CopyLinkButton;
