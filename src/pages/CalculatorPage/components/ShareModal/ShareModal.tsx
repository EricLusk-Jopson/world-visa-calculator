import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { tokens } from "@/styles/theme";
import { trackEvent } from "@/utils/analytics";

interface ShareModalProps {
  open: boolean;
  shareableUrl: string;
  onCopy: () => Promise<void>;
  onClose: () => void;
  travelerCount: number;
}

export function ShareModal({
  open,
  shareableUrl,
  onCopy,
  onClose,
  travelerCount,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await onCopy();
    trackEvent("link_copied");
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }, [onCopy]);

  const isEmpty = travelerCount === 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          width: 440,
          maxWidth: "100%",
          bgcolor: tokens.white,
          borderRadius: "20px",
          boxShadow:
            "0 12px 40px rgba(12,30,60,0.13), 0 2px 6px rgba(12,30,60,0.06)",
          overflow: "hidden",
          outline: "none",
        }}
      >
        {/* ── Header ── */}
        <Box
          sx={{
            px: "20px",
            pt: "18px",
            pb: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${tokens.border}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                bgcolor: tokens.mist,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: tokens.navy,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 1v8.5M4.5 3.5L7 1l2.5 2.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.5 9.5v2C2.5 12.33 3.17 13 4 13h6c.83 0 1.5-.67 1.5-1.5v-2"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            </Box>
            <Typography
              sx={{
                fontFamily: tokens.fontDisplay,
                fontSize: "1.05rem",
                fontStyle: "italic",
                fontWeight: 400,
                color: tokens.navy,
              }}
            >
              Share this tracker
            </Typography>
          </Box>

          <Box
            component="button"
            onClick={onClose}
            sx={{
              width: 26,
              height: 26,
              bgcolor: tokens.mist,
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              color: tokens.textSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
              lineHeight: 1,
              transition: "all 0.15s",
              "&:hover": { bgcolor: tokens.redBg, color: tokens.red },
            }}
          >
            ✕
          </Box>
        </Box>

        {/* ── Body ── */}
        <Box
          sx={{
            px: "20px",
            py: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {/* How it works */}
          <Box
            sx={{
              bgcolor: tokens.mist,
              borderRadius: "10px",
              p: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: tokens.textSoft,
              }}
            >
              How sharing works
            </Typography>
            <Typography
              sx={{
                fontSize: "0.82rem",
                color: tokens.text,
                lineHeight: 1.6,
              }}
            >
              All traveler data is encoded directly into the URL — no account or
              server needed. Anyone with the link can open the tracker and see
              the same trips and statuses instantly.
            </Typography>
            <Typography
              sx={{
                fontSize: "0.78rem",
                color: tokens.textSoft,
                lineHeight: 1.55,
              }}
            >
              The link stays current as you make changes, so re-share any time
              to send an updated snapshot.
            </Typography>
          </Box>

          {/* Empty state warning */}
          {isEmpty && (
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                p: "9px 12px",
                bgcolor: tokens.amberBg,
                border: `1px solid ${tokens.amberBorder}`,
                borderRadius: "10px",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  mt: "1px",
                  flexShrink: 0,
                  color: tokens.amberText,
                }}
              >
                ⚠
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  color: tokens.amberText,
                  lineHeight: 1.5,
                }}
              >
                No travelers added yet. Add a traveler and some trips — the link
                will include everything automatically.
              </Typography>
            </Box>
          )}

          {/* URL row */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <Typography
              sx={{
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: tokens.textSoft,
              }}
            >
              Shareable link
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                bgcolor: tokens.mist,
                border: `1.5px solid ${copied ? tokens.green : tokens.border}`,
                borderRadius: "10px",
                pl: "12px",
                pr: "6px",
                py: "6px",
                transition: "border-color 0.2s",
              }}
            >
              <Typography
                sx={{
                  flex: 1,
                  fontSize: "0.72rem",
                  fontFamily: "'Courier New', monospace",
                  color: tokens.textSoft,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  minWidth: 0,
                  userSelect: "all",
                }}
              >
                {shareableUrl}
              </Typography>

              <Box
                component="button"
                onClick={handleCopy}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  px: "10px",
                  py: "5px",
                  flexShrink: 0,
                  border: "none",
                  borderRadius: "7px",
                  fontFamily: tokens.fontBody,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  bgcolor: copied ? tokens.greenBg : tokens.white,
                  color: copied ? tokens.greenText : tokens.textSoft,
                  boxShadow: copied
                    ? "none"
                    : "0 1px 3px rgba(12,30,60,0.06), 0 1px 2px rgba(12,30,60,0.04)",
                  "&:hover": copied
                    ? {}
                    : {
                        bgcolor: tokens.navy,
                        color: tokens.white,
                        boxShadow: "none",
                      },
                }}
              >
                {copied ? (
                  <>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path
                        d="M2 5.5l2.5 2.5 4.5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <rect
                        x="4"
                        y="4"
                        width="6"
                        height="6"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M3 7H2.5A1.5 1.5 0 0 1 1 5.5v-4A1.5 1.5 0 0 1 2.5 0h4A1.5 1.5 0 0 1 8 1.5V2"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                    </svg>
                    Copy
                  </>
                )}
              </Box>
            </Box>
          </Box>

          {/* Traveler count pill */}
          {!isEmpty && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                px: "10px",
                py: "3px",
                bgcolor: tokens.greenBg,
                border: `1px solid ${tokens.greenBorder}`,
                borderRadius: "100px",
                alignSelf: "flex-start",
              }}
            >
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  bgcolor: tokens.green,
                  borderRadius: "50%",
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.66rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: tokens.greenText,
                }}
              >
                {travelerCount} traveler{travelerCount !== 1 ? "s" : ""}{" "}
                included
              </Typography>
            </Box>
          )}
        </Box>

        {/* ── Footer ── */}
        <Box sx={{ px: "20px", pb: "20px", pt: "4px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Ko-fi support CTA */}
          <Box
            component="a"
            href="https://ko-fi.com/ericluskjopson"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              px: "14px",
              py: "10px",
              bgcolor: "rgba(255, 94, 91, 0.06)",
              border: "1px solid rgba(255, 94, 91, 0.2)",
              borderRadius: "10px",
              textDecoration: "none",
              transition: "background 0.15s, border-color 0.15s",
              "&:hover": {
                bgcolor: "rgba(255, 94, 91, 0.11)",
                borderColor: "rgba(255, 94, 91, 0.4)",
              },
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF5E5B" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
            </svg>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#FF5E5B", lineHeight: 1.3 }}>
                Support this project
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: tokens.textSoft, lineHeight: 1.4, mt: "1px" }}>
                EuroVisaCalculator is free. If it's helped you, consider buying me a coffee.
              </Typography>
            </Box>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0, color: tokens.textGhost }}>
              <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Box>

          <Box
            component="button"
            onClick={onClose}
            sx={{
              width: "100%",
              py: "9px",
              bgcolor: tokens.mist,
              border: "none",
              borderRadius: "10px",
              fontFamily: tokens.fontBody,
              fontSize: "0.85rem",
              fontWeight: 600,
              color: tokens.textSoft,
              cursor: "pointer",
              transition: "all 0.15s",
              "&:hover": { bgcolor: tokens.border, color: tokens.text },
            }}
          >
            Done
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
