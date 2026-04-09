import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { alpha } from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { tokens } from "@/styles/theme";
import { type Traveler, VisaRegion } from "@/types";
import { computeTravelerStatus } from "../../travelers/travelerStatus";
import {
  parseDate,
  today as getToday,
  formatDate,
} from "@/features/calculator/utils/dates";
import { calculateMaxStay } from "@/features/calculator/utils/schengen";
import { getSchengenRule } from "@/data/regions/schengen";
import { format } from "date-fns";
import { getTravelerColor } from "@/features/calculator/utils/travelerColours";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  AVAILABLE_DAYS_DESCRIPTION,
  MAX_STAY_DESCRIPTION,
} from "@/features/calculator/utils/schengenConstants";
import { NationalitySelector } from "../../travelers/NationalitySelector";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TravelerFilterBarProps {
  travelers: Traveler[];
  hiddenTravelerIds: string[];
  onToggleTraveler: (id: string) => void;
  onDeleteTraveler: (id: string) => void;
  onEditTraveler: (id: string, name: string, passportCode: string | null) => void;
  onAddTraveler: () => void;
}

type StatusLevel = "safe" | "caution" | "danger" | "neutral";

function getStatusLevel(daysRemaining: number | null): StatusLevel {
  if (daysRemaining === null) return "neutral";
  if (daysRemaining > 29) return "safe";
  if (daysRemaining > 9) return "caution";
  return "danger";
}

function countryFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((ch) => String.fromCodePoint(0x1f1e6 + ch.charCodeAt(0) - 65))
    .join("");
}

const STATUS_COLORS: Record<
  StatusLevel,
  { bg: string; border: string; text: string; bar: string }
> = {
  safe: {
    bg: tokens.greenBg,
    border: alpha(tokens.green, 0.22),
    text: tokens.greenText,
    bar: tokens.green,
  },
  caution: {
    bg: tokens.amberBg,
    border: alpha(tokens.amber, 0.22),
    text: tokens.amberText,
    bar: tokens.amber,
  },
  danger: {
    bg: tokens.redBg,
    border: alpha(tokens.red, 0.22),
    text: tokens.redText,
    bar: tokens.red,
  },
  neutral: {
    bg: tokens.mist,
    border: tokens.border,
    text: tokens.textSoft,
    bar: tokens.border,
  },
};

const ICON_BTN_SX = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  border: "none",
  bgcolor: "transparent",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "background 0.15s, color 0.15s",
  flexShrink: 0,
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function TravelerFilterBar({
  travelers,
  hiddenTravelerIds,
  onToggleTraveler,
  onDeleteTraveler,
  onEditTraveler,
  onAddTraveler,
}: TravelerFilterBarProps) {
  const [open, setOpen] = useState(false);

  // ── Delete confirmation ──────────────────────────────────────────────────
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingTraveler = travelers.find((t) => t.id === pendingDeleteId);

  const handleDeleteClick = (traveler: Traveler) => {
    if (traveler.trips.length === 0) {
      onDeleteTraveler(traveler.id);
    } else {
      setPendingDeleteId(traveler.id);
    }
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId) onDeleteTraveler(pendingDeleteId);
    setPendingDeleteId(null);
  };

  // ── Overflow menu ────────────────────────────────────────────────────────
  const [menuAnchor, setMenuAnchor] = useState<{
    el: HTMLElement;
    traveler: Traveler;
  } | null>(null);

  const closeMenu = () => setMenuAnchor(null);

  // ── Edit modal ───────────────────────────────────────────────────────────
  const [editingTraveler, setEditingTraveler] = useState<Traveler | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState<string | null>(null);

  useEffect(() => {
    if (editingTraveler) {
      setEditName(editingTraveler.name);
      setEditCode(editingTraveler.passportCode);
    }
  }, [editingTraveler]);

  const openEdit = (traveler: Traveler) => setEditingTraveler(traveler);
  const closeEdit = () => setEditingTraveler(null);

  const handleEditSave = () => {
    if (!editingTraveler || !editName.trim()) return;
    onEditTraveler(editingTraveler.id, editName.trim(), editCode);
    closeEdit();
  };

  if (travelers.length === 0) {
    return (
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: tokens.white,
          borderBottom: `1px solid ${tokens.border}`,
          borderRadius: 0,
          zIndex: 5,
        }}
      >
        <Box
          component="button"
          onClick={onAddTraveler}
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            px: "16px",
            py: "12px",
            border: "none",
            bgcolor: "transparent",
            cursor: "pointer",
            color: tokens.textSoft,
            fontFamily: tokens.fontBody,
            fontSize: "0.82rem",
            fontWeight: 600,
            "&:active": { bgcolor: alpha(tokens.navy, 0.04) },
          }}
        >
          <PersonAddAlt1Icon sx={{ fontSize: "1rem" }} />
          Add Traveler
        </Box>
      </Box>
    );
  }

  const todayStr = formatDate(getToday());

  return (
    <>
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: tokens.white,
          borderBottom: `1px solid ${tokens.border}`,
          borderRadius: 0,
          zIndex: 5,
          overflow: "hidden",
        }}
      >
        {/* ── Collapse toggle ─────────────────────────────────────────────── */}
        <Box
          component="button"
          onClick={() => setOpen((v) => !v)}
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            px: "16px",
            py: "11px",
            border: "none",
            bgcolor: "transparent",
            cursor: "pointer",
            "&:active": { bgcolor: alpha(tokens.navy, 0.04) },
          }}
        >
          <Typography
            sx={{
              fontSize: "0.65rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: tokens.textGhost,
              flex: 1,
              textAlign: "left",
            }}
          >
            Travelers
          </Typography>

          {/* Traveler dots — compact status summary when collapsed */}
          <Box sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
            {travelers.map((t, i) => (
              <Box
                key={t.id}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: hiddenTravelerIds.includes(t.id)
                    ? tokens.border
                    : getTravelerColor(i),
                }}
              />
            ))}
          </Box>

          {open ? (
            <ExpandLessIcon sx={{ fontSize: "0.9rem", color: tokens.textGhost }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: "0.9rem", color: tokens.textGhost }} />
          )}
        </Box>

        {/* ── Traveler rows ──────────────────────────────────────────────── */}
        <Collapse in={open}>
          {travelers.map((traveler, i) => {
            const status = computeTravelerStatus(traveler);
            const color = getTravelerColor(i);
            const hidden = hiddenTravelerIds.includes(traveler.id);
            const level = getStatusLevel(status.daysRemaining);
            const sc = STATUS_COLORS[level];
            const daysUsed =
              status.daysRemaining !== null ? 90 - status.daysRemaining : 0;
            const fillPct = Math.min(100, (Math.max(0, daysUsed) / 90) * 100);
            const windowStartFmt = status.windowStart
              ? format(parseDate(status.windowStart), "MMM d")
              : null;

            const schengenTrips = traveler.trips.filter(
              (t) => t.region === VisaRegion.Schengen,
            );
            const maxStayResult = calculateMaxStay(todayStr, schengenTrips);
            const maxStay = maxStayResult.canEnter ? maxStayResult.maxDays : 0;

            const { variant, daysRemaining } = status;

            const rule = getSchengenRule(traveler.passportCode);
            const showCalculator =
              traveler.passportCode !== null &&
              (rule.access === "visa_free" || rule.access === "free_movement");

            return (
              <Box
                key={traveler.id}
                sx={{
                  borderTop: `1px solid ${tokens.border}`,
                  opacity: hidden ? 0.5 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {/* ── Name row ──────────────────────────────────────────── */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    px: "14px",
                    pt: "10px",
                    pb: "6px",
                  }}
                >
                  {/* Colour dot */}
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: hidden ? tokens.border : color,
                      flexShrink: 0,
                    }}
                  />

                  {/* Flag */}
                  {traveler.passportCode && (
                    <Typography
                      component="span"
                      sx={{ fontSize: "0.9rem", lineHeight: 1, flexShrink: 0 }}
                      aria-hidden="true"
                    >
                      {countryFlag(traveler.passportCode)}
                    </Typography>
                  )}

                  {/* Name */}
                  <Typography
                    sx={{
                      fontFamily: tokens.fontDisplay,
                      fontSize: "1.05rem",
                      fontStyle: "italic",
                      fontWeight: 400,
                      color: hidden ? tokens.textGhost : tokens.navy,
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

                  {/* Visibility toggle */}
                  <Box
                    component="button"
                    onClick={() => onToggleTraveler(traveler.id)}
                    sx={{
                      ...ICON_BTN_SX,
                      color: hidden ? tokens.textGhost : tokens.textSoft,
                      "&:active": {
                        bgcolor: alpha(tokens.navy, 0.06),
                        color: tokens.navy,
                      },
                    }}
                  >
                    {hidden ? (
                      <VisibilityOffIcon sx={{ fontSize: "1rem" }} />
                    ) : (
                      <VisibilityIcon sx={{ fontSize: "1rem" }} />
                    )}
                  </Box>

                  {/* Overflow menu trigger */}
                  <Box
                    component="button"
                    onClick={(e: React.MouseEvent<HTMLElement>) =>
                      setMenuAnchor({ el: e.currentTarget, traveler })
                    }
                    aria-label={`Options for ${traveler.name}`}
                    sx={{
                      ...ICON_BTN_SX,
                      color: tokens.textGhost,
                      fontSize: "1rem",
                      lineHeight: 1,
                      letterSpacing: "0.02em",
                      "&:active": {
                        bgcolor: alpha(tokens.navy, 0.06),
                        color: tokens.navy,
                      },
                    }}
                  >
                    ⋮
                  </Box>
                </Box>

                {/* ── Avail + max stay badges ────────────────────────────── */}
                {showCalculator && daysRemaining !== null && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      px: "14px",
                      pb: "6px",
                    }}
                  >
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

                {/* ── Progress row ───────────────────────────────────────── */}
                {showCalculator && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      px: "14px",
                      pb: "10px",
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        height: 3,
                        bgcolor: tokens.mist,
                        borderRadius: "100px",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          width: `${fillPct}%`,
                          bgcolor: hidden ? tokens.border : sc.bar,
                          borderRadius: "100px",
                          transition: "width 0.3s ease-out",
                        }}
                      />
                    </Box>

                    <Typography
                      sx={{
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        color: tokens.textSoft,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {daysRemaining !== null
                        ? `${daysUsed}/90${windowStartFmt ? ` since ${windowStartFmt}` : ""}`
                        : "No trips yet"}
                    </Typography>
                  </Box>
                )}

                {/* ── No-nationality prompt ──────────────────────────────── */}
                {!traveler.passportCode && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      px: "14px",
                      pb: "10px",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: tokens.fontBody,
                        fontSize: "0.65rem",
                        fontStyle: "italic",
                        color: tokens.textGhost,
                        flex: 1,
                      }}
                    >
                      Add nationality to track Schengen days
                    </Typography>
                    <Box
                      component="button"
                      onClick={() => openEdit(traveler)}
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
                        "&:active": { bgcolor: tokens.border, color: tokens.text },
                      }}
                    >
                      Select
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}

          {/* ── Add Traveler button ────────────────────────────────────────── */}
          <Box
            component="button"
            onClick={onAddTraveler}
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              px: "16px",
              py: "10px",
              border: "none",
              borderTop: `1px solid ${tokens.border}`,
              bgcolor: "transparent",
              cursor: "pointer",
              color: tokens.textSoft,
              fontFamily: tokens.fontBody,
              fontSize: "0.78rem",
              fontWeight: 600,
              transition: "background 0.15s, color 0.15s",
              "&:active": {
                bgcolor: alpha(tokens.navy, 0.04),
                color: tokens.navy,
              },
            }}
          >
            <PersonAddAlt1Icon sx={{ fontSize: "0.95rem" }} />
            Add Traveler
          </Box>
        </Collapse>
      </Box>

      {/* ── Overflow menu ─────────────────────────────────────────────────────── */}
      <Menu
        anchorEl={menuAnchor?.el}
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
          onClick={() => {
            const t = menuAnchor!.traveler;
            closeMenu();
            openEdit(t);
          }}
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
          onClick={() => {
            const t = menuAnchor!.traveler;
            closeMenu();
            handleDeleteClick(t);
          }}
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.82rem",
            color: tokens.red,
            py: "8px",
            px: "14px",
            "&:hover": { bgcolor: tokens.redBg },
          }}
        >
          Remove {menuAnchor?.traveler.name}
        </MenuItem>
      </Menu>

      {/* ── Edit traveler modal ───────────────────────────────────────────────── */}
      <Dialog
        open={Boolean(editingTraveler)}
        onClose={closeEdit}
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
            Edit traveler
          </Typography>
          <Box
            component="button"
            onClick={closeEdit}
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

        <Box
          sx={{
            px: "20px",
            pt: "14px",
            pb: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
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
                "& .MuiOutlinedInput-input": { py: "9px", px: "11px", color: tokens.text },
              }}
            />
          </Box>

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

          {editCode && (() => {
            const r = getSchengenRule(editCode);
            if (r.access === "visa_free") return null;
            return (
              <Typography
                sx={{
                  fontFamily: tokens.fontBody,
                  fontSize: "0.72rem",
                  color: tokens.textGhost,
                }}
              >
                {r.access === "free_movement"
                  ? "EU/EEA/Swiss passports have free movement — no 90-day limit applies."
                  : r.access === "suspended"
                    ? (r.notes?.[0]?.text ?? "Visa-free access is temporarily suspended.")
                    : "A Schengen visa is required for this passport."}
              </Typography>
            );
          })()}
        </Box>

        <Box sx={{ height: 1, bgcolor: tokens.border }} />
        <Box sx={{ px: "20px", py: "12px", display: "flex", gap: "7px" }}>
          <Box
            component="button"
            onClick={closeEdit}
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
            onClick={handleEditSave}
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

      {/* ── Delete confirmation dialog ─────────────────────────────────────── */}
      <Dialog
        open={Boolean(pendingDeleteId)}
        onClose={() => setPendingDeleteId(null)}
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
          Remove {pendingTraveler?.name}?
        </DialogTitle>

        <DialogContent sx={{ pb: "8px" }}>
          <Typography sx={{ fontSize: "0.83rem", color: tokens.textSoft }}>
            This will permanently delete{" "}
            <strong>{pendingTraveler?.trips.length}</strong>{" "}
            {pendingTraveler?.trips.length === 1 ? "trip" : "trips"} for{" "}
            {pendingTraveler?.name}. This cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: "16px", pb: "12px", gap: "8px" }}>
          <Box
            component="button"
            onClick={() => setPendingDeleteId(null)}
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
            onClick={handleConfirmDelete}
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
            Remove
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
}
