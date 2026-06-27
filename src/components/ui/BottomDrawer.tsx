import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";

interface BottomDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomDrawer({ open, onClose, title, children }: BottomDrawerProps) {
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      style={{ zIndex: 1400 }}
      PaperProps={{
        sx: {
          borderRadius: "16px 16px 0 0",
          paddingBottom: "env(safe-area-inset-bottom)",
          maxHeight: "90dvh",
          overflowY: "auto",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", pt: "12px", pb: "4px" }}>
        <Box sx={{ width: 40, height: 4, borderRadius: "2px", bgcolor: tokens.border }} />
      </Box>

      {title && (
        <Typography
          sx={{
            fontFamily: tokens.fontDisplay,
            fontSize: "1.15rem",
            fontStyle: "italic",
            fontWeight: 400,
            color: tokens.navy,
            px: "20px",
            pt: "4px",
            pb: "12px",
          }}
        >
          {title}
        </Typography>
      )}

      {children}
    </SwipeableDrawer>
  );
}
