/**
 * sourceIndex.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Where a cited SourceDoc lives in the registry: its SourceRegions key and its
 * key there (e.g. { region: "Montenegro", key: "DZ" }). Used to record which
 * source a rule cites (rule-change log) and to label user reports.
 */

import type { SourceDoc } from "@/types";
import { SourceRegions } from "@/data/sources";

export type SourceRef = { region: keyof typeof SourceRegions; key: string };

let byDoc: Map<SourceDoc, SourceRef> | undefined;
let byUrl: Map<string, SourceRef> | undefined;
let regionByParentUrl: Map<string, SourceRef["region"]> | undefined;

function build() {
  byDoc = new Map();
  byUrl = new Map();
  regionByParentUrl = new Map();
  for (const [region, { sources }] of Object.entries(SourceRegions)) {
    for (const [key, doc] of Object.entries(sources as Record<string, SourceDoc>)) {
      const ref = { region: region as SourceRef["region"], key };
      if (!byDoc.has(doc)) byDoc.set(doc, ref);
      if (!byUrl.has(doc.direct.url)) byUrl.set(doc.direct.url, ref);
      if (!regionByParentUrl.has(doc.parent.url)) regionByParentUrl.set(doc.parent.url, ref.region);
    }
  }
}

/** The registry entry a SourceDoc is, by identity. */
export function sourceRefOf(doc: SourceDoc): SourceRef | undefined {
  if (!byDoc) build();
  return byDoc!.get(doc);
}

/**
 * Like sourceRefOf, but also places a SourceDoc built on the fly (the
 * calculator's region-level fallback) by its URL: as an entry when some
 * entry's direct link is that URL, else as a region (no key) when it's some
 * entry's parent page.
 */
export function findSourceRef(doc: SourceDoc): { region: SourceRef["region"]; key?: string } | undefined {
  if (!byUrl) build();
  const ref = sourceRefOf(doc) ?? byUrl!.get(doc.direct.url);
  if (ref) return ref;
  const region = regionByParentUrl!.get(doc.direct.url);
  return region && { region };
}
