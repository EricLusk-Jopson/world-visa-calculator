import Snackbar from "@mui/material/Snackbar";
import Slide from "@mui/material/Slide";
import Portal from "@mui/material/Portal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";

interface ToastProps {
  open: boolean;
  message: string;
  onClose: () => void;
  /** Auto-dismiss delay in ms. Defaults to 2200. */
  duration?: number;
  /** Override the stacking context — e.g. to render above a full-screen frame opened at a raised z-index. */
  zIndex?: number;
}

/**
 * Lightweight, app-styled toast/snackbar. Use for transient confirmations
 * (e.g. "Link copied") — there's no global toast host, each caller owns its
 * own `open` state and renders its own `<Toast />`.
 */
export function Toast({ open, message, onClose, duration = 2200, zIndex }: ToastProps) {
  return (
    // Snackbar renders in place rather than through its own portal — wrapped in
    // Portal here so it always mounts as a direct document.body child. Without
    // this it can end up nested behind a sibling full-screen Dialog regardless
    // of z-index, since z-index only resolves within a shared stacking context.
    <Portal>
      <Snackbar
        open={open}
        onClose={onClose}
        autoHideDuration={duration}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        slots={{ transition: Slide }}
        slotProps={{ transition: { direction: "up" } }}
        sx={{
          bottom: "calc(env(safe-area-inset-bottom) + 20px) !important",
          ...(zIndex !== undefined && { zIndex }),
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            px: "16px",
            py: "11px",
            bgcolor: tokens.navy,
            borderRadius: "100px",
            boxShadow: "0 8px 24px rgba(12,30,60,0.28)",
          }}
        >
          <Box
            sx={{
              width: 18,
              height: 18,
              flexShrink: 0,
              bgcolor: tokens.green,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 11 11" fill="none">
              <path
                d="M2 5.5l2.5 2.5 4.5-5"
                stroke={tokens.white}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.82rem",
              fontWeight: 600,
              color: tokens.white,
              whiteSpace: "nowrap",
            }}
          >
            {message}
          </Typography>
        </Box>
      </Snackbar>
    </Portal>
  );
}
