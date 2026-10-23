---
region: Belarus
lastReviewed: 2026-10-23
links:
  - id: general
    url: https://mfa.gov.by/en/visa/general/
    loadBearing: true
    category: index
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: periodic
  - id: freemove
    url: https://mfa.gov.by/en/visa/freemove/
    loadBearing: false
    category: index
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
  - id: europe
    url: https://mfa.gov.by/en/visa/freemove/europe/
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: high
    humanCheck: on-diff
  - id: airport
    url: https://mfa.gov.by/en/visa/freemove/airport/
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: medium
    humanCheck: on-diff
  - id: bilateral
    url: https://mfa.gov.by/en/visa/freemove/general/
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: medium
    humanCheck: on-diff
  - id: airportPdf
    url: https://mfa.gov.by/kcfinder/upload/files/GKU/21.10.17_List_countries_eng.pdf
    loadBearing: true
    category: document
    revisions: replaced-file
    access: open
    machineCheck: diff
    diffConfidence: low
    humanCheck: periodic
---

# Belarus

**Rules:** `src/data/regions/belarus.ts` · **Sources:** `BelarusSources` (`general`, `europe`, `airport`, `bilateral`)

Belarus's rules come in five tiers (see the header of `belarus.ts`):

1. **European any-border override:** 38 countries, 30 days per visit (90 for
   Poland, Latvia and Lithuania). Valid until 31 December 2026, modelled as a
   TemporalWindow.
2. **Airport-only fallback:** for every visa-free nationality. 30 days per
   visit through six named airports, with no yearly cap (the 90-day yearly
   total belongs to the European override only; rule-change 12).
3. **Conditional entries:** 11 nationalities need an EU/Schengen visa, so
   they are modelled as visa-required with a note. (Vietnam also carries
   this footnote on the airport list, but `bilateral` makes it visa-free
   outright, so it's in tier 5.)
4. **Bilateral visa-free, no stated stay:** 11 nationalities (Armenia,
   Azerbaijan, Ecuador, Georgia, Kazakhstan, Kyrgyzstan, Moldova, Russia,
   Tajikistan, Ukraine, Uzbekistan) that `bilateral` lists without a
   duration. They're visa-free with an assumed 90 days in any 180 and a note
   saying the MFA states no maximum stay (rule-change 13).
5. **Bilateral visa-free, stated stay:** 22 nationalities that `bilateral`
   lists with a stay, modelled from its wording, through any border
   (rule-change 14). This replaces the airport tier for Nicaragua and Oman.

## Provenance

Tiers 1–3 were transcribed by hand from the `general`, `europe` and
`airport` pages and the airport PDF on 2026-09-12. Tier 4 was added on
2026-10-23 from the `bilateral` page, which the maintainer pasted. The paste
interleaved the page's two columns row by row; both columns are
alphabetical, which is how they were separated (see `bilateral`).

## general

**Establishes:** the visa-required default (`defaultRule.source`).

**Machine:** health-checked only. It's a menu of visa subpages, so there's
nothing useful to diff.

**Human:** open it and follow "Visa-free travel" to confirm the overall
structure (airport-only regime, European override) still holds.

**Real change vs noise:** not diffed.

**Human work:** a quick periodic look. A new visa-free scheme would appear
as a new subpage.

## freemove

**Establishes:** nothing. It's the menu linking `europe` and `airport`.

**Machine:** health-checked only.

**Human:** navigate from here. A new entry in this menu means a new scheme.

**Real change vs noise:** not diffed.

**Human work:** none.

## europe

**Establishes:** tier 1, the 38-country override and its end date.

**Machine:** diffed. The sidebar and footer are cut off at "Belarusian
Diplomatic Missions abroad" (`SITE_CONTENT_END` in
`pipeline/src/contentCheck.ts`).

**Human:** open the page. Read the country list, the days per visit, and
the "up to and including 31 December 2026" date.

**Real change vs noise:**

- **Rule change:** the end date extended. Append a new TemporalWindow; don't
  edit the old one.
- **Rule change:** a country added or removed, or the days changed.
- **Noise:** news items in the page body, if any.

**Human work:** confirm and update `belarus.ts`.

## airport

**Establishes:** tier 2 (the airport list and terms) and tier 3 (the
conditional nationalities).

**Machine:** diffed. Same sidebar cut as `europe`.

**Human:** open the page. Read the airports, the 30 days per visit, and the
conditions for the nationalities that need an EU/Schengen visa (12 on the
page; Vietnam is modelled from `bilateral` instead). The page
states no yearly cap for this scheme. Only `europe` states one ("must not
exceed 90 days within a calendar year"), for its own scheme. If a yearly cap
ever appears here, that's a rule change.

**Real change vs noise:**

- **Rule change:** an airport added, the terms changed, or the conditional
  list changed.
- **Noise:** layout changes.

**Human work:** confirm and update `belarus.ts`.

## bilateral

**Establishes:** tiers 4 and 5, the nationalities visa-free under
bilateral agreements, with each one's stay where the page gives it.

**Machine:** diffed, with the same sidebar cut as `europe` (first baseline
in the next report after 2026-10-23).

**Human:** open https://mfa.gov.by/en/visa/freemove/general/ in a browser.
The table has two columns. The **left** one, "Belarusian citizens with
ordinary passports to", is about Belarusians travelling abroad; ignore it.
The **right** one, "Foreign nationals with ordinary passports to the
Republic of Belarus", is what the app models. Read it in the browser, or
copy that column alone. Copying the whole page interleaves the two columns
row by row, as on 2026-10-23. Printing the page to PDF keeps the columns
apart: `pdftotext -layout` then puts the right column in its own text
column. Page breaks overprint the site header on a row or two (Myanmar and
Ukraine on 2026-10-23), so check those rows on the page.

On 2026-10-23 the right column held 34 entries, then the three cross-scheme
rows (Brest-Grodno, airports, European countries). The maintainer's PDF of
the page confirmed this table:

| Stay on the page | Nationalities | In the app |
|---|---|---|
| none given | Armenia, Azerbaijan, Ecuador, Georgia, Kazakhstan, Kyrgyzstan, Moldova, Russia, Tajikistan, Ukraine, Uzbekistan | tier 4, 90/180 assumed |
| 30 days per entry, 90 per calendar year | Albania | tier 5: 30 per visit + 90 per calendar year |
| 90 days from first entry within the calendar year | Argentina | tier 5: 90 per calendar year |
| 90 days | Brazil, Colombia, Mongolia, Nicaragua, Venezuela | tier 5: 90 per visit |
| 90 days in each 180 | Israel | tier 5: 90/180 rolling |
| 90 days from the date of entry | United Arab Emirates | tier 5: 90 per visit |
| 30 days, at most 90 per calendar year | China, Macao | tier 5: 30 per visit + 90 per calendar year |
| 30 days per stay | Hong Kong | tier 5: 30 per visit |
| 30 days | Cuba, Laos, Montenegro, Myanmar, Oman, Qatar, Saint Kitts and Nevis, Serbia, Türkiye, Vietnam | tier 5: 30 per visit |
| invitation required | North Macedonia | European override until 2026-12-31 |

**Real change vs noise:**

- **Rule change:** a nationality added to or removed from the right column,
  or its stay changed.
- **Noise:** anything in the left column (Belarusians abroad) and its
  `***` "for reference only" footnote.
- **Read it:** the diff is page text, so the two columns may appear
  interleaved in it, just like a copy-paste. Check which column a changed
  line belongs to on the live page before calling it a rule change.

**Human work:** confirm and update `belarus.ts` on a diff.

## airportPdf

**Establishes:** the visa-free country list itself, which lives in this PDF.

**Machine:** diffed by hash only. A change says that the file changed, not
what changed. If the MFA publishes a new list under a new filename, this
link breaks or goes stale; the filename is dated `21.10.17`.

**Human:** open the PDF and compare its list with the `airportOnly()`
entries in `belarus.ts`.

**Real change vs noise:** any hash change is worth reading. Also watch
`airport` for a link to a newer PDF.

**Human work:** a periodic look for a newer list. A full read whenever the
hash changes.

## Open questions

- TODO(human): tier 4's 90-in-180 is an assumption. The real limits are in each bilateral
  agreement (Russia's Union State regime is broader). Replace it per country if an official
  figure turns up, e.g. on the State Border Committee site.
- Visa rules (not visa-free entry) now come from new Visa Regulations, Council of Ministers decree
  No. 464 of 14 September 2026, per https://mfa.gov.by/en/visa/oformlenie/. They don't change any
  rule this app models; watch for knock-on changes to visa-free schemes.
- The `general` menu also lists "Visa-free travel to Brest-Grodno" (up to 15 days in the Brest and
  Augustów Canal tourist areas). It's regional, so it isn't modelled.
- The European override ends on 31 December 2026. Check the `europe` page in December for an extension.
