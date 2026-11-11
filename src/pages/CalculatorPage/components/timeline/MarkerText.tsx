/**
 * The sentences behind timeline markers, with travellers' names in their
 * colours and trip names in italics. Used in the mobile marker drawer and in
 * the desktop age-out tooltip; the wording itself lives in markerTooltips.ts.
 * Font size and colour are inherited from wherever the text is placed.
 */

import { Fragment } from "react";
import Box from "@mui/material/Box";
import { darken } from "@mui/material/styles";
import { format } from "date-fns";
import {
  returnVisitLead,
  agingLeadParts,
  agingReturnsLead,
  agingMarkerSubtext,
  nameSeparator,
} from "@/features/calculator/utils/windowMarkers";

export interface MarkerTraveler {
  name: string;
  /** Traveller colour; omitted where there's only one traveller in view. */
  color?: string;
}

function Names({ travelers }: { travelers: MarkerTraveler[] }) {
  return (
    <>
      {travelers.map((t, i) => (
        <Fragment key={i}>
          {nameSeparator(i, travelers.length)}
          <Box
            component="span"
            sx={{
              fontWeight: 700,
              // Darkened a touch so the lighter palette colours stay legible
              // as text on white.
              color: t.color ? darken(t.color, 0.2) : "inherit",
            }}
          >
            {t.name}
          </Box>
        </Fragment>
      ))}
    </>
  );
}

export interface ReturnVisitEntry {
  date: Date;
  days: number;
  traveler: MarkerTraveler;
}

/**
 * One line per (duration, date), longest visit first, each naming everyone
 * it applies to: "From Jun 23, a 90-day visit is possible once again for Me
 * and Wifey."
 */
export function ReturnVisitText({ entries }: { entries: ReturnVisitEntry[] }) {
  const lines = new Map<string, { date: Date; days: number; travelers: MarkerTraveler[] }>();
  for (const e of entries) {
    const key = `${e.days}|${format(e.date, "yyyy-MM-dd")}`;
    const line = lines.get(key);
    if (line) {
      if (!line.travelers.some((t) => t.name === e.traveler.name)) {
        line.travelers.push(e.traveler);
      }
    } else {
      lines.set(key, { date: e.date, days: e.days, travelers: [e.traveler] });
    }
  }
  const sorted = [...lines.values()].sort(
    (a, b) => b.days - a.days || a.date.getTime() - b.date.getTime(),
  );
  return (
    <>
      {sorted.map((line, i) => (
        <Box key={i} component="p" sx={{ m: 0 }}>
          {returnVisitLead(line.date, line.days)}{" "}
          <Names travelers={line.travelers} />.
        </Box>
      ))}
    </>
  );
}

/**
 * "On Sep 17, *Bosnia* begins to fall outside the rolling window. This
 * returns 4 days to Me and Wifey." plus a dimmed line on how the days come
 * back.
 */
export function AgingTripText({
  agingDate,
  destination,
  tripDays,
  travelers,
}: {
  agingDate: Date;
  destination: string;
  tripDays: number;
  travelers: MarkerTraveler[];
}) {
  const { before, after } = agingLeadParts(agingDate);
  const subtext = agingMarkerSubtext(agingDate, tripDays);
  return (
    <>
      <Box component="p" sx={{ m: 0 }}>
        {before}
        <Box component="em">{destination}</Box>
        {after} {agingReturnsLead(tripDays)} <Names travelers={travelers} />.
      </Box>
      {subtext && (
        <Box component="p" sx={{ m: 0, mt: "4px", opacity: 0.75, fontSize: "0.92em" }}>
          {subtext}
        </Box>
      )}
    </>
  );
}
