import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import GroupRemoveIcon from "@mui/icons-material/GroupRemove";
import IosShareIcon from "@mui/icons-material/IosShare";
import CheckIcon from "@mui/icons-material/Check";
import { alpha } from "@mui/material/styles";
import { tokens } from "@/styles/theme";
import { BottomDrawer } from "@/components/ui/BottomDrawer";
import { trackEvent } from "@/utils/analytics";

const ICON_COLUMN_WIDTH = 20;
const ICON_TITLE_GAP = 10;

interface ClearAllDrawerProps {
  open: boolean;
  onClose: () => void;
  onClearTrips: () => void;
  onClearTravelers: () => void;
  onCopyLink: () => Promise<void>;
  travelerCount: number;
}

function ClearOptionRow({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "3px",
        width: "100%",
        textAlign: "left",
        py: "13px",
        px: "20px",
        bgcolor: "transparent",
        border: "none",
        borderTop: `1px solid ${tokens.border}`,
        cursor: "pointer",
        "&:active": { bgcolor: alpha(tokens.red, 0.04) },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: `${ICON_TITLE_GAP}px` }}>
        <Box
          sx={{
            width: ICON_COLUMN_WIDTH,
            color: tokens.red,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.92rem",
            fontWeight: 600,
            color: tokens.red,
          }}
        >
          {title}
        </Typography>
      </Box>
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.76rem",
          color: tokens.textSoft,
          lineHeight: 1.45,
          pl: `${ICON_COLUMN_WIDTH + ICON_TITLE_GAP}px`,
        }}
      >
        {description}
      </Typography>
    </Box>
  );
}

function CopyLinkButton({ onCopy }: { onCopy: () => Promise<void> }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    await onCopy();
    trackEvent("link_copied", { nosave: false });
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <Box
      component="button"
      onClick={handleClick}
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        py: "11px",
        border: `1px solid ${copied ? tokens.green : tokens.border}`,
        borderRadius: "10px",
        bgcolor: copied ? tokens.greenBg : tokens.mist,
        color: copied ? tokens.greenText : tokens.navy,
        fontFamily: tokens.fontBody,
        fontSize: "0.85rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s",
        "&:active": { bgcolor: copied ? tokens.greenBg : tokens.border },
      }}
    >
      {copied ? (
        <CheckIcon sx={{ fontSize: "1rem" }} />
      ) : (
        <IosShareIcon sx={{ fontSize: "1rem" }} />
      )}
      {copied ? "Link copied" : "Copy current link"}
    </Box>
  );
}

/**
 * Mobile confirmation drawer for the "Clear data" utility action. Offers
 * two destructive options — clear every trip (travelers are kept), or clear
 * every traveler along with their trips — plus a quick way to save the
 * current itinerary as a link before either one is used.
 */
export function ClearAllDrawer({
  open,
  onClose,
  onClearTrips,
  onClearTravelers,
  onCopyLink,
  travelerCount,
}: ClearAllDrawerProps) {
  function handleClearTrips() {
    onClearTrips();
    onClose();
  }

  function handleClearTravelers() {
    onClearTravelers();
    onClose();
  }

  return (
    <BottomDrawer open={open} onClose={onClose} title="Clear data?">
      <Typography
        sx={{
          fontSize: "0.8rem",
          color: tokens.textSoft,
          lineHeight: 1.5,
          px: "20px",
          pb: "4px",
        }}
      >
        Choose what to remove. This can't be undone.
      </Typography>

      <Box sx={{ pb: "4px" }}>
        <ClearOptionRow
          icon={<DeleteOutlineIcon sx={{ fontSize: "1.1rem" }} />}
          title="Clear all trips"
          description={`Removes every trip from ${travelerCount > 1 ? `all ${travelerCount} travelers` : "this traveler"}. Travelers are kept.`}
          onClick={handleClearTrips}
        />
        <ClearOptionRow
          icon={<GroupRemoveIcon sx={{ fontSize: "1.1rem" }} />}
          title="Clear all travelers"
          description="Removes every traveler along with all of their trips."
          onClick={handleClearTravelers}
        />
      </Box>

      <Box sx={{ px: "20px", pt: "16px", pb: "12px" }}>
        <CopyLinkButton onCopy={onCopyLink} />
      </Box>

      <Box sx={{ px: "20px", pt: "12px", pb: "8px", borderTop: `1px solid ${tokens.border}` }}>
        <Box
          component="button"
          onClick={onClose}
          sx={{
            width: "100%",
            py: "11px",
            border: `1px solid ${tokens.border}`,
            borderRadius: "10px",
            bgcolor: tokens.mist,
            color: tokens.textSoft,
            fontFamily: tokens.fontBody,
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            "&:active": { bgcolor: tokens.border },
          }}
        >
          Cancel
        </Box>
      </Box>
    </BottomDrawer>
  );
}
