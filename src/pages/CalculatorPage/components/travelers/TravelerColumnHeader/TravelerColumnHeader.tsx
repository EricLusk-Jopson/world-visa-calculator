import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { tokens } from "@/styles/theme";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DestinationSlider } from "@/components/ui/DestinationSlider";
import { VisaRegion, type Traveler } from "@/types";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { MobileAwareTooltip } from "@/components/ui/MobileAwareTooltip";
import { SchengenTooltipContent } from "@/components/ui/SchengenTooltipContent";
import { NationalitySelector } from "../NationalitySelector";
import { DestinationSelect } from "../DestinationSelect";
import {
  computeDestinationStatus,
  determineActiveRegion,
  resolveDisplayRegion,
} from "@/features/calculator/utils/destinationStatus";

interface TravelerColumnHeaderProps {
  traveler: Traveler;
  /** The resolved destination to display — traveler.targetRegion when still
   * valid, otherwise the computed active-trip destination. Parents resolve
   * this once (via resolveDisplayRegion) so every consumer of the traveler
   * agrees on which destination is showing. */
  region: VisaRegion;
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
  /** Called when the user saves changes from the edit modal. */
  onEdit: (
    name: string,
    passportCode: string | null,
    targetRegion: VisaRegion | null,
  ) => void;
  sx?: object;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  region,
  compact = false,
  onDelete,
  onEdit,
  sx = {},
}: TravelerColumnHeaderProps) {
  const [hovered, setHovered] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  // Pending edit values — reset each time the modal opens
  const [editName, setEditName] = useState(traveler.name);
  const [editCode, setEditCode] = useState<string | null>(traveler.passportCode);
  const [editTargetRegion, setEditTargetRegion] = useState<VisaRegion>(region);

  useEffect(() => {
    if (editModalOpen) {
      setEditName(traveler.name);
      setEditCode(traveler.passportCode);
      setEditTargetRegion(resolveDisplayRegion(traveler));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editModalOpen]);

  const status = computeDestinationStatus(traveler, region);
  const tripCount = traveler.trips?.length ?? 0;
  const showTracker = status.availableChip !== null;

  const handleDeleteClick = () => {
    if (tripCount === 0) onDelete();
    else setConfirmingDelete(true);
  };
  const handleConfirmDelete = () => {
    setConfirmingDelete(false);
    onDelete();
  };
  const handleCancelDelete = () => setConfirmingDelete(false);

  const previewTraveler: Traveler = { ...traveler, passportCode: editCode };
  const editStatus = computeDestinationStatus(previewTraveler, editTargetRegion);

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    const defaultRegion = determineActiveRegion(previewTraveler);
    const targetRegionToSave = editTargetRegion === defaultRegion ? null : editTargetRegion;
    onEdit(editName.trim(), editCode, targetRegionToSave);
    setEditModalOpen(false);
  };

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

  const badgesRow = showTracker && (
    <>
      {status.availableChip && (
        <StatusBadge
          variant={status.availableChip.variant}
          label={status.availableChip.label}
          tooltip={status.availableChip.tooltip}
        />
      )}
      {status.secondChip && (
        <StatusBadge
          variant={status.secondChip.variant}
          label={status.secondChip.label}
          tooltip={status.secondChip.tooltip}
        />
      )}
    </>
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
        {traveler.passportCode && (
          <Typography
            component="span"
            sx={{ fontSize: "0.9rem", lineHeight: 1, flexShrink: 0 }}
            aria-hidden="true"
          >
            {countryFlag(traveler.passportCode)}
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
        {!compact && badgesRow}

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
          onClick={() => { closeMenu(); setEditModalOpen(true); }}
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.82rem",
            color: tokens.text,
            py: "8px",
            px: "14px",
            "&:hover": { bgcolor: tokens.mist },
          }}
        >
          Edit traveler
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
      {compact && badgesRow && (
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {badgesRow}
        </Box>
      )}

      {/* ── Allowance tracker or disclaimer ────────────────────────────────── */}
      {showTracker ? (
        <>
          {compact ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <MobileAwareTooltip
                title={region === VisaRegion.Schengen ? <SchengenTooltipContent /> : status.note}
                placement="bottom"
                arrow
                enterDelay={300}
                componentsProps={{
                  tooltip: {
                    sx: {
                      fontFamily: tokens.fontBody,
                      fontSize: "0.72rem",
                      fontWeight: 500,
                      bgcolor: tokens.navy,
                      "& .MuiTooltip-arrow": { color: tokens.navy },
                      maxWidth: 320,
                    },
                  },
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontFamily: tokens.fontBody,
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: tokens.textGhost,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                    cursor: "default",
                  }}
                >
                  {status.regionName}
                  <InfoOutlinedIcon sx={{ fontSize: "0.6rem", opacity: 0.6 }} />
                </Typography>
              </MobileAwareTooltip>
              <Typography
                sx={{
                  fontFamily: tokens.fontBody,
                  fontSize: "0.62rem",
                  fontWeight: 500,
                  color: tokens.textGhost,
                  lineHeight: 1.35,
                }}
              >
                {status.summaryLine}
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
              <MobileAwareTooltip
                title={region === VisaRegion.Schengen ? <SchengenTooltipContent /> : status.note}
                placement="bottom"
                arrow
                enterDelay={300}
                componentsProps={{
                  tooltip: {
                    sx: {
                      fontFamily: tokens.fontBody,
                      fontSize: "0.72rem",
                      fontWeight: 500,
                      bgcolor: tokens.navy,
                      "& .MuiTooltip-arrow": { color: tokens.navy },
                      maxWidth: 320,
                    },
                  },
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontFamily: tokens.fontBody,
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: tokens.textGhost,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                    cursor: "default",
                  }}
                >
                  {status.regionName}
                  <InfoOutlinedIcon sx={{ fontSize: "0.6rem", opacity: 0.6 }} />
                </Typography>
              </MobileAwareTooltip>
              <Typography
                sx={{
                  fontFamily: tokens.fontBody,
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  color: tokens.textSoft,
                  whiteSpace: "nowrap",
                }}
              >
                {status.summaryLine}
              </Typography>
            </Box>
          )}

          <DestinationSlider fillPct={status.fillPct} variant={status.variant} size="sm" />
        </>
      ) : (
        /* No calculable tracker for this destination/passport combination. */
        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.65rem",
            fontStyle: "italic",
            color: tokens.textGhost,
          }}
        >
          {status.note}
        </Typography>
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

      {/* ── Edit traveler modal (name + nationality + destination) ────────── */}
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
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
        {/* Header */}
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
            Edit traveler
          </Typography>
          <Box
            component="button"
            onClick={() => setEditModalOpen(false)}
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

        {/* Body */}
        <Box sx={{ px: "20px", pt: "14px", pb: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Name field */}
          <Box>
            <Typography
              component="label"
              sx={{
                display: "block",
                fontFamily: tokens.fontBody,
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: tokens.textSoft,
                mb: "5px",
              }}
            >
              Name
            </Typography>
            <TextField
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              fullWidth
              autoFocus
              inputProps={{ maxLength: 30 }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontFamily: tokens.fontBody,
                  fontSize: "0.85rem",
                  bgcolor: tokens.mist,
                  borderRadius: "10px",
                  "& fieldset": { borderColor: tokens.border, borderWidth: 1.5 },
                  "&:hover fieldset": { borderColor: tokens.navy },
                  "&.Mui-focused fieldset": { borderColor: tokens.navy, borderWidth: 1.5 },
                },
                "& .MuiOutlinedInput-input": {
                  py: "9px",
                  px: "11px",
                  color: tokens.text,
                },
              }}
            />
          </Box>

          {/* Nationality field */}
          <Box>
            <Typography
              component="label"
              sx={{
                display: "block",
                fontFamily: tokens.fontBody,
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: tokens.textSoft,
                mb: "5px",
              }}
            >
              Nationality
            </Typography>
            <NationalitySelector
              value={editCode}
              onChange={(code) => setEditCode(code)}
            />
          </Box>

          {/* Target destination field */}
          <Box>
            <Typography
              component="label"
              sx={{
                display: "block",
                fontFamily: tokens.fontBody,
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: tokens.textSoft,
                mb: "5px",
              }}
            >
              Allowance preview
            </Typography>
            <DestinationSelect
              traveler={previewTraveler}
              value={editTargetRegion}
              onChange={setEditTargetRegion}
            />
          </Box>

          {/* Informational note for non-visa-free passports */}
          {editCode && !editStatus.eligible && (
            <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: tokens.textGhost }}>
              {editStatus.note}
            </Typography>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ height: 1, bgcolor: tokens.border }} />
        <Box sx={{ px: "20px", py: "12px", display: "flex", gap: "7px" }}>
          <Box
            component="button"
            onClick={() => setEditModalOpen(false)}
            sx={{
              flex: 1,
              border: `1px solid ${tokens.border}`,
              borderRadius: "8px",
              bgcolor: tokens.mist,
              color: tokens.textSoft,
              fontFamily: tokens.fontBody,
              fontSize: "0.82rem",
              fontWeight: 600,
              py: "8px",
              cursor: "pointer",
              transition: "all 0.12s",
              "&:hover": { bgcolor: tokens.border, color: tokens.text },
            }}
          >
            Cancel
          </Box>
          <Box
            component="button"
            disabled={!editName.trim()}
            onClick={handleSaveEdit}
            sx={{
              flex: 2,
              border: "none",
              borderRadius: "8px",
              bgcolor: editName.trim() ? tokens.navy : tokens.border,
              color: editName.trim() ? tokens.white : tokens.textGhost,
              fontFamily: tokens.fontBody,
              fontSize: "0.82rem",
              fontWeight: 600,
              py: "8px",
              cursor: editName.trim() ? "pointer" : "default",
              transition: "all 0.12s",
              "&:hover": editName.trim() ? { bgcolor: tokens.navyMid } : {},
            }}
          >
            Save
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}
