import { NextResponse } from "next/server";
import { resolveContradiction, resolveSources } from "@/components/source/resolve";
import type { SourcesPayload } from "@/components/source/types";

// GET /trace/api?ids=src_001,src_002&contradicts=src_003
// Lets the client-side <SourceBadge>/<SourcePanel> load source details even
// though their props are just ids (docs/CONTRACT.md section 4).
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const ids = (params.get("ids") ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 50);
  const payload: SourcesPayload = {
    sources: resolveSources(ids),
    contradicts: resolveContradiction(params.get("contradicts") ?? undefined),
  };
  return NextResponse.json(payload);
}
