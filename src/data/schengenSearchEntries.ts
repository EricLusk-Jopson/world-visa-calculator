/**
 * schengenSearchEntries.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Individual-country search entries shared by every destination picker that
 * lets a traveler search for a specific Schengen country or de facto member
 * (RegionSelector's trip-modal picker, TripFormCardDestination's mobile
 * picker) rather than just the top-level "Schengen Area" region. All entries
 * resolve back to VisaRegion.Schengen when selected — they exist purely so
 * these names are searchable, not as separate trackable regions.
 */

export interface SchengenSearchEntry {
  code: string;
  name: string;
}

/** Schengen member states — sourced from SCHENGEN.memberStates in schengen.ts */
export const SCHENGEN_MEMBERS: SchengenSearchEntry[] = [
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IT", name: "Italy" },
  { code: "LV", name: "Latvia" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "NL", name: "Netherlands" },
  { code: "NO", name: "Norway" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
];

/**
 * De facto Schengen members — not formal member states, but stays there count
 * against the same 90/180-day Schengen allowance.
 */
export const SCHENGEN_DE_FACTO_MEMBERS: SchengenSearchEntry[] = [
  { code: "AD", name: "Andorra" },
  { code: "GI", name: "Gibraltar" },
  { code: "MC", name: "Monaco" },
  { code: "SM", name: "San Marino" },
  { code: "VA", name: "Vatican City" },
];
