import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { tokens } from "@/styles/theme";
import { FullScreenSlider } from "@/components/ui/FullScreenSlider";
import type { TravelerEligibility, EligibilityNote } from "@/pages/CalculatorPage/components/trips/tripEligibility";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.72rem",
          fontWeight: 600,
          color: tokens.textSoft,
          minWidth: 92,
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.8rem", color: tokens.text }}>
        {value}
      </Typography>
    </Box>
  );
}

function NoteBlock({ note }: { note: EligibilityNote }) {
  return (
    <Box
      sx={{
        bgcolor: tokens.mist,
        borderRadius: "8px",
        px: "10px",
        py: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "3px",
      }}
    >
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.6rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          color: tokens.textGhost,
        }}
      >
        {note.label}
      </Typography>
      <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.76rem", color: tokens.textSoft, lineHeight: 1.5 }}>
        {note.text}
      </Typography>
      {note.source && (
        <Box
          component="a"
          href={note.source.directUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ fontFamily: tokens.fontBody, fontSize: "0.7rem", color: tokens.navy, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
        >
          Source ↗
        </Box>
      )}
    </Box>
  );
}

function EligibilityCard({ e }: { e: TravelerEligibility }) {
  const [open, setOpen] = useState(true);
  const accentColor = e.ok ? tokens.green : tokens.red;

  return (
    <Box sx={{ borderRadius: "14px", border: `1.5px solid ${tokens.border}`, bgcolor: tokens.white, overflow: "hidden" }}>
      {/* Title bar */}
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          px: "14px",
          py: "12px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: e.color, flexShrink: 0 }} />
        <Typography
          sx={{ fontFamily: tokens.fontDisplay, fontSize: "1rem", fontStyle: "italic", color: tokens.navy, flex: 1 }}
        >
          {e.name}
        </Typography>
        {e.ok ? (
          <CheckCircleOutlineIcon sx={{ fontSize: "1.1rem", color: accentColor }} />
        ) : (
          <WarningAmberIcon sx={{ fontSize: "1.1rem", color: accentColor }} />
        )}
        {open ? (
          <ExpandLessIcon sx={{ fontSize: "1.2rem", color: tokens.textGhost }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: "1.2rem", color: tokens.textGhost }} />
        )}
      </Box>

      {open && (
        <Box sx={{ px: "14px", pb: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <InfoRow label="Passport" value={e.passportDisplay} />
            <InfoRow label="Destination" value={e.regionLabel} />
            <InfoRow label="Access" value={e.accessLabel} />
            {e.ruleTexts.length > 0 && (
              <InfoRow label={e.ruleTexts.length > 1 ? "Rules" : "Rule"} value={e.ruleTexts.join(" · ")} />
            )}
          </Box>

          {e.notes.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {e.notes.map((n, i) => (
                <NoteBlock key={i} note={n} />
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export function MobileEligibilityFrame({
  open,
  onClose,
  eligibility,
}: {
  open: boolean;
  onClose: () => void;
  eligibility: TravelerEligibility[];
}) {
  return (
    <FullScreenSlider open={open} onClose={onClose} title="Entry Eligibility">
      <Box sx={{ px: "16px", py: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {eligibility.length === 0 ? (
          <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.85rem", color: tokens.textGhost, textAlign: "center", mt: "24px" }}>
            Select travelers and a destination to see entry requirements.
          </Typography>
        ) : (
          eligibility.map((e) => <EligibilityCard key={e.id} e={e} />)
        )}
      </Box>
    </FullScreenSlider>
  );
}
