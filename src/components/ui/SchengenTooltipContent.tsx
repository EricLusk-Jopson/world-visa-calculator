import { useState } from "react";
import Box from "@mui/material/Box";
import { tokens } from "@/styles/theme";

const SCHENGEN_MEMBERS = [
  "Austria", "Belgium", "Bulgaria", "Croatia", "Czechia",
  "Denmark", "Estonia", "Finland", "France", "Germany",
  "Greece", "Hungary", "Iceland", "Italy", "Latvia",
  "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Netherlands",
  "Norway", "Poland", "Portugal", "Romania", "Slovakia",
  "Slovenia", "Spain", "Sweden", "Switzerland",
];

export function SchengenTooltipContent() {
  const [showList, setShowList] = useState(false);

  return (
    <Box sx={{ fontFamily: tokens.fontBody }}>
      <Box sx={{ mb: showList ? "6px" : 0 }}>
        29 European countries sharing open borders and the 90/180-day stay rule.
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
            display: "flex",
            flexWrap: "wrap",
            mt: "6px",
            pt: "6px",
            borderTop: `1px solid rgba(255,255,255,0.15)`,
          }}
        >
          {SCHENGEN_MEMBERS.map((name) => (
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
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
