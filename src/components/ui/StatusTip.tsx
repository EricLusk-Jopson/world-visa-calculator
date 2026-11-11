import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import { tokens } from "@/styles/theme";
import type { SourceDoc } from "@/types";
import { trackEvent } from "@/utils/analytics";
import { BottomDrawer } from "./BottomDrawer";
import { SourceButton } from "./SourceButton";
import {
  DURATION_LEGEND,
  ELIGIBILITY_LEGEND,
  legendEntry,
  type LegendEntry,
  type StatusKind,
  type StatusState,
} from "./statusLegend";

export interface StatusSource {
  /** e.g. "Entry rule", shown as "Entry rule source". */
  label: string;
  source: SourceDoc;
}

interface StatusTipProps<K extends StatusKind> {
  kind: K;
  state: StatusState<K>;
  /** Overrides the status's own label, e.g. with the traveler's access label. */
  heading?: string;
  /** Overrides the status's own description with the traveler's specifics. */
  detail?: string;
  /** Travelers in this status, for a summary count; omit on a single traveler's icon. */
  count?: number;
  sources?: StatusSource[];
  /** The icon (or icon and count) the tip explains. */
  children: React.ReactNode;
}

/**
 * A trip status icon that explains itself: what the status means for this
 * trip, the sources behind it (each opening its own source details), and a
 * guide to every status icon. A hover tooltip on desktop (pinned open by a
 * click, so its source details can open from it) whose guide opens in a
 * scrollable sidebar; a bottom sheet on touch devices, guide included.
 *
 * Clicks never reach the icon's ancestors, so it can sit inside a clickable
 * row or card header without triggering it.
 */
export function StatusTip<K extends StatusKind>({ kind, state, heading, detail, count, sources = [], children }: StatusTipProps<K>) {
  const touch = useMediaQuery("(hover: none)");
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [guide, setGuide] = useState(false);
  const entry = legendEntry(kind, state);
  const label = heading ?? entry.label;
  const open = hovered || pinned;

  const track = () => trackEvent("status_tip_opened", { kind, state, count });
  const activate = () => {
    if (touch) {
      setSheet(true);
      track();
    } else {
      if (!open) track();
      setPinned((v) => !v);
    }
  };

  const content = (
    <StatusTipContent
      kind={kind}
      state={state}
      entry={entry}
      label={label}
      detail={detail ?? entry.description}
      count={count}
      sources={sources}
      touch={touch}
      onOpenGuide={
        touch
          ? undefined
          : () => {
              // The guide takes over from the tooltip.
              setPinned(false);
              setHovered(false);
              setGuide(true);
              trackEvent("icon_guide_opened", { kind, state });
            }
      }
    />
  );

  const trigger = (
    <Box
      component="span"
      role="button"
      tabIndex={0}
      aria-label={count === undefined ? label : `${label}: ${count}`}
      aria-haspopup="dialog"
      onClick={activate}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      }}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        cursor: "pointer",
        borderRadius: "6px",
        "&:focus-visible": { outline: `2px solid ${tokens.navy}`, outlineOffset: "1px" },
      }}
    >
      {children}
    </Box>
  );

  return (
    // Stops clicks on the icon, and on the tooltip or sheet (portalled, but
    // still React children of this span), from reaching a clickable ancestor.
    <Box component="span" sx={{ display: "inline-flex" }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
      {touch ? (
        <>
          {trigger}
          <BottomDrawer open={sheet} onClose={() => setSheet(false)} title={label}>
            {sheet && <Box sx={{ px: "20px", pb: "20px" }}>{content}</Box>}
          </BottomDrawer>
        </>
      ) : (
        <ClickAwayListener
          onClickAway={(e) => {
            // Source details open in their own popover; using them keeps this open.
            if ((e.target as Element)?.closest?.(".MuiTooltip-popper, .MuiPopover-root, .MuiDrawer-root")) return;
            setPinned(false);
          }}
        >
          <Box component="span" sx={{ display: "inline-flex" }}>
            <Tooltip
              open={open}
              onOpen={() => {
                if (!open) track();
                setHovered(true);
              }}
              onClose={() => setHovered(false)}
              title={
                // A click inside pins it, so it stays while a source's details are open.
                <Box onClick={() => setPinned(true)}>{content}</Box>
              }
              // The trigger keeps its own label; the tip describes it.
              describeChild
              placement="bottom"
              arrow
              enterDelay={150}
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: tokens.white,
                    color: tokens.text,
                    border: `1px solid ${tokens.border}`,
                    borderRadius: "10px",
                    boxShadow: "0 4px 20px rgba(12,30,60,0.15)",
                    p: "10px 12px",
                    width: 280,
                    maxWidth: "calc(100vw - 32px)",
                  },
                },
                arrow: { sx: { color: tokens.white, "&::before": { border: `1px solid ${tokens.border}` } } },
              }}
            >
              {trigger}
            </Tooltip>
          </Box>
        </ClickAwayListener>
      )}
      {!touch && <IconGuideSidebar open={guide} onClose={() => setGuide(false)} kind={kind} state={state} />}
    </Box>
  );
}

function StatusTipContent({
  kind,
  state,
  entry,
  label,
  detail,
  count,
  sources,
  touch,
  onOpenGuide,
}: {
  kind: StatusKind;
  state: string;
  entry: LegendEntry;
  label: string;
  detail: string;
  count?: number;
  sources: StatusSource[];
  touch: boolean;
  /** Desktop: opens the guide in its own sidebar. Touch shows it inline in the sheet. */
  onOpenGuide?: () => void;
}) {
  // A sheet has the room to show the guide straight away.
  const [guide, setGuide] = useState(touch);
  const text = { fontFamily: tokens.fontBody, fontSize: touch ? "0.85rem" : "0.74rem", lineHeight: 1.45, color: tokens.textSoft } as const;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: touch ? "10px" : "6px" }}>
      {!touch && (
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {entry.icon("0.95rem")}
          <Typography sx={{ ...text, fontWeight: 700, color: tokens.text }}>{label}</Typography>
        </Box>
      )}
      {count !== undefined && (
        <Typography sx={{ ...text, fontWeight: 600, color: tokens.text }}>
          {count} traveler{count === 1 ? "" : "s"}
        </Typography>
      )}
      <Typography sx={text}>{detail}</Typography>

      {sources.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: touch ? "8px" : "2px" }}>
          {sources.map((s) => (
            <SourceButton key={s.label} source={s.source} variant="text" label={`${s.label} source`} />
          ))}
        </Box>
      )}

      <Box sx={{ borderTop: `1px solid ${tokens.border}`, pt: touch ? "10px" : "6px" }}>
        <Box
          component="button"
          type="button"
          aria-expanded={onOpenGuide ? undefined : guide}
          aria-haspopup={onOpenGuide ? "dialog" : undefined}
          onClick={(e: React.MouseEvent) => {
            if (!onOpenGuide) return setGuide((v) => !v);
            e.stopPropagation(); // not a click that pins the tooltip: the guide replaces it
            onOpenGuide();
          }}
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: touch ? "0.85rem" : "0.7rem",
            color: tokens.textSoft,
            p: touch ? "6px 0" : 0,
            border: 0,
            bgcolor: "transparent",
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {onOpenGuide ? "Icon guide →" : guide ? "Hide icon guide" : "Icon guide"}
        </Box>
        {!onOpenGuide && guide && (
          <Box sx={{ mt: "8px" }}>
            <IconGuide kind={kind} state={state} touch />
          </Box>
        )}
      </Box>
    </Box>
  );
}

/** What every status icon means; the kind being explained comes first, its current status highlighted. */
function IconGuide({ kind, state, touch }: { kind: StatusKind; state: string; touch: boolean }) {
  const eligibility = { kind: "eligibility", title: "Entry eligibility", legend: ELIGIBILITY_LEGEND as Record<string, LegendEntry> };
  const duration = { kind: "duration", title: "Stay duration", legend: DURATION_LEGEND as Record<string, LegendEntry> };
  const groups = kind === "eligibility" ? [eligibility, duration] : [duration, eligibility];
  const text = { fontFamily: tokens.fontBody, fontSize: touch ? "0.8rem" : "0.78rem", lineHeight: 1.45, color: tokens.textSoft } as const;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }} data-testid="icon-guide">
      {groups.map((g) => (
        <Box key={g.kind} sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.66rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: tokens.textGhost,
              mb: "2px",
            }}
          >
            {g.title}
          </Typography>
          {Object.entries(g.legend).map(([key, e]) => {
            const current = g.kind === kind && key === state;
            return (
              <Box
                key={key}
                aria-current={current || undefined}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  px: "8px",
                  py: "6px",
                  mx: "-8px",
                  borderRadius: "8px",
                  bgcolor: current ? tokens.mist : "transparent",
                }}
              >
                <Box sx={{ display: "inline-flex", mt: "1px", flexShrink: 0 }}>{e.icon("1rem")}</Box>
                <Typography sx={text}>
                  <Box component="span" sx={{ fontWeight: 600, color: tokens.text }}>
                    {e.label}
                  </Box>
                  {" · "}
                  {e.description}
                </Typography>
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}

/** The icon guide on desktop: a scrollable sidebar over the right edge of the page. */
function IconGuideSidebar({ open, onClose, kind, state }: { open: boolean; onClose: () => void; kind: StatusKind; state: string }) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      // Above the tooltip it's opened from, and any modal behind that.
      sx={{ zIndex: (t) => t.zIndex.tooltip + 1 }}
      slotProps={{
        paper: {
          sx: { width: 360, maxWidth: "100vw", bgcolor: tokens.offWhite, display: "flex", flexDirection: "column" },
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "4px", pl: "16px", pr: "8px", py: "8px", bgcolor: tokens.navy, flexShrink: 0 }}>
        <Typography
          sx={{ flex: 1, fontFamily: tokens.fontBody, fontSize: "1rem", fontStyle: "italic", fontWeight: 430, color: tokens.white }}
        >
          Icon guide
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label="Close icon guide" sx={{ color: tokens.white, p: "8px" }}>
          <CloseIcon sx={{ fontSize: "1.1rem" }} />
        </IconButton>
      </Box>
      <Box sx={{ flex: 1, overflowY: "auto", p: "16px 20px 24px" }}>
        {open && <IconGuide kind={kind} state={state} touch={false} />}
      </Box>
    </Drawer>
  );
}
