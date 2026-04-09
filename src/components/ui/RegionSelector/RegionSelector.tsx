import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { tokens } from "@/styles/theme";
import { VisaRegion } from "@/types";

// ─── Option types ─────────────────────────────────────────────────────────────

interface RegionOpt {
  kind: "region";
  region: VisaRegion;
  label: string;
  /** Empty string = no group header (Elsewhere); 'Europe' = divider + label */
  group: string;
}

interface CountryOpt {
  kind: "country";
  region: VisaRegion;
  /** Full display label shown in dropdown: "France (Schengen Area)" */
  label: string;
  /** Used for search matching — country name only, without the region suffix */
  countryName: string;
  countryCode: string;
  group: string;
}

type SelectorOption = RegionOpt | CountryOpt;

// ─── Static data ──────────────────────────────────────────────────────────────

/** Schengen member states — sourced from SCHENGEN.memberStates in schengen.ts */
const SCHENGEN_MEMBERS: Array<{ code: string; name: string }> = [
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
 * Region options in display order:
 *   1. Elsewhere  (group: '' — no header)
 *   2. Schengen Area, United Kingdom, Ireland  (group: 'Europe' — divider + label)
 */
const REGION_OPTIONS: RegionOpt[] = [
  {
    kind: "region",
    region: VisaRegion.Elsewhere,
    label: "Elsewhere",
    group: "",
  },
  {
    kind: "region",
    region: VisaRegion.Schengen,
    label: "Schengen Area",
    group: "Europe",
  },
  {
    kind: "region",
    region: VisaRegion.UnitedKingdom,
    label: "United Kingdom",
    group: "Europe",
  },
  {
    kind: "region",
    region: VisaRegion.Ireland,
    label: "Ireland",
    group: "Europe",
  },
];

/**
 * Individual Schengen country options — only shown when the user types a search
 * query. Each maps back to VisaRegion.Schengen when selected.
 */
const COUNTRY_OPTIONS: CountryOpt[] = SCHENGEN_MEMBERS.map(
  ({ code, name }) => ({
    kind: "country" as const,
    region: VisaRegion.Schengen,
    label: `${name} (Schengen Area)`,
    countryName: name,
    countryCode: code,
    group: "Europe",
  }),
);

const ALL_OPTIONS: SelectorOption[] = [...REGION_OPTIONS, ...COUNTRY_OPTIONS];

// ─── Shared input sx (mirrors NationalitySelector / TripModal fields) ─────────

const INPUT_SX = {
  "& .MuiOutlinedInput-root": {
    fontFamily: tokens.fontBody,
    fontSize: "0.85rem",
    bgcolor: tokens.mist,
    borderRadius: "10px",
    "& fieldset": { borderColor: tokens.border, borderWidth: 1.5 },
    "&:hover fieldset": { borderColor: tokens.navy },
    "&.Mui-focused fieldset": {
      borderColor: tokens.navy,
      borderWidth: 1.5,
      boxShadow: "0 0 0 3px rgba(12,30,60,0.06)",
    },
    // Selected value is always rendered green
    "& input": {
      color: tokens.greenText,
      fontWeight: 600,
    },
  },
  "& .MuiOutlinedInput-input": {
    py: "9px",
    px: "2px",
  },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

interface RegionSelectorProps {
  value: VisaRegion;
  onChange: (region: VisaRegion) => void;
  /** Optional sx override applied to the Autocomplete root */
  sx?: object;
}

/**
 * Searchable dropdown for selecting a visa region.
 *
 * Default list (no search input):
 *   Elsewhere
 *   ─── Europe ───
 *   Schengen Area  ← default selection
 *   United Kingdom
 *   Ireland
 *
 * When searching (e.g. "France"):
 *   Elsewhere  ← always pinned first
 *   ─── Europe ───
 *   France (Schengen Area)   ← maps to Schengen Area on select
 *
 * Selected region is always highlighted in green.
 */
export function RegionSelector({ value, onChange, sx = {} }: RegionSelectorProps) {
  const selectedOption =
    REGION_OPTIONS.find((o) => o.region === value) ?? REGION_OPTIONS[1];

  return (
    <Autocomplete<SelectorOption, false, true>
      options={ALL_OPTIONS}
      value={selectedOption}
      disableClearable
      autoHighlight
      blurOnSelect
      groupBy={(option) => option.group}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, val) =>
        option.kind === "region" &&
        val.kind === "region" &&
        option.region === val.region
      }
      onChange={(_event, newValue) => {
        if (newValue) onChange(newValue.region);
      }}
      // ── Custom filter ──────────────────────────────────────────────────────
      // • No active search → show only the 4 region options (Schengen members hidden)
      //   "No active search" = empty input OR input equals the selected option's label
      //   (MUI pre-fills the input with the selected label when the field is focused,
      //   so we treat that as the "no filter" state to keep the full list visible).
      // • Active search → always pin Elsewhere at top; show matching regions + countries.
      //   Schengen countries are matched by name only — not the "(Schengen Area)" suffix —
      //   so typing "Schengen" does not flood the list with all 29 member states.
      filterOptions={(options, { inputValue }) => {
        const input = inputValue.trim().toLowerCase();
        const isDefaultView =
          !input || input === selectedOption.label.toLowerCase();

        if (isDefaultView) {
          return options.filter((o) => o.kind === "region");
        }

        const elsewhere = options.find(
          (o): o is RegionOpt =>
            o.kind === "region" && o.region === VisaRegion.Elsewhere,
        )!;

        const matches: SelectorOption[] = [elsewhere];
        for (const option of options) {
          if (
            option.kind === "region" &&
            option.region === VisaRegion.Elsewhere
          )
            continue;
          const searchText =
            option.kind === "country"
              ? option.countryName.toLowerCase()
              : option.label.toLowerCase();
          if (searchText.includes(input)) matches.push(option);
        }
        return matches;
      }}
      // ── Group rendering ────────────────────────────────────────────────────
      // '' group (Elsewhere) → no header, render children directly
      // 'Europe' group      → thin divider + "Europe" subtitle + children
      renderGroup={(params) => {
        if (params.group === "") {
          return <Box key={params.key}>{params.children}</Box>;
        }
        return (
          <Box key={params.key}>
            <Divider sx={{ mx: "10px", my: "3px" }} />
            <Typography
              sx={{
                px: "14px",
                pt: "5px",
                pb: "2px",
                fontFamily: tokens.fontBody,
                fontSize: "0.62rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.09em",
                color: tokens.textGhost,
              }}
            >
              {params.group}
            </Typography>
            {params.children}
          </Box>
        );
      }}
      // ── Option rendering ───────────────────────────────────────────────────
      // Region options: plain label
      // Country options: "France" + muted "(Schengen Area)" suffix
      renderOption={(props, option, { selected }) => {
        const { key, ...liProps } = props as {
          key: React.Key;
        } & React.HTMLAttributes<HTMLLIElement>;

        return (
          <Box
            component="li"
            key={key}
            {...liProps}
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.85rem",
              color: selected ? `${tokens.greenText} !important` : tokens.text,
            }}
          >
            {option.kind === "country" ? (
              <>
                {option.countryName}
                <Typography
                  component="span"
                  sx={{
                    fontFamily: tokens.fontBody,
                    fontSize: "0.72rem",
                    color: selected ? tokens.greenText : tokens.textGhost,
                    ml: "5px",
                  }}
                >
                  (Schengen Area)
                </Typography>
              </>
            ) : (
              option.label
            )}
          </Box>
        );
      }}
      // ── Paper (dropdown) styling ───────────────────────────────────────────
      slotProps={{
        paper: {
          sx: {
            mt: "4px",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(12,30,60,0.15)",
            "& .MuiAutocomplete-option": {
              px: "14px !important",
              py: "8px !important",
              minHeight: "unset !important",
              "&[aria-selected='true']": {
                bgcolor: `${tokens.greenBg} !important`,
              },
              "&[aria-selected='true'].Mui-focused": {
                bgcolor: `${tokens.greenBg} !important`,
              },
              "&.Mui-focused": {
                bgcolor: `${tokens.mist} !important`,
              },
            },
          },
        },
      }}
      renderInput={(params) => (
        <TextField {...params} placeholder="Select region…" sx={INPUT_SX} />
      )}
      sx={sx}
    />
  );
}
