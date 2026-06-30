import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { tokens } from "@/styles/theme";
import { VisaRegion, VISA_REGION_LABELS } from "@/types";
import type { Traveler, RuleNote, PassportRule } from "@/types";
import { getPassportRule } from "@/data/regions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VisaInfoRow {
  traveler: Traveler;
  label: string;
  labelColor: string;
  borderColor: string;
  notes?: RuleNote[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countryDisplay(code: string): string {
  const flag = Array.from(code.toUpperCase())
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
  try {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    return `${flag} ${names.of(code) ?? code}`;
  } catch {
    return `${flag} ${code}`;
  }
}

function describePassportRule(
  rule: PassportRule,
  regionLabel: string,
): { label: string; color: string } {
  if (rule.access === "free_movement")
    return { label: "Free movement — no day limit", color: tokens.green };
  if (rule.access === "visa_required")
    return { label: `${regionLabel} visa required`, color: tokens.red };
  // entitled — preAuth.name is the human-readable auth name from source data
  const preAuth = rule.entitlements[0]?.preAuth;
  if (preAuth)
    return { label: `Visa-free — ${preAuth.name} required`, color: tokens.green };
  return { label: "Visa-free entry", color: tokens.green };
}

// ─── VisaInfoSection ──────────────────────────────────────────────────────────

function VisaInfoSection({
  rows,
  expanded,
  onToggle,
  greenCount,
  warnCount,
  unknownCount,
  onSourceClick,
}: {
  rows: VisaInfoRow[];
  expanded: boolean;
  onToggle: () => void;
  greenCount: number;
  warnCount: number;
  unknownCount: number;
  onSourceClick: (anchor: HTMLElement, note: RuleNote) => void;
}) {
  return (
    <Box
      sx={{
        border: `1px solid ${tokens.border}`,
        borderRadius: "10px",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <Box
        onClick={onToggle}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          px: "12px",
          py: "8px",
          cursor: "pointer",
          userSelect: "none",
          borderBottom: expanded ? `1px solid ${tokens.border}` : "none",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
          <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: tokens.textSoft }}>
            Visa Status:
          </Typography>
          {greenCount > 0 && (
            <Tooltip
              title={`${greenCount} ${greenCount === 1 ? "traveler" : "travelers"} can enter without a visa`}
              placement="top"
              arrow
              componentsProps={{ tooltip: { sx: { fontFamily: tokens.fontBody, fontSize: "0.72rem", bgcolor: tokens.navy, "& .MuiTooltip-arrow": { color: tokens.navy } } } }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <CheckCircleOutlineIcon sx={{ fontSize: "0.9rem", color: tokens.green }} />
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color: tokens.green }}>{greenCount}</Typography>
              </Box>
            </Tooltip>
          )}
          {warnCount > 0 && (
            <Tooltip
              title={`${warnCount} ${warnCount === 1 ? "traveler requires" : "travelers require"} a visa`}
              placement="top"
              arrow
              componentsProps={{ tooltip: { sx: { fontFamily: tokens.fontBody, fontSize: "0.72rem", bgcolor: tokens.navy, "& .MuiTooltip-arrow": { color: tokens.navy } } } }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <WarningAmberIcon sx={{ fontSize: "0.9rem", color: tokens.red }} />
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color: tokens.red }}>{warnCount}</Typography>
              </Box>
            </Tooltip>
          )}
          {greenCount === 0 && warnCount === 0 && unknownCount > 0 && (
            <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: tokens.textGhost, fontStyle: "italic" }}>
              Set nationality to see entry requirements
            </Typography>
          )}
        </Box>
        {expanded ? (
          <ExpandLessIcon sx={{ fontSize: "1rem", color: tokens.textGhost }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: "1rem", color: tokens.textGhost }} />
        )}
      </Box>

      {expanded && (
        <Box sx={{ px: "12px", py: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {rows.map(({ traveler, label, labelColor, borderColor, notes }) => (
            <Box key={traveler.id} sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color: tokens.textSoft, flexShrink: 0 }}>
                  {traveler.name}:
                </Typography>
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: labelColor, fontWeight: 500 }}>
                  {label}
                </Typography>
              </Box>
              {notes?.map((note, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: "4px", pl: "10px", borderLeft: `2px solid ${borderColor}` }}>
                  <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.67rem", color: tokens.textSoft, lineHeight: 1.5, flex: 1 }}>
                    {note.text}
                  </Typography>
                  {note.source && (
                    <IconButton
                      size="small"
                      onClick={(e) => onSourceClick(e.currentTarget, note)}
                      sx={{ p: "2px", flexShrink: 0, color: tokens.textGhost, "&:hover": { color: tokens.navy, bgcolor: "transparent" } }}
                    >
                      <InfoOutlineIcon sx={{ fontSize: "0.85rem" }} />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface EntryEligibilityPanelProps {
  travelers: Traveler[];
  travelerIds: string[];
  region: VisaRegion;
}

export function EntryEligibilityPanel({ travelers, travelerIds, region }: EntryEligibilityPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [sourcePopover, setSourcePopover] = useState<{
    anchor: HTMLElement;
    note: RuleNote;
  } | null>(null);

  if (region === VisaRegion.Elsewhere) return null;

  const regionLabel = VISA_REGION_LABELS[region];

  const rows: VisaInfoRow[] = travelerIds.flatMap((tid): VisaInfoRow[] => {
    const t = travelers.find((x) => x.id === tid);
    if (!t) return [];
    if (!t.passportCode) {
      return [{ traveler: t, label: "Set nationality to see entry requirements", labelColor: tokens.textGhost, borderColor: tokens.border, notes: undefined }];
    }
    const rule = getPassportRule(region, t.passportCode);
    const { label, color } = describePassportRule(rule, regionLabel);
    const borderColor = color === tokens.green ? tokens.greenBorder : tokens.redBorder;
    return [{ traveler: t, label: `${countryDisplay(t.passportCode)} — ${label}`, labelColor: color, borderColor, notes: rule.notes }];
  });

  if (rows.length === 0) return null;

  const greenCount = rows.filter((r) => r.labelColor === tokens.green).length;
  const warnCount = rows.filter((r) => r.labelColor === tokens.red).length;
  const unknownCount = rows.filter((r) => r.labelColor === tokens.textGhost).length;

  return (
    <>
      <VisaInfoSection
        rows={rows}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        greenCount={greenCount}
        warnCount={warnCount}
        unknownCount={unknownCount}
        onSourceClick={(anchor, note) => setSourcePopover({ anchor, note })}
      />
      <Popover
        open={Boolean(sourcePopover)}
        anchorEl={sourcePopover?.anchor}
        onClose={() => setSourcePopover(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "10px",
              p: "12px 14px",
              boxShadow: "0 4px 20px rgba(12,30,60,0.15)",
              maxWidth: 300,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            },
          },
        }}
      >
        {sourcePopover && sourcePopover.note.source && (
          <>
            <Box
              component="a"
              href={sourcePopover.note.source.directUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.72rem",
                color: tokens.navy,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Direct source ↗
            </Box>
            <Box
              component="a"
              href={sourcePopover.note.source.parentUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.72rem",
                color: tokens.navy,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Overview page ↗
            </Box>
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.67rem",
                color: tokens.textSoft,
                mt: "2px",
              }}
            >
              Last verified: {sourcePopover.note.source.dateChecked}
            </Typography>
          </>
        )}
      </Popover>
    </>
  );
}
