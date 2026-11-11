import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";
import { BottomDrawer } from "@/components/ui/BottomDrawer";

/** What a tapped timeline marker explains — the mobile stand-in for its tooltip. */
export interface MarkerDetail {
  title: string;
  /** One sentence per traveller (return markers) or per trip (age-outs). */
  lines: string[];
  /** Dimmed explanation under the lines. */
  note?: string;
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
    <BottomDrawer
      open={detail !== null}
      onClose={onClose}
      title={detail?.title}
    >
      <Box sx={{ px: "20px", pb: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {detail?.lines.map((line, i) => (
          <Typography
            key={i}
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.9rem",
              color: tokens.text,
              lineHeight: 1.5,
            }}
          >
            {line}
          </Typography>
        ))}
        {detail?.note && (
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.8rem",
              color: tokens.textSoft,
              lineHeight: 1.5,
              mt: "4px",
            }}
          >
            {detail.note}
          </Typography>
        )}
      </Box>
    </BottomDrawer>
  );
}
