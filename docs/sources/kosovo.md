---
region: Kosovo
lastReviewed: 2026-10-19
links:
  - id: visaExempt
    url: https://ambasadat.net/visas/
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: high
    humanCheck: on-diff
---

# Kosovo

**Rules:** `src/data/regions/kosovo.ts` · **Sources:** `KosovoSources.visaExempt` (one entry)

A single MFA page lists every visa-exempt nationality. Every nationality not
on the list needs a visa, so the rules are the list plus a
`defaultRule: visa_required`.

## Provenance

Each of the 103 exempt nationalities on the page was encoded as entitled.
The page gives no per-country duration, so every entry gets the standard
90/180 with a note saying it's assumed. Kosovo's own passport (XK) is
free movement.

## visaExempt

**Establishes:** every Kosovo rule: the exempt list and, by omission, the
visa-required default.

**Machine:** diffed for text and links.

**Human:** open https://ambasadat.net/visas/ and read the list of countries
whose citizens don't need a visa. Compare it with the entitled entries in
`kosovo.ts`.

**Real change vs noise:**

- **Rule change:** a country added to or removed from the list. A sentence
  about conditions (e.g. holding a Schengen visa) or durations also matters.
- **Noise:** menu, footer and news-ticker changes on the site template.

**Human work:** confirm each list change against the page.

## Open questions

- TODO(human): find whether the MFA publishes per-country durations anywhere, which would replace the assumed 90/180.
