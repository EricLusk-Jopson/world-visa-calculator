/**
 * Shared MUI sx style objects for form inputs and selects.
 * Used by TripModal, TravelerModal, and any future modal forms.
 */

import { tokens } from "./theme";
import { FOCUS_RING_SHADOW, INPUT_BORDER_WIDTH } from "./constants";

/** Standard outlined input field styling. */
export const INPUT_SX = {
  "& .MuiOutlinedInput-root": {
    fontFamily: tokens.fontBody,
    fontSize: "0.85rem",
    bgcolor: tokens.mist,
    borderRadius: "10px",
    "& fieldset": { borderColor: tokens.border, borderWidth: INPUT_BORDER_WIDTH },
    "&:hover fieldset": { borderColor: tokens.navy },
    "&.Mui-focused fieldset": {
      borderColor: tokens.navy,
      borderWidth: INPUT_BORDER_WIDTH,
      boxShadow: FOCUS_RING_SHADOW,
    },
  },
  "& .MuiOutlinedInput-input": {
    py: "9px",
    px: "11px",
    color: tokens.text,
    "&::placeholder": { color: tokens.textGhost, opacity: 1 },
  },
} as const;

/** Error-state variant of INPUT_SX (red border, red background). */
export const INPUT_ERROR_SX = {
  "& .MuiOutlinedInput-root": {
    ...INPUT_SX["& .MuiOutlinedInput-root"],
    bgcolor: tokens.redBg,
    "& fieldset": { borderColor: tokens.red, borderWidth: INPUT_BORDER_WIDTH },
  },
} as const;

/** Standard outlined select styling (mirrors INPUT_SX). */
export const SELECT_BASE_SX = {
  fontFamily: tokens.fontBody,
  fontSize: "0.85rem",
  bgcolor: tokens.mist,
  borderRadius: "10px",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: tokens.border,
    borderWidth: INPUT_BORDER_WIDTH,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: tokens.navy },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: tokens.navy,
    borderWidth: INPUT_BORDER_WIDTH,
  },
  "& .MuiSelect-select": { py: "9px", px: "11px" },
} as const;
