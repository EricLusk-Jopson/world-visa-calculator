import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Popover, { type PopoverActions } from "@mui/material/Popover";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import { tokens } from "@/styles/theme";
import type { SourceDoc } from "@/types";
import { findSourceRef } from "@/data/sourceIndex";
import {
  describeLinkCheck,
  describeRuleChanges,
  formatDay,
  ISSUE_KINDS,
  ISSUE_MESSAGE_MAX,
  issueReportProperties,
  loadLinkStatus,
  type IssueKind,
  type LinkCheck,
  type StatusLine,
} from "@/data/sourceStatus";
import { reportSourceIssue, trackEvent } from "@/utils/analytics";

const linkSx = {
  fontFamily: tokens.fontBody,
  fontSize: "0.74rem",
  fontWeight: 600,
  color: tokens.navy,
  textDecoration: "none",
  "&:hover": { textDecoration: "underline" },
} as const;

const lineSx = { fontFamily: tokens.fontBody, fontSize: "0.68rem", lineHeight: 1.45, color: tokens.textSoft } as const;

const TONE_COLOR: Record<StatusLine["tone"], string> = {
  ok: tokens.greenText,
  neutral: tokens.textSoft,
  warn: tokens.amberText,
};

/**
 * A rule's citation: a small button that opens the source's details: its
 * links, when it was last verified and link-checked, when the region's
 * rules last changed, and a form to report a problem with it.
 */
export function SourceButton({ source, variant = "icon" }: { source: SourceDoc; variant?: "icon" | "text" }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  // The report form grows the popover after it opens; re-fit it to the screen.
  const actions = useRef<PopoverActions>(null);
  const open = (el: HTMLElement) => {
    setAnchor(el);
    trackEvent("source_details_opened", { region: findSourceRef(source)?.region });
  };

  return (
    <>
      {variant === "icon" ? (
        <IconButton
          size="small"
          aria-label="Source details"
          onClick={(e) => open(e.currentTarget)}
          sx={{ p: "1px", color: tokens.textGhost, "&:hover": { color: tokens.navy, bgcolor: "transparent" } }}
        >
          <InfoOutlineIcon sx={{ fontSize: "0.8rem" }} />
        </IconButton>
      ) : (
        <Box
          component="button"
          type="button"
          onClick={(e: React.MouseEvent<HTMLElement>) => open(e.currentTarget)}
          sx={{ ...linkSx, fontSize: "0.7rem", fontWeight: 400, p: 0, border: 0, bgcolor: "transparent", cursor: "pointer", alignSelf: "flex-start" }}
        >
          Source
        </Box>
      )}
      <Popover
        action={actions}
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "10px",
              p: "12px 14px",
              boxShadow: "0 4px 20px rgba(12,30,60,0.15)",
              width: 300,
              maxWidth: "calc(100vw - 32px)",
            },
          },
        }}
      >
        {anchor && <SourceDetails source={source} onResize={() => actions.current?.updatePosition()} />}
      </Popover>
    </>
  );
}

function SourceDetails({ source, onResize }: { source: SourceDoc; onResize: () => void }) {
  const ref = findSourceRef(source);
  const [check, setCheck] = useState<LinkCheck | undefined | "loading">("loading");
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    let live = true;
    loadLinkStatus().then((idx) => live && setCheck(idx?.urls[source.direct.url]));
    return () => {
      live = false;
    };
  }, [source.direct.url]);

  useEffect(onResize, [reporting, check, onResize]);

  const rules = describeRuleChanges(ref?.region);
  const status = check === "loading" ? undefined : describeLinkCheck(check);
  const click = (linkType: string) => trackEvent("source_link_clicked", { link_type: linkType, region: ref?.region });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <Box component="a" href={source.direct.url} target="_blank" rel="noopener noreferrer" onClick={() => click("direct")} sx={linkSx}>
          Official source ↗
        </Box>
        {source.parent.url !== source.direct.url && (
          <Box component="a" href={source.parent.url} target="_blank" rel="noopener noreferrer" onClick={() => click("overview")} sx={{ ...linkSx, fontWeight: 400 }}>
            Overview page ↗
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", mt: "2px" }}>
        <Typography sx={lineSx}>Information last verified {formatDay(source.dateChecked)}</Typography>
        {status && <Typography sx={{ ...lineSx, color: TONE_COLOR[status.tone] }}>{status.text}</Typography>}
        {rules && (
          <Box component="a" href={rules.href} sx={{ ...lineSx, color: tokens.navy, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
            {rules.text} →
          </Box>
        )}
      </Box>

      <Box sx={{ borderTop: `1px solid ${tokens.border}`, mt: "4px", pt: "8px" }}>
        {reporting ? (
          <ReportForm source={source} region={ref?.region} sourceKey={ref?.key} onCancel={() => setReporting(false)} />
        ) : (
          <Box
            component="button"
            type="button"
            onClick={() => setReporting(true)}
            sx={{ ...linkSx, fontWeight: 400, fontSize: "0.7rem", color: tokens.textSoft, p: 0, border: 0, bgcolor: "transparent", cursor: "pointer" }}
          >
            Report a problem with this source
          </Box>
        )}
      </Box>
    </Box>
  );
}

function ReportForm({ source, region, sourceKey, onCancel }: { source: SourceDoc; region?: string; sourceKey?: string; onCancel: () => void }) {
  const [kind, setKind] = useState<IssueKind | "">("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<"sent" | "unavailable" | "limit" | null>(null);

  if (result) {
    const text = {
      sent: "Thanks. We'll check this source and fix what's wrong.",
      limit: "Thanks. You've sent several reports already; we'll look at those first.",
      unavailable: "Reporting isn't available right now. Please try again later.",
    }[result];
    return <Typography sx={{ ...lineSx, color: result === "sent" ? tokens.greenText : tokens.textSoft }}>{text}</Typography>;
  }

  const send = () => {
    if (!kind) return;
    setResult(reportSourceIssue(issueReportProperties({ region, key: sourceKey, url: source.direct.url, kind, message, dateChecked: source.dateChecked })));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <Typography sx={{ ...lineSx, fontWeight: 600, color: tokens.text }}>What's wrong?</Typography>
      <RadioGroup value={kind} onChange={(e) => setKind(e.target.value as IssueKind)}>
        {ISSUE_KINDS.map((k) => (
          <FormControlLabel
            key={k.value}
            value={k.value}
            control={<Radio size="small" sx={{ p: "3px" }} />}
            label={k.label}
            sx={{ m: 0, "& .MuiFormControlLabel-label": { ...lineSx, color: tokens.text } }}
          />
        ))}
      </RadioGroup>
      <TextField
        multiline
        minRows={2}
        maxRows={5}
        placeholder="Details (optional), e.g. what the source says now"
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, ISSUE_MESSAGE_MAX))}
        slotProps={{ htmlInput: { maxLength: ISSUE_MESSAGE_MAX, "aria-label": "Details" } }}
        // 16px on phones: iOS zooms into any smaller input on focus.
        sx={{
          "& .MuiInputBase-root": { p: "6px 8px" },
          "& .MuiInputBase-input": { fontFamily: tokens.fontBody, fontSize: { xs: "16px", sm: "0.75rem" }, lineHeight: 1.4 },
        }}
      />
      <Typography sx={{ ...lineSx, fontSize: "0.62rem", color: tokens.textGhost }}>
        Sent anonymously with this source's link. Please don't include personal details.
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
        <Button size="small" onClick={onCancel} sx={{ fontSize: "0.7rem", textTransform: "none", color: tokens.textSoft }}>
          Cancel
        </Button>
        <Button size="small" variant="contained" disableElevation disabled={!kind} onClick={send} sx={{ fontSize: "0.7rem", textTransform: "none" }}>
          Send report
        </Button>
      </Box>
    </Box>
  );
}
