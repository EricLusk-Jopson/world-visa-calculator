import { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CheckIcon from "@mui/icons-material/Check";
import { VisaRegion, VISA_REGION_LABELS } from "@/types";
import { tokens } from "@/styles/theme";
import { TripFormCard } from "./TripFormCard";

const REGIONS = [
  { value: VisaRegion.Schengen, label: VISA_REGION_LABELS[VisaRegion.Schengen] },
  { value: VisaRegion.UnitedKingdom, label: VISA_REGION_LABELS[VisaRegion.UnitedKingdom] },
  { value: VisaRegion.Ireland, label: VISA_REGION_LABELS[VisaRegion.Ireland] },
  { value: VisaRegion.Turkiye, label: VISA_REGION_LABELS[VisaRegion.Turkiye] },
  { value: VisaRegion.Elsewhere, label: VISA_REGION_LABELS[VisaRegion.Elsewhere] },
];

function RegionPickerScreen({
  open,
  value,
  onSelect,
  onClose,
}: {
  open: boolean;
  value: VisaRegion;
  onSelect: (r: VisaRegion) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? REGIONS.filter((r) => r.label.toLowerCase().includes(q)) : REGIONS;
  }, [query]);

  return (
    <Dialog fullScreen open={open} onClose={onClose} style={{ zIndex: 1400 }}>
      <Box
        sx={{
          bgcolor: tokens.navy,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          pl: "4px",
          pr: "12px",
          py: "8px",
          flexShrink: 0,
        }}
      >
        <IconButton onClick={onClose} size="small" sx={{ color: tokens.white, p: "8px" }}>
          <ArrowBackIosNewIcon sx={{ fontSize: "1rem" }} />
        </IconButton>
        <Typography
          sx={{
            fontFamily: tokens.fontDisplay,
            fontSize: "1rem",
            fontStyle: "italic",
            fontWeight: 400,
            color: tokens.white,
          }}
        >
          Destination
        </Typography>
      </Box>

      <Box sx={{ px: "16px", py: "12px", flexShrink: 0 }}>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search regions…"
          fullWidth
          autoFocus
        />
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {filtered.map((r) => (
          <Box
            key={r.value}
            component="button"
            onClick={() => onSelect(r.value)}
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: "20px",
              py: "18px",
              bgcolor: "transparent",
              border: "none",
              borderBottom: `1px solid ${tokens.border}`,
              textAlign: "left",
              cursor: "pointer",
              fontFamily: tokens.fontBody,
              fontSize: "1rem",
              fontWeight: r.value === value ? 600 : 400,
              color: r.value === value ? tokens.navy : tokens.text,
              "&:active": { bgcolor: tokens.mist },
            }}
          >
            {r.label}
            {r.value === value && (
              <CheckIcon sx={{ fontSize: "1rem", color: tokens.green }} />
            )}
          </Box>
        ))}
      </Box>
    </Dialog>
  );
}

interface Props {
  region: VisaRegion;
  onRegionChange: (r: VisaRegion) => void;
  onReset: () => void;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

const SUMMARY_SX = {
  fontFamily: tokens.fontBody,
  fontSize: "0.95rem",
  fontWeight: 500 as const,
  textAlign: "right" as const,
  color: tokens.text,
};

export function TripFormCardDestination({
  region,
  onRegionChange,
  onReset,
  expanded,
  onExpand,
  onCollapse,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function handleSelect(r: VisaRegion) {
    onRegionChange(r);
    setPickerOpen(false);
    onCollapse();
  }

  const summary = (
    <Typography sx={SUMMARY_SX}>
      {VISA_REGION_LABELS[region]}
    </Typography>
  );

  return (
    <>
      <TripFormCard
        label="Destination"
        summary={summary}
        expanded={expanded}
        onExpand={onExpand}
        onDone={onCollapse}
        onReset={onReset}
      >
        <TextField
          placeholder="Search regions…"
          fullWidth
          size="small"
          onClick={() => setPickerOpen(true)}
          inputProps={{ readOnly: true }}
          sx={{
            mb: "8px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              bgcolor: tokens.mist,
              "& fieldset": { borderColor: tokens.border },
            },
            "& .MuiOutlinedInput-input": {
              fontFamily: tokens.fontBody,
              fontSize: "0.95rem",
              cursor: "pointer",
            },
          }}
        />
        <Box>
          {REGIONS.map((r) => (
            <Box
              key={r.value}
              component="button"
              onClick={() => handleSelect(r.value)}
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: "4px",
                py: "12px",
                bgcolor: "transparent",
                border: "none",
                borderBottom: `1px solid ${tokens.border}`,
                textAlign: "left",
                cursor: "pointer",
                fontFamily: tokens.fontBody,
                fontSize: "0.95rem",
                fontWeight: r.value === region ? 600 : 400,
                color: r.value === region ? tokens.navy : tokens.text,
                "&:active": { bgcolor: tokens.mist },
                "&:last-child": { borderBottom: "none" },
              }}
            >
              {r.label}
              {r.value === region && (
                <CheckIcon sx={{ fontSize: "1rem", color: tokens.green }} />
              )}
            </Box>
          ))}
        </Box>

        {/* TODO: per-traveler entry eligibility rows — requires visa data layer */}
      </TripFormCard>

      <RegionPickerScreen
        open={pickerOpen}
        value={region}
        onSelect={handleSelect}
        onClose={() => setPickerOpen(false)}
      />
    </>
  );
}
