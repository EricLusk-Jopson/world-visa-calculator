# Sources at a glance

Generated from the playbooks in this folder by `npm run playbooks:overview`; don't edit by hand.
Field meanings are in [README.md](README.md).

## Load-bearing links

| Region | Link | Category | Revisions | Access | Machine check | Diff confidence | Human check |
|---|---|---|---|---|---|---|---|
| Albania | [`visaTable`](albania.md#visatable) | interactive | in-place | bot-protected | via `visaTableCountries` | none | **manual only** |
| Albania | [`visaTableCountries`](albania.md#visatablecountries) | machine-copy | in-place | bot-protected | resolver | high | **manual only** |
| Armenia | [`visaFreeList`](armenia.md#visafreelist) | html-page | in-place | open | diff | high | on diff |
| Armenia | [`bilateralList`](armenia.md#bilaterallist) | html-page | in-place | open | diff | medium | on diff |
| Belarus | [`general`](belarus.md#general) | index | in-place | open | link-only | none | periodic |
| Belarus | [`europe`](belarus.md#europe) | html-page | in-place | open | diff | high | on diff |
| Belarus | [`airport`](belarus.md#airport) | html-page | in-place | open | diff | medium | on diff |
| Belarus | [`bilateral`](belarus.md#bilateral) | html-page | in-place | open | diff | medium | on diff |
| Belarus | [`airportPdf`](belarus.md#airportpdf) | document | replaced-file | open | diff | low | periodic |
| Bosnia | [`vize`](bosnia.md#vize) | interactive | regenerated | open | diff | low | on diff |
| Bosnia | [`subpages`](bosnia.md#subpages) | machine-copy | regenerated | open | resolver | high | on diff |
| Cyprus | [`euVisaList`](cyprus.md#euvisalist) | document | consolidated-versions | open | via `euVisaListCellar` | none | periodic |
| Cyprus | [`euVisaListCellar`](cyprus.md#euvisalistcellar) | machine-copy | consolidated-versions | open | diff | low | periodic |
| Georgia | [`visaList`](georgia.md#visalist) | html-page | in-place | script-rendered | via `visaListApi` | none | on diff |
| Georgia | [`visaListApi`](georgia.md#visalistapi) | machine-copy | in-place | open | diff | high | on diff |
| Ireland | [`visaNationalityList`](ireland.md#visanationalitylist) | interactive | in-place | script-rendered | link-only | none | periodic |
| Ireland | [`euFreeMovement`](ireland.md#eufreemovement) | html-page | in-place | open | link-only | none | periodic |
| Ireland | [`ctaGuidance`](ireland.md#ctaguidance) | html-page | in-place | open | link-only | none | periodic |
| Ireland | [`bivs`](ireland.md#bivs) | html-page | in-place | open | link-only | none | periodic |
| Ireland | [`ssvwp`](ireland.md#ssvwp) | html-page | in-place | open | link-only | none | periodic |
| Ireland | [`transitVisa`](ireland.md#transitvisa) | html-page | in-place | open | link-only | none | periodic |
| Ireland | [`statutoryInstrument`](ireland.md#statutoryinstrument) | document | separate-amendments | open | via `amendmentSearchApi` | none | on diff |
| Ireland | [`amendmentSearchApi`](ireland.md#amendmentsearchapi) | machine-copy | separate-amendments | open | diff | high | on diff |
| Kosovo | [`visaExempt`](kosovo.md#visaexempt) | html-page | in-place | open | diff | high | on diff |
| Montenegro | [`countryPages`](montenegro.md#countrypages) | html-page | in-place | open | diff | medium | on diff |
| NorthMacedonia | [`visaPage`](north-macedonia.md#visapage) | interactive | regenerated | open | via `countryButtons` | none | on diff |
| NorthMacedonia | [`countryButtons`](north-macedonia.md#countrybuttons) | machine-copy | regenerated | open | resolver | high | on diff |
| Schengen | [`visaList`](schengen.md#visalist) | document | consolidated-versions | open | via `visaListCellar` | none | periodic |
| Schengen | [`visaListCellar`](schengen.md#visalistcellar) | machine-copy | consolidated-versions | open | diff | low | periodic |
| Schengen | [`atvCommon`](schengen.md#atvcommon) | document | consolidated-versions | open | via `atvCommonCellar` | none | periodic |
| Schengen | [`atvCommonCellar`](schengen.md#atvcommoncellar) | machine-copy | consolidated-versions | open | diff | low | periodic |
| Schengen | [`atvSpecific`](schengen.md#atvspecific) | document | replaced-file | open | diff | low | periodic |
| Schengen | [`etias`](schengen.md#etias) | html-page | in-place | script-rendered | link-only | none | periodic |
| Serbia | [`countryPages`](serbia.md#countrypages) | html-page | in-place | open | diff | medium | on diff |
| Turkiye | [`mfaVisaInfo`](turkiye.md#mfavisainfo) | html-page | in-place | open | diff | medium | on diff |
| UK | [`appendixVisitor`](uk.md#appendixvisitor) | html-page | in-place | open | diff | high | on diff |
| UK | [`visaNationalList`](uk.md#visanationallist) | html-page | in-place | open | diff | high | on diff |
| UK | [`etaNationalList`](uk.md#etanationallist) | html-page | in-place | open | diff | high | on diff |
| UK | [`carriersList`](uk.md#carrierslist) | html-page | in-place | open | diff | medium | on diff |
| UK | [`etaApply`](uk.md#etaapply) | html-page | in-place | open | diff | high | on diff |
| UK | [`ctaGuidance`](uk.md#ctaguidance) | html-page | in-place | open | diff | medium | on diff |

## Human checklist

Links to look at by hand, whether or not the report flags them.

- **Albania** (last reviewed 2026-10-23): [`visaTable`](albania.md#visatable) (manual only), [`visaTableCountries`](albania.md#visatablecountries) (manual only), [`visaRegime`](albania.md#visaregime) (manual only)
- **Belarus** (last reviewed 2026-10-23): [`general`](belarus.md#general), [`airportPdf`](belarus.md#airportpdf)
- **Cyprus** (last reviewed 2026-10-23): [`euVisaList`](cyprus.md#euvisalist), [`euVisaListCellar`](cyprus.md#euvisalistcellar)
- **Ireland** (last reviewed 2026-10-23): [`visaNationalityList`](ireland.md#visanationalitylist), [`euFreeMovement`](ireland.md#eufreemovement), [`ctaGuidance`](ireland.md#ctaguidance), [`bivs`](ireland.md#bivs), [`ssvwp`](ireland.md#ssvwp), [`transitVisa`](ireland.md#transitvisa)
- **Schengen** (last reviewed 2026-10-23): [`visaList`](schengen.md#visalist), [`visaListCellar`](schengen.md#visalistcellar), [`atvCommon`](schengen.md#atvcommon), [`atvCommonCellar`](schengen.md#atvcommoncellar), [`atvSpecific`](schengen.md#atvspecific), [`etias`](schengen.md#etias)

## Totals

14 regions · 61 documented links · 41 load-bearing · 30 diffed · 19 need a person regardless
