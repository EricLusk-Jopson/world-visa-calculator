import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IosShareIcon from "@mui/icons-material/IosShare";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { alpha } from "@mui/material/styles";
import { tokens } from "@/styles/theme";
import { BottomDrawer } from "@/components/ui/BottomDrawer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UtilityDrawerProps {
  open: boolean;
  onClose: () => void;
  onShare: () => void;
  onClearAll: () => void;
  travelerCount: number;
}

// ─── Row component ────────────────────────────────────────────────────────────

function UtilityRow({
  icon,
  label,
  onClick,
  href,
  color,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  color?: string;
  disabled?: boolean;
}) {
  const textColor = disabled
    ? tokens.textGhost
    : (color ?? tokens.navy);

  const iconColor = disabled
    ? tokens.textGhost
    : (color ?? tokens.textSoft);

  const commonSx = {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    px: "20px",
    py: "15px",
    borderTop: `1px solid ${tokens.border}`,
    cursor: disabled ? "default" : "pointer",
    textDecoration: "none",
    width: "100%",
    bgcolor: "transparent",
    border: "none",
    textAlign: "left" as const,
    opacity: disabled ? 0.5 : 1,
    "&:active": disabled ? {} : { bgcolor: alpha(tokens.navy, 0.04) },
  };

  const content = (
    <>
      <Box sx={{ color: iconColor, display: "flex", flexShrink: 0 }}>{icon}</Box>
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.92rem",
          fontWeight: 500,
          color: textColor,
        }}
      >
        {label}
      </Typography>
    </>
  );

  if (href) {
    return (
      <Box
        component="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        sx={commonSx}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      component="button"
      onClick={disabled ? undefined : onClick}
      sx={commonSx}
    >
      {content}
    </Box>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UtilityDrawer({
  open,
  onClose,
  onShare,
  onClearAll,
  travelerCount,
}: UtilityDrawerProps) {
  const handleShare = () => {
    onShare();
    onClose();
  };

  const handleClearAll = () => {
    onClearAll();
    onClose();
  };

  return (
    <BottomDrawer open={open} onClose={onClose}>
      <Box sx={{ pb: "12px" }}>
        <UtilityRow
          icon={<IosShareIcon sx={{ fontSize: "1.15rem" }} />}
          label="Share link"
          onClick={handleShare}
        />
        <UtilityRow
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
            </svg>
          }
          label="Support this project"
          href="https://ko-fi.com/ericluskjopson"
          color="#FF5E5B"
        />
        <UtilityRow
          icon={<DeleteOutlineIcon sx={{ fontSize: "1.15rem" }} />}
          label="Clear all trips"
          onClick={handleClearAll}
          color={tokens.red}
          disabled={travelerCount === 0}
        />
      </Box>
    </BottomDrawer>
  );
}
