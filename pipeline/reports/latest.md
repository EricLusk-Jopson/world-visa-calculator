# Source Verification Report

Generated: 2026-10-08T01:08:26.350Z

## Summary

| | |
|---|---|
| Unique links checked | 440 |
| 🔴 Broken | 24 |
| ↪️ Redirected | 5 |
| Content sources diffed (`parseForRules`) | 9 |
| ✏️ Changed since last baseline | 2 |
| 🆕 First run (no baseline yet) | 0 |
| ⚠️ Fetch errors | 1 |

## Schengen

### Link health

| Used by | Status | URL |
|---|---|---|
| visaList (directUrl) | ↪️ redirected (200) | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02018R1806-20251230<br>→ https://eur-lex.europa.eu/TodayOJ/index.html?uri=CELEX%3A02018R1806-20251230 |
| visaList, atvCommon, atvSpecific (parentUrl) | ✅ live (200) | https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en |
| atvCommon (directUrl) | ↪️ redirected (200) | https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02009R0810-20200202&qid=1700746099626#tocId629<br>→ https://eur-lex.europa.eu/TodayOJ/index.html?uri=CELEX:02009R0810-20200202&qid=1700746099626 |
| atvSpecific (directUrl) | ✅ live (200) | https://home-affairs.ec.europa.eu/document/download/7337515c-60a1-4510-b639-80de714f543e_en?filename=Annex%207b_en.pdf |
| etias (directUrl) | ↪️ redirected (200) | https://travel-europe.europa.eu/etias_en<br>→ https://travel-europe.europa.eu/en/etias |
| etias (parentUrl) | ↪️ redirected (200) | https://travel-europe.europa.eu<br>→ https://travel-europe.europa.eu/ |

### Content diffing

#### visaList — ✏️🔗 text + link changed

URL: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02018R1806-20251230

```diff
+ official_journal
+ How to verify the authenticity of the Official Journal
```

| Change | Anchor text | Previous target | Current target |
|---|---|---|---|
| added | How to verify the authenticity of the Official Journal | _(none)_ | https://checklex.publications.europa.eu/ |
| added | Series L | _(none)_ | javascript:; |
| added | Series C | _(none)_ | javascript:; |

#### atvCommon — ✏️🔗 text + link changed

URL: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02009R0810-20200202&qid=1700746099626#tocId629

```diff
+ official_journal
+ How to verify the authenticity of the Official Journal
```

| Change | Anchor text | Previous target | Current target |
|---|---|---|---|
| added | How to verify the authenticity of the Official Journal | _(none)_ | https://checklex.publications.europa.eu/ |
| added | Series L | _(none)_ | javascript:; |
| added | Series C | _(none)_ | javascript:; |

| Keys | Status | URL |
|---|---|---|
| atvSpecific | ✅ unchanged | https://home-affairs.ec.europa.eu/document/download/7337515c-60a1-4510-b639-80de714f543e_en?filename=Annex%207b_en.pdf |
| etias | ✅ unchanged | https://travel-europe.europa.eu/etias_en |

## UK

### Link health

| Used by | Status | URL |
|---|---|---|
| standardVisitor (directUrl) | ✅ live (200) | https://www.gov.uk/standard-visitor |
| standardVisitor (parentUrl) | ✅ live (200) | https://www.gov.uk/browse/visas-immigration/tourist-short-stay-visas |
| visaNationalList (directUrl) | ✅ live (200) | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-visitor-visa-national-list |
| visaNationalList (parentUrl) | ✅ live (200) | https://www.gov.uk/guidance/immigration-rules |
| etaNationalList (directUrl) | ✅ live (200) | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-eta-national-list |
| etaNationalList, etaApplication (parentUrl) | ✅ live (200) | https://www.gov.uk/eta |
| carriersList (directUrl) | ✅ live (200) | https://www.gov.uk/government/publications/uk-visa-requirements-list-for-carriers/uk-visa-requirements-for-international-carriers |
| carriersList (parentUrl) | ✅ live (200) | https://www.gov.uk/government/publications/uk-visa-requirements-list-for-carriers |
| etaApplication (directUrl) | 🔴 broken (404) | https://www.gov.uk/apply-for-an-electronic-travel-authorisation-eta |
| ctaGuidance (directUrl) | ✅ live (200) | https://www.gov.uk/government/publications/common-travel-area-guidance/common-travel-area-guidance |
| ctaGuidance (parentUrl) | ✅ live (200) | https://www.gov.uk/government/publications/common-travel-area-guidance |

### Content diffing

#### etaApplication — ⚠️ fetch error

URL: https://www.gov.uk/apply-for-an-electronic-travel-authorisation-eta
<br>Error: HTTP 404

| Keys | Status | URL |
|---|---|---|
| visaNationalList | ✅ unchanged | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-visitor-visa-national-list |
| etaNationalList | ✅ unchanged | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-eta-national-list |
| carriersList | ✅ unchanged | https://www.gov.uk/government/publications/uk-visa-requirements-list-for-carriers/uk-visa-requirements-for-international-carriers |
| ctaGuidance | ✅ unchanged | https://www.gov.uk/government/publications/common-travel-area-guidance/common-travel-area-guidance |

## Ireland

### Link health

| Used by | Status | URL |
|---|---|---|
| visaNationalityList (directUrl) | ✅ live (200) | https://www.irishimmigration.ie/visa-non-visa-required-nationalities/ |
| visaNationalityList, ctaGuidance, bivs (parentUrl) | ✅ live (200) | https://www.irishimmigration.ie/coming-to-visit-ireland/ |
| euFreeMovement (directUrl) | 🔴 broken (404) | https://www.irishimmigration.ie/coming-to-live-in-ireland/i-am-an-eu-eea-swiss-national/ |
| euFreeMovement (parentUrl) | ✅ live (200) | https://www.irishimmigration.ie/coming-to-live-in-ireland/ |
| ctaGuidance (directUrl) | ↪️ redirected (200) | https://www.irishimmigration.ie/coming-to-visit-ireland/common-travel-area/<br>→ https://www.irishimmigration.ie/at-the-border/common-travel-area/ |
| bivs (directUrl) | ✅ live (200) | https://www.irishimmigration.ie/coming-to-visit-ireland/british-irish-visa-scheme/ |
| citizensInformation (directUrl) | 🔴 broken (403) | https://www.citizensinformation.ie/en/moving-country/visas-for-ireland/visa-requirements-for-entering-ireland/ |
| citizensInformation (parentUrl) | 🔴 broken (403) | https://www.citizensinformation.ie/en/moving-country/visas-for-ireland/ |
| statutoryInstrument (directUrl) | ✅ live (200) | https://www.irishstatutebook.ie/eli/2014/si/473/made/en/print |
| statutoryInstrument (parentUrl) | ✅ live (200) | https://www.irishstatutebook.ie/eli/2014/si/473 |

### Content diffing

_No sources in this region are flagged `parseForRules`._

## Turkiye

### Link health

| Used by | Status | URL |
|---|---|---|
| mfaVisaInfo (directUrl) | ✅ live (200) | https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa |
| mfaVisaInfo (parentUrl) | ✅ live (200) | https://www.mfa.gov.tr/consular-info.en.mfa |
| eVisaApplication (directUrl) | 🔴 broken | https://www.evisa.gov.tr/en/<br>fetch failed |
| eVisaApplication, eVisaEligible (parentUrl) | 🔴 broken | https://www.evisa.gov.tr<br>fetch failed |
| eVisaEligible (directUrl) | 🔴 broken | https://www.evisa.gov.tr/en/info/who-is-eligible-for-e-visa/<br>fetch failed |

### Content diffing

_No sources in this region are flagged `parseForRules`._

## Montenegro

### Link health

| Used by | Status | URL |
|---|---|---|
| AF (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/afghanistan |
| AF, AL, DZ, AD, AO, AG, AR, AM … (+188 more) (parentUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro |
| AL (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/albania |
| DZ (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/algeria |
| AD (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/andorra |
| AO (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/angola |
| AG (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/antigua-and-barbuda |
| AR (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/argentina |
| AM (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/armenia |
| AW (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/aruba |
| AU (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/australia |
| AT (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/austria |
| AZ (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/azerbaijan |
| BS (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bahamas |
| BH (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bahrain |
| BD (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bangladesh |
| BB (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/barbados |
| BY (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/belarus |
| BE (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/belgium |
| BZ (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/belize |
| BJ (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/benin |
| BT (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bhutan |
| BO (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bolivia |
| BA (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bosnia-and-herzegovina |
| BW (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/botswana |
| BR (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/brazil |
| BN (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/brunei |
| BG (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bulgaria |
| BF (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/burkina-faso |
| BI (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/burundi |
| CV (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cabo-verde |
| KH (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cambodia |
| CM (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cameroon |
| CA (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/canada |
| KY (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cayman-islands |
| CF (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/central-african-republic |
| TD (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/chad |
| CL (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/chile |
| CN (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/china |
| CO (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/colombia |
| CD (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/congo-democratic-republic-of-the |
| CG (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/congo-republic |
| CR (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/costa-rica |
| HR (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/croatia |
| CU (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cuba |
| CY (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cyprus |
| CZ (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/czech-republic |
| DK (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/denmark |
| DJ (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/djibouti |
| DM (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/dominica |
| DO (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/dominican-republic |
| EC (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ecuador |
| EG (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/egypt |
| SV (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/el-salvador |
| GQ (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/equatorial-guinea |
| ER (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/eritrea |
| EE (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/estonia |
| ET (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ethiopia |
| FJ (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/fiji |
| FI (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/finland |
| FR (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/france |
| GA (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/gabon |
| GM (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/gambia |
| GE (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/georgia |
| DE (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/germany |
| GH (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ghana |
| GR (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/greece |
| GD (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/grenada |
| GT (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/guatemala |
| GN (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/guinea |
| GW (directUrl) | 🔴 broken | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/guinea-bissau<br>fetch failed |
| GY (directUrl) | 🔴 broken | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/guyana<br>fetch failed |
| HT (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/haiti |
| VA (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/holy-see-and-sovereign-military-order-of-malta |
| HN (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/honduras |
| HU (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/hungary |
| IS (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/iceland |
| IN (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/india |
| ID (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/indonesia |
| IR (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/iran |
| IQ (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/iraq |
| IE (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ireland |
| IL (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/israel |
| IT (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/italy |
| CI (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ivory-coast-cote-divoire |
| JM (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/jamaica |
| JP (directUrl) | 🔴 broken | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/japan<br>fetch failed |
| JO (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/jordan |
| KZ (directUrl) | 🔴 broken | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kazakhstan<br>fetch failed |
| KE (directUrl) | 🔴 broken | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kenya<br>fetch failed |
| KI (directUrl) | 🔴 broken | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kiribati<br>fetch failed |
| KP (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/korea-democratic-peoples-republic-of-north-korea |
| KR (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/korea-republic-of-south-korea |
| XK (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kosovo |
| KW (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kuwait |
| KG (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kyrgyzstan |
| LA (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/laos |
| LV (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/latvia |
| LB (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/lebanon |
| LS (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/lesotho |
| LR (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/liberia |
| LY (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/libya |
| LI (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/liechtenstein |
| LT (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/lithuania |
| LU (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/luxembourg |
| MG (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/madagascar |
| MW (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/malawi |
| MY (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/malaysia |
| MV (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/maldives |
| ML (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mali |
| MT (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/malta |
| MH (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/marshall-islands |
| MR (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mauritania |
| MU (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mauritius |
| MX (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mexico |
| FM (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/micronesia |
| MD (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/moldova |
| MC (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/monaco |
| MN (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mongolia |
| MA (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/morocco |
| MZ (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mozambique |
| MM (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/myanmar |
| NA (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/namibia |
| NR (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/nauru |
| NP (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/nepal |
| NL (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/netherlands |
| NZ (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/new-zealand |
| NI (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/nicaragua |
| NE (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/niger |
| NG (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/nigeria |
| MK (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/north-macedonia |
| NO (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/norway |
| OM (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/oman |
| PK (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/pakistan |
| PW (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/palau |
| PS (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/palestine |
| PA (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/panama |
| PG (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/papua-new-guinea |
| PY (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/paraguay |
| PE (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/peru |
| PH (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/philippines |
| PL (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/poland |
| PT (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/portugal |
| QA (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/qatar |
| RO (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/romania |
| RU (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/russian-federation |
| RW (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/rwanda |
| KN (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/saint-kitts-and-nevis |
| LC (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/saint-lucia |
| VC (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/saint-vincent-and-the-grenadines |
| WS (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/samoa |
| SM (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/san-marino |
| ST (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/sao-tome-and-principe-2 |
| SA (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/saudi-arabia |
| SN (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/senegal |
| RS (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/serbia |
| SC (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/seychelles |
| SL (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/sierra-leone |
| SG (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/singapore |
| SK (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/slovakia |
| SI (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/slovenia |
| SB (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/solomon-islands |
| SO (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/somalia |
| ZA (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/south-africa |
| ES (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/spain |
| LK (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/sri-lanka |
| SD (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/sudan |
| SR (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/suriname |
| SZ (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/swaziland-eswatini |
| SE (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/sweden |
| CH (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/switzerland |
| SY (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/syria |
| TJ (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/tajikistan |
| TZ (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/tanzania |
| TH (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/thailand |
| TL (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/timor-leste |
| TG (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/togo |
| TO (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/tonga |
| TT (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/trinidad-and-tobago |
| TN (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/tunisia |
| TR (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/turkey |
| TM (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/turkmenistan |
| TV (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/tuvalu |
| UG (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/uganda |
| UA (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ukraine |
| KM (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/union-of-the-comoros-and-swatziland-in-eswatini |
| AE (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/united-arab-emirates |
| GB (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/united-kingdom-of-great-britain-and-northern-ireland |
| US (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/united-states-of-america |
| UY (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/uruguay |
| UZ (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/uzbekistan |
| VU (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/vanuatu |
| VE (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/venezuela |
| VN (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/vietnam |
| YE (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/yemen |
| ZM (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/zambia |
| ZW (directUrl) | ✅ live (200) | https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/zimbabwe |

### Content diffing

_No sources in this region are flagged `parseForRules`._

## Serbia

### Link health

| Used by | Status | URL |
|---|---|---|
| AF (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/avganistan |
| AF, AL, DZ, AD, AO, AG, AR, AM … (+189 more) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime |
| AL (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/albanija |
| DZ (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/alzir |
| AD (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/andora |
| AO (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/angola |
| AG (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/antigva-i-barbuda |
| AR (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/argentina |
| AM (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/jermenija |
| AU (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/australija |
| AT (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/austrija |
| AZ (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/azerbejdzan |
| BS (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bahami |
| BH (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bahrein |
| BD (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/banglades |
| BB (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/barbados |
| BY (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/belorusija |
| BE (directUrl) | 🔴 broken | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/belgija<br>fetch failed |
| BZ (directUrl) | 🔴 broken | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/belize<br>fetch failed |
| BJ (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/benin |
| BT (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/butan |
| BO (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bolivija |
| BA (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bosna-i-hercegovina |
| BW (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bocvana |
| BR (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/brazil |
| BN (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/brunej-darusalam |
| BG (directUrl) | 🔴 broken | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bugarska<br>fetch failed |
| BF (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/burkina-faso |
| BI (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/burundi |
| CV (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kabo-verde |
| KH (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kambodza |
| CM (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kamerun |
| CA (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kanada |
| CF (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/centralnoafricka-republika |
| TD (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/cad |
| CL (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/cile |
| CN, HK, MO (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kina |
| CO (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kolumbija |
| CD (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kongo-demokratska-republika |
| CG (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kongo-republika |
| CR (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kostarika |
| CI (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kot-d-ivoar |
| HR (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/hrvatska |
| CU (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kuba |
| CY (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kipar |
| CZ (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ceska |
| DK (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/danska |
| DJ (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/dzibuti |
| DM (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/dominika |
| DO (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/dominikanska-republika |
| EC (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ekvador |
| EG (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/egipat |
| SV (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/el-salvador |
| GQ (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ekvatorijalna-gvineja |
| ER (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/eritreja |
| EE (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/estonija |
| SZ (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/esvatini |
| ET (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/etiopija |
| FJ (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/fidzi |
| FI (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/finska |
| FR (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/francuska |
| GA (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gabon |
| GM (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gambija |
| GE (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gruzija |
| DE (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/nemacka |
| GH (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gana |
| GR (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/grcka |
| GD (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/grenada |
| GT (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gvatemala |
| GN (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gvineja-republika |
| GW (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gvineja-bisao |
| GY (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gvajana |
| HT (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/haiti |
| VA (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sveta-stolica |
| HN (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/honduras |
| HU (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/madjarska |
| IS (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/island |
| IN (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/indija |
| ID (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/indonezija |
| IR (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/iran |
| IQ (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/irak |
| IE (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/irska |
| IL (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/izrael |
| IT (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/italija |
| JM (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/jamajka |
| JP (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/japan |
| JO (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/jordan |
| KZ (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kazahstan |
| KE (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kenija |
| KI (directUrl) | 🔴 broken | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kiribati<br>fetch failed |
| KP (directUrl) | 🔴 broken | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/korea-dpr<br>fetch failed |
| KR (directUrl) | 🔴 broken | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/koreja-republika<br>fetch failed |
| KW (directUrl) | 🔴 broken | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kuvajt<br>fetch failed |
| KG (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kirgiska-republika |
| LA (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/laos |
| LV (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/letonija |
| LB (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/liban |
| LS (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/lesoto |
| LR (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/liberija |
| LY (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/libija |
| LI (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/lihtenstajn |
| LT (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/litvanija |
| LU (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/luksemburg |
| MG (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/madagaskar |
| MW (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/malavi |
| MY (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/malezija |
| MV (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/maldives |
| ML (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mali |
| MT (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/malta |
| MH (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/marshall-islands |
| MR (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mauritania |
| MU (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mauritius |
| MX (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/meksiko |
| FM (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/micronesia |
| MD (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/moldavija |
| MC (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/monako |
| MN (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mongolija |
| ME (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/crna-gora |
| MA (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/maroko |
| MZ (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mozambik |
| MM (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mjanmar |
| NA (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/namibija |
| NR (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/nauru |
| NP (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/nepal |
| NL (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/holandija |
| NZ (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/novi-zeland |
| NI (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/nikaragva |
| NE (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/niger |
| NG (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/nigerija |
| MK (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/severna-makedonija |
| NO (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/norveska |
| OM (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/oman |
| PK (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/pakistan |
| PW (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/palau |
| PS (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/palestina |
| PA (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/panama |
| PG (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/papua-nova-gvineja |
| PY (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/paragvaj |
| PE (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/peru |
| PH (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/filipini |
| PL (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/poljska |
| PT (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/portugalija |
| QA (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/katar |
| RO (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/rumunija |
| RU (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ruska-federacija |
| RW (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ruanda |
| KN (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sent-kits-i-nevis |
| LC (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sveta-lucija |
| VC (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sveti-vinsent-i-grenadini |
| WS (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/samoa |
| SM (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/san-marino |
| ST (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sao-tome-i-prinsipe |
| SA (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/saudijska-arabija |
| SN (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/senegal |
| SC (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sejseli |
| SL (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sijera-leone |
| SG (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/singapur |
| SK (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/slovacka |
| SI (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/slovenija |
| SB (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/solomonova-ostrva |
| SO (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/somalija |
| ZA (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/juzna-afrika |
| SS (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/juzni-sudan |
| ES (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/spanija |
| LK (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sri-lanka |
| SD (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sudan |
| SR (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/surinam |
| SE (directUrl) | 🔴 broken | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/svedska<br>fetch failed |
| CH (directUrl) | 🔴 broken | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/svajcarska<br>fetch failed |
| SY (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sirija |
| TJ (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tadzikistan |
| TZ (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tanzanija |
| TH (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tajland |
| TL (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/istocni-timor |
| TG (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/togo |
| TO (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tonga |
| TT (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/trinidad-i-tobago |
| TN (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tunis |
| TR (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/turska |
| TM (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/turkmenistan |
| TV (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tuvalu |
| UG (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/uganda |
| UA (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ukrajina |
| KM (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/unija-komora |
| AE (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ujedinjeni-arapski-emirati |
| GB (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ujedinjeno-kraljevstvo |
| US (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sjedinjene-americke-drzave |
| UY (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/urugvaj |
| UZ (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/uzbekistan-republika |
| VU (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/vanuatu |
| VE (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/venecuela |
| VN (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/vijetnam |
| YE (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/jemen |
| ZM (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/zambija |
| ZW (directUrl) | ✅ live (200) | https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/zimbabve |

### Content diffing

_No sources in this region are flagged `parseForRules`._

## Bosnia

### Link health

| Used by | Status | URL |
|---|---|---|
| AD, AE, AF, AG, AL, AM, AO, AR … (+187 more) | 🔴 broken | https://www.mvp.gov.ba/en/vize<br>fetch failed |

### Content diffing

_No sources in this region are flagged `parseForRules`._

## Kosovo

### Link health

| Used by | Status | URL |
|---|---|---|
| AD, AE, AG, AL, AR, AT, AU, BB … (+95 more) | ✅ live (200) | https://ambasadat.net/visas/ |

### Content diffing

_No sources in this region are flagged `parseForRules`._

## NorthMacedonia

### Link health

| Used by | Status | URL |
|---|---|---|
| AD, AE, AF, AG, AL, AM, AO, AR … (+189 more) | ✅ live (200) | https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza |

### Content diffing

_No sources in this region are flagged `parseForRules`._

## Albania

### Link health

| Used by | Status | URL |
|---|---|---|
| AD, AE, AF, AG, AM, AO, AR, AT … (+158 more) (directUrl) | ✅ live (200) | https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/ |
| AD, AE, AF, AG, AM, AO, AR, AT … (+158 more) (parentUrl) | ✅ live (200) | https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/ |

### Content diffing

_No sources in this region are flagged `parseForRules`._

## Cyprus

### Link health

| Used by | Status | URL |
|---|---|---|
| visaList (directUrl) | ✅ live (200) | https://home-affairs.ec.europa.eu/document/download/ebd6113d-4d14-4ac2-ac9b-47f2e7976515_en?filename=Annex%201_en.pdf |
| visaList (parentUrl) | 🔴 broken (403) | https://www.gov.cy/en/information/visas/ |

### Content diffing

_No sources in this region are flagged `parseForRules`._

## Belarus

### Link health

| Used by | Status | URL |
|---|---|---|
| general | ✅ live (200) | https://mfa.gov.by/en/visa/general/ |
| europe (directUrl) | ✅ live (200) | https://mfa.gov.by/en/visa/freemove/europe/ |
| europe, airport (parentUrl) | ✅ live (200) | https://mfa.gov.by/en/visa/freemove/ |
| airport (directUrl) | ✅ live (200) | https://mfa.gov.by/en/visa/freemove/airport/ |

### Content diffing

_No sources in this region are flagged `parseForRules`._

## Georgia

### Link health

| Used by | Status | URL |
|---|---|---|
| visaList (directUrl) | ✅ live (200) | https://geoconsul.gov.ge/en/entering-georgia-visa |
| visaList (parentUrl) | ✅ live (200) | https://geoconsul.gov.ge/en/entering-georgia |

### Content diffing

_No sources in this region are flagged `parseForRules`._

## Armenia

### Link health

| Used by | Status | URL |
|---|---|---|
| visaFreeList (directUrl) | ✅ live (200) | https://www.mfa.am/en/visafreelist |
| visaFreeList, bilateralList (parentUrl) | ✅ live (200) | https://www.mfa.am/en/visa/ |
| bilateralList (directUrl) | ✅ live (200) | https://www.mfa.am/en/whoneedvisa |

### Content diffing

_No sources in this region are flagged `parseForRules`._
