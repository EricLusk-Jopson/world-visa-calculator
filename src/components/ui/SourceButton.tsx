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
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import { tokens } from "@/styles/theme";
import type { SourceDoc } from "@/types";
import { findSourceRef } from "@/data/sourceIndex";
import {
  describeLinkProblem,
  describeRuleChange,
  formatDay,
  ISSUE_KINDS,
  ISSUE_MESSAGE_MAX,
  issueReportProperties,
  loadLinkStatus,
  loadStability,
  verifiedDate,
  type IssueKind,
} from "@/data/sourceStatus";
import { reportSourceIssue, trackEvent } from "@/utils/analytics";
import { BottomDrawer } from "./BottomDrawer";

/** Type sizes for the two presentations: a compact desktop popover, a touch-sized bottom sheet. */
const SIZES = {
  compact: { link: "0.74rem", line: "0.68rem", small: "0.62rem", button: "0.7rem" },
  touch: { link: "0.9rem", line: "0.82rem", small: "0.74rem", button: "0.88rem" },
} as const;
type Size = keyof typeof SIZES;

/**
 * A rule's citation: a small button that opens the source's details: its
 * links, when it was last verified, when a rule citing it last changed, any
 * problem the link check found, and a form to report a problem with it. A
 * popover on desktop, a bottom sheet on phones.
 */
export function SourceButton({ source, variant = "icon" }: { source: SourceDoc; variant?: "icon" | "text" }) {
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  // The report form grows the popover after it opens; re-fit it to the screen.
  const actions = useRef<PopoverActions>(null);
  const open = (el: HTMLElement) => {
    setAnchor(el);
    trackEvent("source_details_opened", { region: findSourceRef(source)?.region });
  };
  const close = () => setAnchor(null);

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
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.7rem",
            color: tokens.navy,
            p: 0,
            border: 0,
            bgcolor: "transparent",
            cursor: "pointer",
            alignSelf: "flex-start",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Source
        </Box>
      )}
      {phone ? (
        <BottomDrawer open={Boolean(anchor)} onClose={close} title="Source">
          {anchor && (
            <Box sx={{ px: "20px", pb: "20px" }}>
              <SourceDetails source={source} size="touch" />
            </Box>
          )}
        </BottomDrawer>
      ) : (
        <Popover
          action={actions}
          open={Boolean(anchor)}
          anchorEl={anchor}
          onClose={close}
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
          {anchor && <SourceDetails source={source} size="compact" onResize={() => actions.current?.updatePosition()} />}
        </Popover>
      )}
    </>
  );
}

function SourceDetails({ source, size, onResize }: { source: SourceDoc; size: Size; onResize?: () => void }) {
  const ref = findSourceRef(source);
  const sz = SIZES[size];
  const touch = size === "touch";
  const sourceKey = ref?.key ? `${ref.region}.${ref.key}` : undefined;
  const [problem, setProblem] = useState<string | undefined>();
  const [verified, setVerified] = useState(source.dateChecked);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    let live = true;
    loadLinkStatus().then((idx) => live && setProblem(describeLinkProblem(idx?.urls[source.direct.url])));
    loadStability().then((idx) => live && setVerified(verifiedDate(source.dateChecked, sourceKey ? idx?.sources[sourceKey] : undefined)));
    return () => {
      live = false;
    };
  }, [source.direct.url, source.dateChecked, sourceKey]);

  useEffect(() => onResize?.(), [reporting, problem, onResize]);

  const change = describeRuleChange(sourceKey);
  const click = (linkType: string) => trackEvent("source_link_clicked", { link_type: linkType, region: ref?.region });
  const lineSx = { fontFamily: tokens.fontBody, fontSize: sz.line, lineHeight: 1.45, color: tokens.textSoft } as const;
  const links = [
    { label: "Official source", href: source.direct.url, type: "direct" },
    ...(source.parent.url !== source.direct.url ? [{ label: "Overview page", href: source.parent.url, type: "overview" }] : []),
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: touch ? "12px" : "8px" }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: touch ? "8px" : "14px" }} data-testid="source-links">
        {links.map((l) => (
          <Box
            key={l.type}
            component="a"
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => click(l.type)}
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: sz.link,
              fontWeight: 600,
              color: tokens.navy,
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
              ...(touch && {
                flex: "1 1 0",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${tokens.border}`,
                borderRadius: "10px",
                "&:hover": {},
              }),
            }}
          >
            {l.label} ↗
          </Box>
        ))}
      </Box>

      <Typography sx={lineSx}>
        Verified {formatDay(verified)}
        {change && (
          <>
            {" · "}
            <Box component="a" href={change.href} sx={{ color: tokens.navy, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
              {change.text} →
            </Box>
          </>
        )}
      </Typography>
      {problem && <Typography sx={{ ...lineSx, color: tokens.amberText }}>{problem}</Typography>}

      <Box sx={{ borderTop: `1px solid ${tokens.border}`, pt: touch ? "12px" : "8px" }}>
        {reporting ? (
          <ReportForm source={source} region={ref?.region} sourceKey={ref?.key} size={size} onCancel={() => setReporting(false)} />
        ) : (
          <Box
            component="button"
            type="button"
            onClick={() => setReporting(true)}
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: sz.button,
              color: tokens.textSoft,
              p: touch ? "10px 0" : 0,
              border: 0,
              bgcolor: "transparent",
              cursor: "pointer",
              textAlign: "left",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Report a problem with this source
          </Box>
        )}
      </Box>
    </Box>
  );
}

function ReportForm({
  source,
  region,
  sourceKey,
  size,
  onCancel,
}: {
  source: SourceDoc;
  region?: string;
  sourceKey?: string;
  size: Size;
  onCancel: () => void;
}) {
  const sz = SIZES[size];
  const touch = size === "touch";
  const lineSx = { fontFamily: tokens.fontBody, fontSize: sz.line, lineHeight: 1.45, color: tokens.textSoft } as const;
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
  const buttonSx = { fontSize: sz.button, textTransform: "none", ...(touch && { minHeight: 44, flex: "1 1 0" }) } as const;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: touch ? "10px" : "6px" }}>
      <Typography sx={{ ...lineSx, fontWeight: 600, color: tokens.text }}>What's wrong?</Typography>
      <RadioGroup value={kind} onChange={(e) => setKind(e.target.value as IssueKind)}>
        {ISSUE_KINDS.map((k) => (
          <FormControlLabel
            key={k.value}
            value={k.value}
            control={<Radio size="small" sx={{ p: touch ? "8px" : "3px" }} />}
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
          "& .MuiInputBase-input": { fontFamily: tokens.fontBody, fontSize: touch ? "16px" : "0.75rem", lineHeight: 1.4 },
        }}
      />
      <Typography sx={{ ...lineSx, fontSize: sz.small, color: tokens.textGhost }}>
        Sent anonymously with this source's link. Please don't include personal details.
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: touch ? "10px" : "6px" }}>
        <Button size="small" onClick={onCancel} sx={{ ...buttonSx, color: tokens.textSoft }}>
          Cancel
        </Button>
        <Button size="small" variant="contained" disableElevation disabled={!kind} onClick={send} sx={buttonSx}>
          Send report
        </Button>
      </Box>
    </Box>
  );
}
