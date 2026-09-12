/**
 * App-coverage data for EuropeCoverageIsland (home page "Where it works"
 * section): which countries the calculator supports, grouped by how their
 * visa-free stay rule works.
 *
 * Membership and rule data mirrors src/data/regions — this file is
 * presentation data for the map/list, not a second source of truth for
 * passport-rule logic.
 */

export interface CoverageCountry {
  code: string;
  name: string;
  source: string;
  /** Point coordinates for micro-states not resolvable from map geometry alone. */
  marker?: [number, number];
}

export interface SupportedCountry extends CoverageCountry {
  /** Key into `stayRules`. */
  stayRule: string;
}

export type StayRule =
  | { type: "rolling-window"; maxStayDays: number; windowDays: number }
  | { type: "per-visit"; maxStayDays: number }
  | { type: "schengen-de-facto" };

export interface StayRuleNote {
  text: string;
  sourceUrl: string;
  sourceLabel: string;
}

export interface EuropeCoverageData {
  schemaVersion: number;
  membershipVerifiedOn: string;
  membershipSource: string;
  schengen: CoverageCountry[];
  supported: SupportedCountry[];
  unsupported: CoverageCountry[];
  aliases: Record<string, string[]>;
  notes: string[];
  stayRuleBasis: string;
  schengenStayRule: string;
  stayRules: Record<string, StayRule>;
  stayRuleDisclaimer: string;
  stayRuleNotes: Record<string, StayRuleNote>;
}

export const europeCoverage: EuropeCoverageData = {
  "schemaVersion": 2,
  "membershipVerifiedOn": "2026-09-09",
  "membershipSource": "https://www.consilium.europa.eu/en/policies/schengen-area/",
  "schengen": [
    {
      "code": "AT",
      "name": "Austria",
      "source": "Austria"
    },
    {
      "code": "BE",
      "name": "Belgium",
      "source": "Belgium"
    },
    {
      "code": "BG",
      "name": "Bulgaria",
      "source": "Bulgaria"
    },
    {
      "code": "HR",
      "name": "Croatia",
      "source": "Croatia"
    },
    {
      "code": "CZ",
      "name": "Czechia",
      "source": "Czechia"
    },
    {
      "code": "DK",
      "name": "Denmark",
      "source": "Denmark"
    },
    {
      "code": "EE",
      "name": "Estonia",
      "source": "Estonia"
    },
    {
      "code": "FI",
      "name": "Finland",
      "source": "Finland"
    },
    {
      "code": "FR",
      "name": "France",
      "source": "France"
    },
    {
      "code": "DE",
      "name": "Germany",
      "source": "Germany"
    },
    {
      "code": "GR",
      "name": "Greece",
      "source": "Greece"
    },
    {
      "code": "HU",
      "name": "Hungary",
      "source": "Hungary"
    },
    {
      "code": "IS",
      "name": "Iceland",
      "source": "Iceland"
    },
    {
      "code": "IT",
      "name": "Italy",
      "source": "Italy"
    },
    {
      "code": "LV",
      "name": "Latvia",
      "source": "Latvia"
    },
    {
      "code": "LI",
      "name": "Liechtenstein",
      "source": "Liechtenstein",
      "marker": [
        9.55,
        47.16
      ]
    },
    {
      "code": "LT",
      "name": "Lithuania",
      "source": "Lithuania"
    },
    {
      "code": "LU",
      "name": "Luxembourg",
      "source": "Luxembourg"
    },
    {
      "code": "MT",
      "name": "Malta",
      "source": "Malta",
      "marker": [
        14.42,
        35.93
      ]
    },
    {
      "code": "NL",
      "name": "Netherlands",
      "source": "Netherlands"
    },
    {
      "code": "NO",
      "name": "Norway",
      "source": "Norway"
    },
    {
      "code": "PL",
      "name": "Poland",
      "source": "Poland"
    },
    {
      "code": "PT",
      "name": "Portugal",
      "source": "Portugal"
    },
    {
      "code": "RO",
      "name": "Romania",
      "source": "Romania"
    },
    {
      "code": "SK",
      "name": "Slovakia",
      "source": "Slovakia"
    },
    {
      "code": "SI",
      "name": "Slovenia",
      "source": "Slovenia"
    },
    {
      "code": "ES",
      "name": "Spain",
      "source": "Spain"
    },
    {
      "code": "SE",
      "name": "Sweden",
      "source": "Sweden"
    },
    {
      "code": "CH",
      "name": "Switzerland",
      "source": "Switzerland"
    }
  ],
  "supported": [
    {
      "code": "GB",
      "name": "United Kingdom",
      "source": "United Kingdom",
      "stayRule": "perVisit180"
    },
    {
      "code": "IE",
      "name": "Ireland",
      "source": "Ireland",
      "stayRule": "perVisit90"
    },
    {
      "code": "AL",
      "name": "Albania",
      "source": "Albania",
      "stayRule": "rolling90In180"
    },
    {
      "code": "XK",
      "name": "Kosovo",
      "source": "Kosovo",
      "stayRule": "rolling90In180"
    },
    {
      "code": "ME",
      "name": "Montenegro",
      "source": "Montenegro",
      "stayRule": "rolling90In180"
    },
    {
      "code": "MK",
      "name": "North Macedonia",
      "source": "Macedonia",
      "stayRule": "rolling90In180"
    },
    {
      "code": "RS",
      "name": "Serbia",
      "source": "Serbia",
      "stayRule": "rolling90In180"
    },
    {
      "code": "BA",
      "name": "Bosnia and Herzegovina",
      "source": "Bosnia and Herz.",
      "stayRule": "rolling90In180"
    },
    {
      "code": "CY",
      "name": "Cyprus",
      "source": "Cyprus",
      "stayRule": "rolling90In180"
    },
    {
      "code": "TR",
      "name": "T\u00fcrkiye",
      "source": "Turkey",
      "stayRule": "rolling90In180"
    },
    {
      "code": "AD",
      "name": "Andorra",
      "source": "Andorra",
      "marker": [
        1.52,
        42.51
      ],
      "stayRule": "schengenDeFacto"
    },
    {
      "code": "GI",
      "name": "Gibraltar",
      "source": "Gibraltar",
      "marker": [
        -5.35,
        36.14
      ],
      "stayRule": "schengenDeFacto"
    },
    {
      "code": "MC",
      "name": "Monaco",
      "source": "Monaco",
      "marker": [
        7.42,
        43.73
      ],
      "stayRule": "schengenDeFacto"
    },
    {
      "code": "SM",
      "name": "San Marino",
      "source": "San Marino",
      "marker": [
        12.46,
        43.94
      ],
      "stayRule": "schengenDeFacto"
    },
    {
      "code": "VA",
      "name": "Vatican City",
      "source": "Vatican",
      "marker": [
        12.45,
        41.9
      ],
      "stayRule": "schengenDeFacto"
    }
  ],
  "unsupported": [
    {
      "code": "AM",
      "name": "Armenia",
      "source": "Armenia"
    },
    {
      "code": "AZ",
      "name": "Azerbaijan",
      "source": "Azerbaijan"
    },
    {
      "code": "BY",
      "name": "Belarus",
      "source": "Belarus"
    },
    {
      "code": "GE",
      "name": "Georgia",
      "source": "Georgia"
    },
    {
      "code": "KZ",
      "name": "Kazakhstan",
      "source": "Kazakhstan"
    },
    {
      "code": "MD",
      "name": "Moldova",
      "source": "Moldova"
    },
    {
      "code": "RU",
      "name": "Russia",
      "source": "Russia"
    },
    {
      "code": "UA",
      "name": "Ukraine",
      "source": "Ukraine"
    }
  ],
  "aliases": {
    "Cyprus": [
      "Cyprus",
      "N. Cyprus"
    ]
  },
  "notes": [
    "App support is defined by the supplied allowlist, not by EU membership.",
    "XK is an application identifier for Kosovo, not an ISO-assigned code.",
    "Small states absent from the source geometry use point markers, not invented borders.",
    "Northern Cyprus is combined with Cyprus for this illustrative coverage map; this does not assert identical entry or travel rules.",
    "A shared rule type does not imply a shared allowance. Only Schengen members share one regional count; each supported non-Schengen country uses its own compliance rules.",
    "Andorra, Gibraltar, Monaco, San Marino, and Vatican City are not formal Schengen Area member states, but are treated as de facto members for stay-limit purposes: time spent there counts against the same 90/180-day Schengen allowance."
  ],
  "stayRuleBasis": "Product-specified visa-free rule summaries, not passport-specific entitlements.",
  "schengenStayRule": "rolling90In180",
  "stayRules": {
    "rolling90In180": {
      "type": "rolling-window",
      "maxStayDays": 90,
      "windowDays": 180
    },
    "perVisit90": {
      "type": "per-visit",
      "maxStayDays": 90
    },
    "perVisit180": {
      "type": "per-visit",
      "maxStayDays": 180
    },
    "schengenDeFacto": {
      "type": "schengen-de-facto"
    }
  },
  "stayRuleDisclaimer": "Rule summaries show the app\u2019s visa-free stay model for eligible travelers, not a personal entitlement. Your passport and entry permission may give you a different allowance. Check your passport in the calculator and verify official entry requirements before travel.",
  "stayRuleNotes": {
    "GB": {
      "text": "The app shows 180 days; official UK visitor guidance usually permits up to 6 months. Your entry permission takes precedence.",
      "sourceUrl": "https://www.gov.uk/standard-visitor",
      "sourceLabel": "UK visitor guidance"
    },
    "AL": {
      "text": "Passport-specific exceptions can be longer: U.S. citizens may stay visa-free in Albania for up to one year.",
      "sourceUrl": "https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Albania.html",
      "sourceLabel": "Albania entry guidance for U.S. citizens"
    }
  }
};
