import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { tokens } from "@/styles/theme";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Traveler } from "@/types";
import type { TravelerStatus } from "../travelerStatus";
import {
  AVAILABLE_DAYS_DESCRIPTION,
  MAX_STAY_DESCRIPTION,
} from "@/features/calculator/utils/schengenConstants";
import { getSchengenRule } from "@/data/regions/schengen";
import { NationalitySelector } from "../NationalitySelector";

interface TravelerColumnHeaderProps {
  traveler: Traveler;
  status: TravelerStatus;
  /**
   * Longest single trip startable today, accounting for historical days aging
   * out of the window. Distinct from status.daysRemaining.
   */
  maxStay: number;
  /**
   * When true the header uses a two-row layout:
   *   Row A -- traveler name (flex:1) + delete button (always opposite the name)
   *   Row B -- status chips
   *
   * This flag comes from CardsView and is the same for every column, so the
   * transition always fires simultaneously across all headers.
   */
  compact?: boolean;
  onDelete: () => void;
  onPassportChange: (code: string | null) => void;
  sx?: object;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtWindowDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Converts an ISO Alpha-2 country code to its flag emoji. */
function countryFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((ch) => String.fromCodePoint(0x1f1e6 + ch.charCodeAt(0) - 65))
    .join("");
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TravelerColumnHeader({
  traveler,
  status,
  maxStay,
  compact = false,
  onDelete,
  onPassportChange,
  sx = {},
}: TravelerColumnHeaderProps) {
  const [hovered, setHovered] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [nationalityModalOpen, setNationalityModalOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const { daysUsed, daysRemaining, variant } = status;
  const tripCount = traveler.trips?.length ?? 0;
  const fillPct = Math.min(100, (daysUsed / 90) * 100);

  const rule = getSchengenRule(traveler.passportCode);
  const hasNationality = traveler.passportCode !== null;
  const showCalculator = hasNationality;

  const barColor =
    variant === "safe"
      ? tokens.green
      : variant === "caution"
        ? tokens.amber
        : tokens.red;

  const handleDeleteClick = () => {
    if (tripCount === 0) onDelete();
    else setConfirmingDelete(true);
  };
  const handleConfirmDelete = () => {
    setConfirmingDelete(false);
    onDelete();
  };
  const handleCancelDelete = () => setConfirmingDelete(false);

  // ── Overflow menu ────────────────────────────────────────────────────────

  const closeMenu = () => setMenuAnchor(null);

  const menuButton = (
    <Box
      component="button"
      onClick={(e: React.MouseEvent<HTMLElement>) => setMenuAnchor(e.currentTarget)}
      aria-label={`Options for ${traveler.name}`}
      sx={{
        flexShrink: 0,
        width: 22,
        height: 22,
        border: "none",
        borderRadius: "4px",
        bgcolor: "transparent",
        color: tokens.textGhost,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1rem",
        lineHeight: 1,
        letterSpacing: "0.02em",
        transition: "opacity 0.14s, background-color 0.14s, color 0.14s",
        opacity: hovered && !confirmingDelete ? 1 : 0,
        "&:hover": { bgcolor: tokens.mist, color: tokens.navy },
      }}
    >
      ⋮
    </Box>
  );

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        bgcolor: tokens.offWhite,
        px: "14px",
        pt: "12px",
        pb: confirmingDelete ? "10px" : "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        position: "relative",
        zIndex: 4,
        ...sx,
      }}
    >
      {/*
       * ── Name row (always Row A) ────────────────────────────────────────────
       *
       * Flag emoji (when nationality set), traveler name, optional badges
       * (normal mode), overflow menu button (hover-only).
       */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
        {hasNationality && (
          <Typography
            component="span"
            sx={{ fontSize: "0.9rem", lineHeight: 1, flexShrink: 0 }}
            aria-hidden="true"
          >
            {countryFlag(traveler.passportCode!)}
          </Typography>
        )}

        <Typography
          sx={{
            fontFamily: tokens.fontDisplay,
            fontSize: "1.05rem",
            fontStyle: "italic",
            fontWeight: 400,
            color: tokens.navy,
            lineHeight: 1,
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {traveler.name}
        </Typography>

        {/*
         * Normal mode: badges between name and action buttons on the same row.
         * Compact mode: badges are rendered separately below.
         */}
        {!compact && showCalculator && (
          <>
            <StatusBadge
              variant={variant}
              label={`${daysRemaining}d avail`}
              tooltip={AVAILABLE_DAYS_DESCRIPTION}
            />
            <StatusBadge
              variant={maxStay > daysRemaining ? "safe" : variant}
              label={`${maxStay}d max`}
              tooltip={MAX_STAY_DESCRIPTION}
            />
          </>
        )}

        {menuButton}
      </Box>

      {/* ── Overflow menu ──────────────────────────────────────────────────── */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "10px",
              minWidth: 160,
              boxShadow: "0 4px 20px rgba(12,30,60,0.14)",
              border: `1px solid ${tokens.border}`,
              mt: "4px",
            },
          },
        }}
      >
        <MenuItem
          onClick={() => { closeMenu(); setNationalityModalOpen(true); }}
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.82rem",
            color: tokens.text,
            py: "8px",
            px: "14px",
            "&:hover": { bgcolor: tokens.mist },
          }}
        >
          Edit nationality
        </MenuItem>
        <MenuItem
          onClick={() => { closeMenu(); handleDeleteClick(); }}
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.82rem",
            color: tokens.red,
            py: "8px",
            px: "14px",
            "&:hover": { bgcolor: tokens.redBg },
          }}
        >
          Remove {traveler.name}
        </MenuItem>
      </Menu>

      {/*
       * ── Badges row (compact mode only, Row B) ─────────────────────────────
       */}
      {compact && showCalculator && (
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <StatusBadge
            variant={variant}
            label={`${daysRemaining}d avail`}
            tooltip={AVAILABLE_DAYS_DESCRIPTION}
          />
          <StatusBadge
            variant={maxStay > daysRemaining ? "safe" : variant}
            label={`${maxStay}d max`}
            tooltip={MAX_STAY_DESCRIPTION}
          />
        </Box>
      )}

      {/* ── Schengen bar or no-nationality prompt ──────────────────────────── */}
      {showCalculator ? (
        <>
          {compact ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <Typography
                sx={{
                  fontFamily: tokens.fontBody,
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: tokens.textGhost,
                }}
              >
                Schengen
              </Typography>
              <Typography
                sx={{
                  fontFamily: tokens.fontBody,
                  fontSize: "0.62rem",
                  fontWeight: 500,
                  color: tokens.textGhost,
                  lineHeight: 1.35,
                }}
              >
                {daysUsed}/90 used since {fmtWindowDate(status.windowStart)}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: "6px",
              }}
            >
              <Typography
                sx={{
                  fontFamily: tokens.fontBody,
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: tokens.textGhost,
                }}
              >
                Schengen
              </Typography>
              <Typography
                sx={{
                  fontFamily: tokens.fontBody,
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  color: tokens.textSoft,
                  whiteSpace: "nowrap",
                }}
              >
                {daysUsed}/90 used since {fmtWindowDate(status.windowStart)}
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              height: 3,
              bgcolor: tokens.border,
              borderRadius: "100px",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${fillPct}%`,
                bgcolor: barColor,
                borderRadius: "100px",
                transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
          </Box>
        </>
      ) : (
        /* No nationality selected -- prompt the traveler to set one */
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "6px",
          }}
        >
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.65rem",
              fontStyle: "italic",
              color: tokens.textGhost,
              flex: 1,
              minWidth: 0,
            }}
          >
            Add nationality to track Schengen days
          </Typography>
          <Box
            component="button"
            onClick={() => setNationalityModalOpen(true)}
            sx={{
              flexShrink: 0,
              border: `1px solid ${tokens.border}`,
              borderRadius: "6px",
              bgcolor: tokens.mist,
              color: tokens.textSoft,
              fontFamily: tokens.fontBody,
              fontSize: "0.65rem",
              fontWeight: 600,
              px: "8px",
              py: "3px",
              cursor: "pointer",
              transition: "all 0.12s",
              "&:hover": { bgcolor: tokens.border, color: tokens.text },
            }}
          >
            Select
          </Box>
        </Box>
      )}

      {/* ── Delete confirmation strip ────────────────────────────────────── */}
      {confirmingDelete && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            mt: "2px",
            pt: "10px",
            borderTop: `1px solid ${tokens.border}`,
          }}
        >
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.75rem",
              fontWeight: 500,
              color: tokens.text,
              flex: 1,
            }}
          >
            Remove {traveler.name} and their {tripCount} trip
            {tripCount !== 1 ? "s" : ""}?
          </Typography>
          <Box
            component="button"
            onClick={handleCancelDelete}
            sx={{
              border: `1px solid ${tokens.border}`,
              borderRadius: "6px",
              bgcolor: tokens.mist,
              color: tokens.textSoft,
              fontFamily: tokens.fontBody,
              fontSize: "0.72rem",
              fontWeight: 600,
              px: "10px",
              py: "4px",
              cursor: "pointer",
              transition: "all 0.12s",
              "&:hover": { bgcolor: tokens.border, color: tokens.text },
            }}
          >
            Cancel
          </Box>
          <Box
            component="button"
            onClick={handleConfirmDelete}
            sx={{
              border: `1px solid ${tokens.redBorder}`,
              borderRadius: "6px",
              bgcolor: tokens.redBg,
              color: tokens.redText,
              fontFamily: tokens.fontBody,
              fontSize: "0.72rem",
              fontWeight: 700,
              px: "10px",
              py: "4px",
              cursor: "pointer",
              transition: "all 0.12s",
              "&:hover": {
                bgcolor: tokens.red,
                color: "#fff",
                borderColor: tokens.red,
              },
            }}
          >
            Remove
          </Box>
        </Box>
      )}

      {/* ── Nationality selection modal ────────────────────────────────────── */}
      <Dialog
        open={nationalityModalOpen}
        onClose={() => setNationalityModalOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            width: 360,
            maxWidth: "calc(100vw - 32px)",
            overflow: "visible",
            boxShadow: "0 12px 40px rgba(12,30,60,0.18)",
          },
        }}
      >
        <Box
          sx={{
            px: "20px",
            pt: "18px",
            pb: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            sx={{
              fontFamily: tokens.fontDisplay,
              fontSize: "1.1rem",
              fontStyle: "italic",
              fontWeight: 400,
              color: tokens.navy,
            }}
          >
            {traveler.name}&apos;s passport
          </Typography>
          <Box
            component="button"
            onClick={() => setNationalityModalOpen(false)}
            sx={{
              width: 26,
              height: 26,
              border: "none",
              borderRadius: "5px",
              bgcolor: tokens.mist,
              color: tokens.textSoft,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
              transition: "all 0.15s",
              "&:hover": { bgcolor: tokens.redBg, color: tokens.red },
            }}
          >
            ✕
          </Box>
        </Box>

        <Box sx={{ px: "20px", py: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <NationalitySelector
            value={traveler.passportCode}
            onChange={(code) => {
              onPassportChange(code);
              setNationalityModalOpen(false);
            }}
            autoFocus
          />
          {rule.access !== 'visa_free' && traveler.passportCode && (
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.72rem",
                color: tokens.textGhost,
              }}
            >
              {rule.access === 'free_movement'
                ? 'EU/EEA/Swiss passports have free movement -- no 90-day limit applies.'
                : rule.access === 'suspended'
                  ? rule.suspensionNote
                  : 'A Schengen visa is required for this passport.'}
            </Typography>
          )}
        </Box>
      </Dialog>
    </Box>
  );
}
