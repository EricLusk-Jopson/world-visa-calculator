import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { Instance } from "@popperjs/core";
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
 * click, so its source details can open from it), a bottom sheet on touch
 * devices.
 *
 * Clicks never reach the icon's ancestors, so it can sit inside a clickable
 * row or card header without triggering it.
 */
export function StatusTip<K extends StatusKind>({ kind, state, heading, detail, count, sources = [], children }: StatusTipProps<K>) {
  const touch = useMediaQuery("(hover: none)");
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [sheet, setSheet] = useState(false);
  const popper = useRef<Instance>(null);
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
      entry={entry}
      label={label}
      detail={detail ?? entry.description}
      count={count}
      sources={sources}
      touch={touch}
      onResize={() => popper.current?.update()}
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
                popper: { popperRef: popper },
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
    </Box>
  );
}

function StatusTipContent({
  kind,
  entry,
  label,
  detail,
  count,
  sources,
  touch,
  onResize,
}: {
  kind: StatusKind;
  entry: LegendEntry;
  label: string;
  detail: string;
  count?: number;
  sources: StatusSource[];
  touch: boolean;
  onResize: () => void;
}) {
  // A sheet has the room to show the guide straight away; a tooltip keeps it folded.
  const [guide, setGuide] = useState(touch);
  const text = { fontFamily: tokens.fontBody, fontSize: touch ? "0.85rem" : "0.74rem", lineHeight: 1.45, color: tokens.textSoft } as const;
  // The guide for the icon being explained comes first.
  const eligibility = { kind: "eligibility", title: "Entry eligibility", entries: Object.values(ELIGIBILITY_LEGEND) };
  const duration = { kind: "duration", title: "Stay duration", entries: Object.values(DURATION_LEGEND) };
  const groups = kind === "eligibility" ? [eligibility, duration] : [duration, eligibility];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: touch ? "10px" : "6px" }}>
      {!touch && (
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {entry.icon(touch ? "1.1rem" : "0.95rem")}
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
          aria-expanded={guide}
          onClick={() => {
            setGuide((v) => !v);
            // Let the guide render before the tooltip re-fits itself to it.
            requestAnimationFrame(onResize);
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
          {guide ? "Hide icon guide" : "Icon guide"}
        </Box>
        {guide && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: touch ? "12px" : "8px", mt: touch ? "8px" : "6px" }} data-testid="icon-guide">
            {groups.map((g) => (
              <Box key={g.kind} sx={{ display: "flex", flexDirection: "column", gap: touch ? "8px" : "4px" }}>
                <Typography
                  sx={{
                    fontFamily: tokens.fontBody,
                    fontSize: touch ? "0.7rem" : "0.6rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: tokens.textGhost,
                  }}
                >
                  {g.title}
                </Typography>
                {g.entries.map((e) => (
                  <Box key={e.label} sx={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <Box sx={{ display: "inline-flex", mt: "1px", flexShrink: 0 }}>{e.icon(touch ? "1rem" : "0.85rem")}</Box>
                    <Typography sx={{ ...text, fontSize: touch ? "0.8rem" : "0.68rem" }}>
                      <Box component="span" sx={{ fontWeight: 600, color: tokens.text }}>
                        {e.label}
                      </Box>
                      {" · "}
                      {e.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
