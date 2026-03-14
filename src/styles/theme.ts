import { createTheme, alpha } from "@mui/material/styles";

/*
 * ─── EUROVISACALCULATOR — MUI THEME ─────────────────────────────────────────
 *
 * All design tokens live here. Components consume them via the theme rather
 * than local CSS variables. The landing page uses Fraunces + Plus Jakarta Sans.
 * The calculator app can extend this theme with a different typography
 * override at its route root (e.g. Lora + Mulish) without touching components.
 * ─────────────────────────────────────────────────────────────────────────── */

// ── Raw token values (reference from outside MUI if needed) ─────────────────

export const tokens = {
  navy: "#0C1E3C",
  navyMid: "#163258",
  green: "#00B96B",
  greenBg: "#E8FBF2",
  greenBorder: "rgba(0,185,107,0.22)",
  greenText: "#047857",
  amber: "#F59E0B",
  amberBg: "#FFFBEB",
  amberBorder: "rgba(245,158,11,0.22)",
  amberText: "#92400E",
  red: "#EF4444",
  redBg: "#FEF2F2",
  redBorder: "rgba(239,68,68,0.22)",
  redText: "#991B1B",
  offWhite: "#F7F5F1",
  mist: "#EDF0F5",
  white: "#FFFFFF",
  border: "#D5DCE8",
  text: "#1A2B4A",
  textSoft: "#5A6A82",
  textGhost: "#A0AABB",
  fontDisplay: "'Fraunces', Georgia, serif",
  fontBody: "'Plus Jakarta Sans', system-ui, sans-serif",
} as const;

// ── Theme ────────────────────────────────────────────────────────────────────

const theme = createTheme({
  // ── Palette ──
  palette: {
    primary: {
      main: tokens.navy,
      dark: tokens.navyMid,
      contrastText: tokens.white,
    },
    success: {
      main: tokens.green,
      light: tokens.greenBg,
      dark: tokens.greenText,
      contrastText: tokens.white,
    },
    warning: {
      main: tokens.amber,
      light: tokens.amberBg,
      dark: tokens.amberText,
      contrastText: tokens.white,
    },
    error: {
      main: tokens.red,
      light: tokens.redBg,
      dark: tokens.redText,
      contrastText: tokens.white,
    },
    background: {
      default: tokens.offWhite,
      paper: tokens.white,
    },
    text: {
      primary: tokens.text,
      secondary: tokens.textSoft,
      disabled: tokens.textGhost,
    },
    divider: tokens.border,
    // Custom palette extensions — accessed via theme.palette.evc.*
    // Requires module augmentation below
  },

  // ── Typography ──
  typography: {
    fontFamily: tokens.fontBody,
    // Display / heading style — Fraunces
    h1: {
      fontFamily: tokens.fontDisplay,
      fontWeight: 400,
      letterSpacing: "-0.01em",
    },
    h2: {
      fontFamily: tokens.fontDisplay,
      fontWeight: 400,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontFamily: tokens.fontDisplay,
      fontWeight: 400,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontFamily: tokens.fontDisplay,
      fontWeight: 400,
      fontStyle: "italic",
    },
    h5: { fontFamily: tokens.fontDisplay, fontWeight: 400 },
    h6: { fontFamily: tokens.fontDisplay, fontWeight: 400 },
    // Body / UI — Plus Jakarta Sans
    body1: {
      fontFamily: tokens.fontBody,
      fontSize: "0.95rem",
      lineHeight: 1.7,
    },
    body2: {
      fontFamily: tokens.fontBody,
      fontSize: "0.875rem",
      lineHeight: 1.65,
    },
    caption: {
      fontFamily: tokens.fontBody,
      fontSize: "0.72rem",
      color: tokens.textSoft,
    },
    overline: {
      fontFamily: tokens.fontBody,
      fontSize: "0.68rem",
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: tokens.textSoft,
    },
    button: {
      fontFamily: tokens.fontBody,
      fontWeight: 600,
      letterSpacing: "-0.01em",
      textTransform: "none",
    },
  },

  // ── Shape ──
  shape: { borderRadius: 10 }, // --r-md default

  // ── Shadows — map to sm / md / lg tokens ──
  //   shadows: [
  //     "none",
  //     "0 1px 3px rgba(12,30,60,0.06), 0 1px 2px rgba(12,30,60,0.04)", // 1 = sm
  //     "0 4px 14px rgba(12,30,60,0.09), 0 1px 3px rgba(12,30,60,0.05)", // 2 = md
  //     "0 12px 40px rgba(12,30,60,0.13), 0 2px 6px rgba(12,30,60,0.06)", // 3 = lg
  //     // MUI expects 25 shadow values; fill the rest with the largest
  //     ...Array(21).fill(
  //       "0 12px 40px rgba(12,30,60,0.13), 0 2px 6px rgba(12,30,60,0.06)",
  //     ),
  //   ],

  // ── Component overrides ──
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { -webkit-font-smoothing: antialiased; }
      `,
    },

    // ── Button global overrides ──
    MuiButton: {
      defaultProps: { disableRipple: false, disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontFamily: tokens.fontBody,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          textTransform: "none",
          transition: "all 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
          "&:disabled": { opacity: 0.45 },
        },
        sizeMedium: { padding: "9px 20px", fontSize: "0.875rem" },
        sizeSmall: {
          padding: "6px 14px",
          fontSize: "0.78rem",
          borderRadius: 6,
        },
        sizeLarge: {
          padding: "13px 28px",
          fontSize: "0.95rem",
          borderRadius: 14,
        },
      },
    },

    MuiLink: {
      styleOverrides: {
        root: {
          "&:visited&:hover": { color: tokens.mist },
          "&:hover": { color: tokens.mist },
        },
      },
    },

    // ── Input / TextField ──
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontFamily: tokens.fontBody,
          backgroundColor: tokens.mist,
          borderRadius: 10,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: tokens.border,
            borderWidth: "1.5px",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: tokens.border,
          },
          "&.Mui-focused": {
            backgroundColor: tokens.white,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: tokens.navy,
              borderWidth: "1.5px",
              boxShadow: `0 0 0 3px ${alpha(tokens.navy, 0.06)}`,
            },
          },
        },
        input: {
          padding: "11px 14px",
          fontSize: "0.92rem",
          color: tokens.text,
          "&::placeholder": { color: tokens.textGhost, opacity: 1 },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: tokens.fontBody,
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: tokens.textSoft,
        },
      },
    },

    // ── Paper / Card ──
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },

    // ── Chip ──
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: tokens.fontBody,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          height: "auto",
          borderRadius: 100,
        },
        label: {
          padding: "3px 9px",
          fontSize: "0.66rem",
          lineHeight: 1.4,
        },
        icon: { fontSize: "0.5rem" },
      },
    },

    // ── AppBar ──
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },

    // ── Toolbar ──
    MuiToolbar: {
      styleOverrides: {
        root: { minHeight: "64px !important", padding: "0 40px" },
      },
    },
  },
});

export default theme;
