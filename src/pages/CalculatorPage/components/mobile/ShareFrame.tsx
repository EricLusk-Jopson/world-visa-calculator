import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { FullScreenSlider } from "@/components/ui/FullScreenSlider";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { tokens } from "@/styles/theme";
import { trackEvent } from "@/utils/analytics";
import type { CopyShareableUrlOptions } from "@/features/sharing";

type LinkType = "standard" | "nosave";

const LINK_TYPE_WRAPPER_SX = {
  display: "flex",
  bgcolor: tokens.mist,
  borderRadius: "10px",
  p: "3px",
  gap: "3px",
} as const;

const linkTypeButtonSx = (active: boolean) =>
  ({
    flex: 1,
    px: "10px",
    py: "9px",
    border: "none",
    borderRadius: "7px",
    fontFamily: tokens.fontBody,
    fontSize: "0.85rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.15s",
    bgcolor: active ? tokens.white : "transparent",
    color: active ? tokens.navy : tokens.textSoft,
    boxShadow: active
      ? "0 1px 3px rgba(12,30,60,0.08), 0 1px 2px rgba(12,30,60,0.04)"
      : "none",
  }) as const;

interface ShareFrameProps {
  open: boolean;
  onClose: () => void;
  shareableUrl: string;
  nosaveShareableUrl: string;
  onCopy: (options?: CopyShareableUrlOptions) => Promise<void>;
  travelerCount: number;
}

export function ShareFrame({
  open,
  onClose,
  shareableUrl,
  nosaveShareableUrl,
  onCopy,
  travelerCount,
}: ShareFrameProps) {
  const [linkType, setLinkType] = useState<LinkType>("standard");
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setLinkType("standard");
      setToastOpen(false);
    }
  }, [open]);

  const activeUrl = linkType === "nosave" ? nosaveShareableUrl : shareableUrl;
  const isEmpty = travelerCount === 0;

  const handleCopy = useCallback(async () => {
    const nosave = linkType === "nosave";
    await onCopy({ nosave });
    trackEvent("link_copied", { nosave, surface: "mobile" });
    setToastOpen(true);
  }, [onCopy, linkType]);

  const footer = (
    <Button
      onClick={handleCopy}
      size="lg"
      startIcon={<ContentCopyIcon sx={{ fontSize: "1.1rem" }} />}
      sx={{ width: "100%" }}
    >
      Copy link
    </Button>
  );

  return (
    <>
      <FullScreenSlider
        open={open}
        onClose={onClose}
        title="Share this tracker"
        footer={footer}
        zIndex={1450}
      >
        <Box
          sx={{
            px: "16px",
            py: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* How it works */}
          <Box
            sx={{
              bgcolor: tokens.mist,
              borderRadius: "12px",
              p: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
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
            <Typography sx={{ fontSize: "0.85rem", color: tokens.text, lineHeight: 1.6 }}>
              All traveler data is encoded directly into the URL — no account
              or server needed. Anyone with the link can open the tracker and
              see the same trips and statuses instantly.
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: tokens.textSoft, lineHeight: 1.55 }}>
              Your own itinerary is saved only in <strong>this browser</strong> —
              it won't show up on another browser or device, and clearing your
              browser data will clear it too.
            </Typography>
          </Box>

          {/* Link type toggle */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Typography
              sx={{
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: tokens.textSoft,
              }}
            >
              Link type
            </Typography>
            <Box sx={LINK_TYPE_WRAPPER_SX}>
              <Box
                component="button"
                onClick={() => setLinkType("standard")}
                sx={linkTypeButtonSx(linkType === "standard")}
              >
                Standard
              </Box>
              <Box
                component="button"
                onClick={() => setLinkType("nosave")}
                sx={linkTypeButtonSx(linkType === "nosave")}
              >
                No-save link
              </Box>
            </Box>
            <Typography sx={{ fontSize: "0.82rem", color: tokens.textSoft, lineHeight: 1.55 }}>
              {linkType === "nosave" ? (
                <>
                  Opening this link won't overwrite any itinerary the
                  recipient has already saved in their own browser. Use this
                  when posting somewhere public — a blog post, forum, or
                  social media — so you don't accidentally clobber a
                  reader's own trips.
                </>
              ) : (
                <>
                  Opening this link replaces whatever itinerary is currently
                  saved in the recipient's browser with the one you're
                  sharing now.
                </>
              )}
            </Typography>
          </Box>

          {/* Empty state warning */}
          {isEmpty && (
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                p: "11px 14px",
                bgcolor: tokens.amberBg,
                border: `1px solid ${tokens.amberBorder}`,
                borderRadius: "12px",
              }}
            >
              <Typography sx={{ fontSize: "0.8rem", mt: "1px", flexShrink: 0, color: tokens.amberText }}>
                ⚠
              </Typography>
              <Typography sx={{ fontSize: "0.82rem", color: tokens.amberText, lineHeight: 1.5 }}>
                No travelers added yet. Add a traveler and some trips — the
                link will include everything automatically.
              </Typography>
            </Box>
          )}

          {/* URL row */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
                bgcolor: tokens.mist,
                border: `1.5px solid ${tokens.border}`,
                borderRadius: "10px",
                px: "14px",
                py: "12px",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  fontFamily: "'Courier New', monospace",
                  color: tokens.textSoft,
                  wordBreak: "break-all",
                  userSelect: "all",
                }}
              >
                {activeUrl}
              </Typography>
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
                py: "4px",
                bgcolor: tokens.greenBg,
                border: `1px solid ${tokens.greenBorder}`,
                borderRadius: "100px",
                alignSelf: "flex-start",
              }}
            >
              <Box sx={{ width: 5, height: 5, bgcolor: tokens.green, borderRadius: "50%" }} />
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: tokens.greenText,
                }}
              >
                {travelerCount} traveler{travelerCount !== 1 ? "s" : ""} included
              </Typography>
            </Box>
          )}
        </Box>
      </FullScreenSlider>

      <Toast
        open={toastOpen}
        message="Link copied to clipboard"
        onClose={() => setToastOpen(false)}
        zIndex={1500}
      />
    </>
  );
}
