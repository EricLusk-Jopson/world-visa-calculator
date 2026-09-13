import { useState } from "react";
import Box from "@mui/material/Box";
import { tokens } from "@/styles/theme";

interface SchengenMember {
  name: string;
  /** De facto members share the 90/180 allowance but aren't formal member states. */
  deFacto?: boolean;
}

const SCHENGEN_MEMBERS: SchengenMember[] = [
  { name: "Andorra", deFacto: true },
  { name: "Austria" },
  { name: "Belgium" },
  { name: "Bulgaria" },
  { name: "Croatia" },
  { name: "Czechia" },
  { name: "Denmark" },
  { name: "Estonia" },
  { name: "Finland" },
  { name: "France" },
  { name: "Germany" },
  { name: "Gibraltar", deFacto: true },
  { name: "Greece" },
  { name: "Hungary" },
  { name: "Iceland" },
  { name: "Italy" },
  { name: "Latvia" },
  { name: "Liechtenstein" },
  { name: "Lithuania" },
  { name: "Luxembourg" },
  { name: "Malta" },
  { name: "Monaco", deFacto: true },
  { name: "Netherlands" },
  { name: "Norway" },
  { name: "Poland" },
  { name: "Portugal" },
  { name: "Romania" },
  { name: "San Marino", deFacto: true },
  { name: "Slovakia" },
  { name: "Slovenia" },
  { name: "Spain" },
  { name: "Sweden" },
  { name: "Switzerland" },
  { name: "Vatican City", deFacto: true },
];

export function SchengenTooltipContent() {
  const [showList, setShowList] = useState(false);

  return (
    <Box sx={{ fontFamily: tokens.fontBody }}>
      <Box sx={{ mb: showList ? "6px" : 0 }}>
        29 members and 5 de facto members sharing the 90/180-day stay rule.
      </Box>
      <Box
        component="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowList((v) => !v);
        }}
        sx={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontFamily: tokens.fontBody,
          fontSize: "inherit",
          fontWeight: 700,
          color: tokens.border,
          textDecoration: "underline",
          textUnderlineOffset: "2px",
          "&:hover": { color: tokens.white },
        }}
      >
        {showList ? "Hide member list" : "Show member list"}
      </Box>
      {showList && (
        <Box
          sx={{
            mt: "6px",
            pt: "6px",
            borderTop: `1px solid rgba(255,255,255,0.15)`,
          }}
        >
          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            {SCHENGEN_MEMBERS.map(({ name, deFacto }) => (
              <Box
                key={name}
                sx={{
                  width: "33.33%",
                  fontSize: "0.68rem",
                  fontWeight: 500,
                  py: "1px",
                  pr: "4px",
                  color: "rgba(255,255,255,0.75)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {name}
                {deFacto && "*"}
              </Box>
            ))}
          </Box>
          <Box
            sx={{
              mt: "4px",
              fontSize: "0.62rem",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            * De facto Schengen membership status.
          </Box>
        </Box>
      )}
    </Box>
  );
}
