import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { alpha } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { tokens } from "@/styles/theme";
import { VisaRegion, type Traveler } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DestinationSlider } from "@/components/ui/DestinationSlider";
import {
  categorizeAllDestinations,
  computeDestinationStatus,
  DESTINATION_CATEGORY_LABELS,
  DESTINATION_CATEGORY_ORDER,
  type DestinationCategory,
} from "@/features/calculator/utils/destinationStatus";
import { today } from "@/features/calculator/utils/dates";
import { getCountryName } from "../travelers/NationalitySelector";
import { FullScreenSlider } from "@/components/ui/FullScreenSlider";

function fmtToday(): string {
  return today().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface TravelerViewSliderProps {
  open: boolean;
  traveler: Traveler | null;
  color: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontFamily: tokens.fontBody,
        fontSize: "0.65rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: tokens.textGhost,
        mb: "8px",
      }}
    >
      {children}
    </Typography>
  );
}

// Current/Recent/Upcoming are what a traveler is most likely to act on right
// now; Old/Never are reference material, tucked away by default.
const CATEGORIES_EXPANDED_BY_DEFAULT: DestinationCategory[] = ["current", "recent", "upcoming"];

// ─── Destination card ───────────────────────────────────────────────────────

interface DestinationCardProps {
  traveler: Traveler;
  region: VisaRegion;
  expanded: boolean;
  onToggle: () => void;
}

function DestinationCard({ traveler, region, expanded, onToggle }: DestinationCardProps) {
  const status = computeDestinationStatus(traveler, region);

  return (
    <Box
      sx={{
        bgcolor: tokens.white,
        borderRadius: "12px",
        border: `1px solid ${tokens.border}`,
        overflow: "hidden",
      }}
    >
      <Box
        component="button"
        onClick={onToggle}
        aria-expanded={expanded}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          p: "14px 16px",
          border: "none",
          bgcolor: "transparent",
          cursor: "pointer",
          textAlign: "left",
          "&:active": { bgcolor: alpha(tokens.navy, 0.04) },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: tokens.fontDisplay,
              fontSize: "1rem",
              fontStyle: "italic",
              fontWeight: 400,
              color: tokens.navy,
              lineHeight: 1.2,
            }}
          >
            {status.regionName}
          </Typography>
          {status.summaryLine && (
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: tokens.textGhost,
              }}
            >
              {status.summaryLine}
            </Typography>
          )}
        </Box>
        {expanded ? (
          <ExpandLessIcon sx={{ fontSize: "1.1rem", color: tokens.textGhost, flexShrink: 0 }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: "1.1rem", color: tokens.textGhost, flexShrink: 0 }} />
        )}
      </Box>

      <Collapse in={expanded}>
        <Box
          sx={{
            px: "16px",
            pb: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            borderTop: `1px solid ${tokens.border}`,
            pt: "12px",
          }}
        >
          {status.availableChip ? (
            <>
              <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <StatusBadge
                  variant={status.availableChip.variant}
                  label={status.availableChip.label}
                />
                {status.secondChip && (
                  <StatusBadge
                    variant={status.secondChip.variant}
                    label={status.secondChip.label}
                  />
                )}
              </Box>
              <DestinationSlider fillPct={status.fillPct} variant={status.variant} size="lg" />
            </>
          ) : null}

          {/* Note — mobile shows this inline instead of the desktop chip tooltips. */}
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.75rem",
              color: tokens.textSoft,
              lineHeight: 1.5,
            }}
          >
            {status.note}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
}

// ─── Destination section (category group) ──────────────────────────────────

interface DestinationSectionProps {
  category: DestinationCategory;
  regions: VisaRegion[];
  expanded: boolean;
  onToggleSection: () => void;
  expandedRegions: Set<VisaRegion>;
  onToggleRegion: (region: VisaRegion) => void;
  traveler: Traveler;
}

function DestinationSection({
  category,
  regions,
  expanded,
  onToggleSection,
  expandedRegions,
  onToggleRegion,
  traveler,
}: DestinationSectionProps) {
  return (
    <Box>
      <Box
        component="button"
        onClick={onToggleSection}
        aria-expanded={expanded}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          border: "none",
          bgcolor: "transparent",
          cursor: "pointer",
          py: "4px",
          "&:active": { opacity: 0.7 },
        }}
      >
        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.65rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: tokens.textGhost,
            flex: 1,
            textAlign: "left",
          }}
        >
          {DESTINATION_CATEGORY_LABELS[category]}
        </Typography>
        {expanded ? (
          <ExpandLessIcon sx={{ fontSize: "1rem", color: tokens.textGhost }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: "1rem", color: tokens.textGhost }} />
        )}
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", pt: "8px" }}>
          {regions.map((region) => (
            <DestinationCard
              key={region}
              traveler={traveler}
              region={region}
              expanded={expandedRegions.has(region)}
              onToggle={() => onToggleRegion(region)}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TravelerViewSlider({
  open,
  traveler,
  color,
  onClose,
  onEdit,
  onDelete,
}: TravelerViewSliderProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Independently expandable — a Set, not a single region, so opening one
  // card never forces the others shut (they aren't an accordion).
  const [expandedRegions, setExpandedRegions] = useState<Set<VisaRegion>>(new Set());
  // Section-level collapse — persists across traveler switches; only the
  // per-card expand state below is reset per traveler.
  const [expandedSections, setExpandedSections] = useState<Set<DestinationCategory>>(
    () => new Set(CATEGORIES_EXPANDED_BY_DEFAULT),
  );

  useEffect(() => {
    if (!open || !traveler) return;
    const current = categorizeAllDestinations(traveler).filter((d) => d.category === "current");
    setExpandedRegions(new Set(current.map((d) => d.region)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traveler?.id, open]);

  if (!traveler) return null;

  const tripCount = traveler.trips.length;
  const categorized = categorizeAllDestinations(traveler);
  const byCategory = new Map<DestinationCategory, VisaRegion[]>();
  for (const { region, category } of categorized) {
    const list = byCategory.get(category);
    if (list) list.push(region);
    else byCategory.set(category, [region]);
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const footer = (
    <Box sx={{ display: "flex", gap: "8px" }}>
      <Box
        component="button"
        onClick={() => setConfirmDelete(true)}
        sx={{
          flex: 1,
          py: "11px",
          border: `1.5px solid ${alpha(tokens.red, 0.5)}`,
          borderRadius: "10px",
          bgcolor: "transparent",
          color: tokens.red,
          fontFamily: tokens.fontBody,
          fontSize: "0.85rem",
          fontWeight: 600,
          cursor: "pointer",
          "&:active": { bgcolor: tokens.redBg },
        }}
      >
        Delete
      </Box>
      <Box
        component="button"
        onClick={onEdit}
        sx={{
          flex: 2,
          py: "11px",
          border: "none",
          borderRadius: "10px",
          bgcolor: tokens.navy,
          color: tokens.white,
          fontFamily: tokens.fontBody,
          fontSize: "0.85rem",
          fontWeight: 600,
          cursor: "pointer",
          "&:active": { opacity: 0.85 },
        }}
      >
        Edit Traveler
      </Box>
    </Box>
  );

  return (
    <>
      <FullScreenSlider
        open={open}
        onClose={onClose}
        title="Traveler"
        footer={footer}
      >
        <Box
          sx={{
            p: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* ── Header ───────────────────────────────────────────────────── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <Box
                sx={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  bgcolor: color,
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontFamily: tokens.fontDisplay,
                  fontSize: "1.5rem",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: tokens.navy,
                  lineHeight: 1.15,
                }}
              >
                {traveler.name}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.85rem",
                fontWeight: 500,
                color: traveler.passportCode ? tokens.textSoft : tokens.textGhost,
                pl: "20px",
              }}
            >
              {traveler.passportCode
                ? getCountryName(traveler.passportCode)
                : "No nationality set"}
              {tripCount > 0
                ? ` · ${tripCount} trip${tripCount === 1 ? "" : "s"}`
                : ""}
            </Typography>
          </Box>

          {/* ── Today banner — allowances shown are current-trip-only ────────── */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              px: "12px",
              py: "10px",
              bgcolor: tokens.mist,
              border: `1px solid ${tokens.border}`,
              borderRadius: "10px",
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: "1rem", color: tokens.textSoft, mt: "1px", flexShrink: 0 }} />
            <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.75rem", color: tokens.textSoft, lineHeight: 1.45 }}>
              <Box component="span" sx={{ fontWeight: 700, color: tokens.navy }}>
                Today, {fmtToday()}.
              </Box>{" "}
              Allowances below reflect right now. Rolling-window destinations
              (Schengen, Türkiye) always show today&apos;s balance; per-visit
              destinations (UK, Ireland) show the current trip only — if
              there&apos;s no trip there today, the full allowance is available.
            </Typography>
          </Box>

          {/* ── Destinations — grouped by temporal relevance ──────────────── */}
          <Box>
            <SectionHeading>Destinations</SectionHeading>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {DESTINATION_CATEGORY_ORDER.map((category) => {
                const regions = byCategory.get(category);
                if (!regions || regions.length === 0) return null;
                return (
                  <DestinationSection
                    key={category}
                    category={category}
                    regions={regions}
                    expanded={expandedSections.has(category)}
                    onToggleSection={() =>
                      setExpandedSections((cur) => {
                        const next = new Set(cur);
                        if (next.has(category)) next.delete(category);
                        else next.add(category);
                        return next;
                      })
                    }
                    expandedRegions={expandedRegions}
                    onToggleRegion={(region) =>
                      setExpandedRegions((cur) => {
                        const next = new Set(cur);
                        if (next.has(region)) next.delete(region);
                        else next.add(region);
                        return next;
                      })
                    }
                    traveler={traveler}
                  />
                );
              })}
            </Box>
          </Box>
        </Box>
      </FullScreenSlider>

      {/* Delete confirmation */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        PaperProps={{
          sx: {
            borderRadius: "14px",
            px: "4px",
            py: "4px",
            maxWidth: 340,
            width: "calc(100vw - 48px)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: tokens.fontDisplay,
            fontSize: "1.05rem",
            fontStyle: "italic",
            fontWeight: 400,
            color: tokens.navy,
            pb: "6px",
          }}
        >
          Delete {traveler.name}?
        </DialogTitle>
        <DialogContent sx={{ pb: "8px" }}>
          <Typography sx={{ fontSize: "0.83rem", color: tokens.textSoft }}>
            {tripCount > 0
              ? `This will permanently delete ${tripCount} trip${tripCount === 1 ? "" : "s"} for ${traveler.name}. `
              : ""}
            This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: "16px", pb: "12px", gap: "8px" }}>
          <Box
            component="button"
            onClick={() => setConfirmDelete(false)}
            sx={{
              flex: 1,
              py: "8px",
              border: `1px solid ${tokens.border}`,
              borderRadius: "8px",
              bgcolor: "transparent",
              fontFamily: tokens.fontBody,
              fontSize: "0.82rem",
              fontWeight: 600,
              color: tokens.textSoft,
              cursor: "pointer",
              "&:active": { bgcolor: tokens.mist },
            }}
          >
            Cancel
          </Box>
          <Box
            component="button"
            onClick={() => {
              setConfirmDelete(false);
              onDelete();
            }}
            sx={{
              flex: 1,
              py: "8px",
              border: "none",
              borderRadius: "8px",
              bgcolor: tokens.red,
              fontFamily: tokens.fontBody,
              fontSize: "0.82rem",
              fontWeight: 600,
              color: tokens.white,
              cursor: "pointer",
              "&:active": { opacity: 0.85 },
            }}
          >
            Delete
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
}
