"use client";

import { useEffect, useState } from "react";
import type { SourcesPayload } from "./types";

// Module-level cache so ten badges on a page don't refetch the same sources
// and opening a panel after the badge already loaded is instant.
const cache = new Map<string, Promise<SourcesPayload>>();

function load(query: string): Promise<SourcesPayload> {
  let p = cache.get(query);
  if (!p) {
    p = fetch(`/trace/api?${query}`).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json() as Promise<SourcesPayload>;
    });
    p.catch(() => cache.delete(query)); // allow a retry after a failure
    cache.set(query, p);
  }
  return p;
}

export function useSources(ids: string[], contradictsSourceId?: string, enabled = true) {
  const params = new URLSearchParams({ ids: ids.join(",") });
  if (contradictsSourceId) params.set("contradicts", contradictsSourceId);
  const query = params.toString();

  const [state, setState] = useState<{ query: string; data?: SourcesPayload; error?: boolean }>({
    query: "",
  });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    load(query).then(
      (data) => !cancelled && setState({ query, data }),
      () => !cancelled && setState({ query, error: true }),
    );
    return () => {
      cancelled = true;
    };
  }, [query, enabled]);

  const ready = state.query === query;
  return {
    data: ready ? state.data : undefined,
    error: ready && !!state.error,
    loading: enabled && !ready,
  };
}
