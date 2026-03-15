export const TRAVELER_PALETTE = [
  "#00B96B", // green — mirrors tokens.green
  "#6366F1", // indigo
  "#F59E0B", // amber
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
  "#8B5CF6", // violet
  "#06B6D4", // cyan
] as const;

export function getTravelerColor(index: number): string {
  return TRAVELER_PALETTE[index % TRAVELER_PALETTE.length];
}
