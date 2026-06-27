import { forwardRef } from "react";
import Dialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import type { TransitionProps } from "@mui/material/transitions";
import { tokens } from "@/styles/theme";

const SlideTransition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  // Enter from right (left-travel), exit to right (right-travel) — iOS push feel
  return <Slide {...props} direction={props.in ? "left" : "right"} ref={ref} />;
});

interface FullScreenSliderProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export function FullScreenSlider({
  open,
  onClose,
  title,
  children,
  footer,
  rightAction,
}: FullScreenSliderProps) {
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      PaperProps={{
        sx: {
          bgcolor: tokens.offWhite,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          pl: "4px",
          pr: "12px",
          py: "8px",
          bgcolor: tokens.navy,
          flexShrink: 0,
        }}
      >
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: tokens.white, p: "8px" }}
        >
          <ArrowBackIosNewIcon sx={{ fontSize: "1rem" }} />
        </IconButton>
        <Typography
          sx={{
            fontFamily: tokens.fontDisplay,
            fontSize: "1rem",
            fontStyle: "italic",
            fontWeight: 400,
            color: tokens.white,
            flex: 1,
          }}
        >
          {title}
        </Typography>
        {rightAction}
      </Box>

      {/* Scrollable content */}
      <Box sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {children}
      </Box>

      {/* Pinned footer */}
      {footer && (
        <Box
          sx={{
            flexShrink: 0,
            borderTop: `1px solid ${tokens.border}`,
            bgcolor: tokens.white,
            px: "16px",
            py: "12px",
            paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)",
          }}
        >
          {footer}
        </Box>
      )}
    </Dialog>
  );
}
