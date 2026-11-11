import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { tokens } from "@/styles/theme";
import { BottomDrawer } from "@/components/ui/BottomDrawer";

/** What a tapped timeline marker explains — the mobile stand-in for its tooltip. */
export interface MarkerDetail {
  /** The destination whose rolling window the marker belongs to. */
  title: string;
  /** Paragraphs from MarkerText (ReturnVisitText / AgingTripText). */
  body: ReactNode;
}

/** Bottom drawer showing a timeline marker's details on mobile. */
export function MarkerDetailDrawer({
  detail,
  onClose,
}: {
  detail: MarkerDetail | null;
  onClose: () => void;
}) {
  return (
    <BottomDrawer open={detail !== null} onClose={onClose} title={detail?.title}>
      <Box
        sx={{
          px: "20px",
          pb: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          fontFamily: tokens.fontBody,
          fontSize: "0.9rem",
          lineHeight: 1.5,
          color: tokens.text,
        }}
      >
        {detail?.body}
      </Box>
    </BottomDrawer>
  );
}
