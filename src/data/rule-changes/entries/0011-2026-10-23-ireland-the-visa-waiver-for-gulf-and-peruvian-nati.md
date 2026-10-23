---
id: 11
title: "Ireland: the visa waiver for Gulf and Peruvian nationals needs a pre-ETA UK visa"
recorded: 2026-10-23
trigger:
  type: manual
  ref: periodic check of ssvwp
evidence:
  - region: Ireland
    link: ssvwp
changes:
  - region: ireland
    path: passportRules.BH
    before: visa required · 1 note
    after: visa required · 2 notes
  - region: ireland
    path: passportRules.KW
    before: visa required · 1 note
    after: visa required · 2 notes
  - region: ireland
    path: passportRules.OM
    before: visa required · 1 note
    after: visa required · 2 notes
  - region: ireland
    path: passportRules.PE
    before: visa required · 1 note
    after: visa required · 2 notes
  - region: ireland
    path: passportRules.QA
    before: visa required · 1 note
    after: visa required · 2 notes
  - region: ireland
    path: passportRules.SA
    before: visa required · 1 note
    after: visa required · 2 notes
---

## What changed and why

The app told Bahraini, Kuwaiti, Omani, Qatari, Saudi and Peruvian nationals
that any valid UK short-stay visa lets them enter Ireland under the Short
Stay Visa Waiver Programme (SSVWP). The SSVWP page adds a restriction for
these six: they now travel to the UK on an Electronic Travel Authorisation
(ETA), and an ETA doesn't count. Only a UK visa issued before the ETA
started on 1 February 2024 qualifies. Each of the six now carries a second
SSVWP note saying so. The other 13 SSVWP nationalities keep the plain note.

The page was last updated on 9 May 2025, so this corrects a transcription
gap. It isn't a new change in reality.

## Evidence

INIS "Short Stay Visa Waiver Programme" (`ssvwp`), Note 2:

> In the case of nationals from the Saudi Arabia, Bahrain, Kuwait, Oman,
> Qatar and Peru, the United Kingdom (UK) Electronic Travel Authorisation
> cannot be used to travel to Ireland.
>
> Only those who enter the UK with an existing valid short-stay UK visa
> issued before the introduction of the ETA on 1 February 2024, including a
> multi-entry UK visa, are able to avail of the Short Stay Visa Waiver
> Scheme to travel to Ireland.

## Checked

The maintainer read the live page on 2026-10-23. The country list (19, plus
India and China under BIVS and Ukraine, which needs no visa) matches
`ireland.ts`. The page gives no end date for the programme. The maintainer also
pasted the full INIS nationality table (206 rows) the same day. Every
row's visa-required status matches `ireland.ts`, including these six (all
"Yes"). `lastVerified` in `ireland.ts` was bumped to 2026-10-23, and so was `dateChecked` on the
SSVWP source.
