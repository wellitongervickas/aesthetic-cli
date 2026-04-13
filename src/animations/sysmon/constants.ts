export const TICK_MS = 1000;
export const HISTORY_LENGTH = 60;
export const GPU_POLL_INTERVAL = 2;

export const MAX_COLS = 100;
export const MAX_ROWS = 24;
export const CHART_HEIGHT = 8;
export const MAX_CORES_DISPLAY = 16;

export const BRAILLE_BASE = 0x2800;
export const BRAILLE_DOT_MAP: readonly (readonly [number, number])[] = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
] as const;

export const BAR_BLOCKS = [
  " ",
  "\u2581",
  "\u2582",
  "\u2583",
  "\u2584",
  "\u2585",
  "\u2586",
  "\u2587",
  "\u2588",
] as const;

export const SPARKLINE_CHARS = [
  "\u2581",
  "\u2582",
  "\u2583",
  "\u2584",
  "\u2585",
  "\u2586",
  "\u2587",
  "\u2588",
] as const;

export const BOX = {
  TL: "\u250C",
  TR: "\u2510",
  BL: "\u2514",
  BR: "\u2518",
  H: "\u2500",
  V: "\u2502",
  LJ: "\u251C",
  RJ: "\u2524",
  TJ: "\u252C",
  BJ: "\u2534",
} as const;

export interface ColorThreshold {
  readonly max: number;
  readonly color: "green" | "yellow" | "redBright" | "red";
  readonly bold: boolean;
}

export const COLOR_THRESHOLDS: readonly ColorThreshold[] = [
  { max: 30, color: "green", bold: false },
  { max: 60, color: "yellow", bold: false },
  { max: 85, color: "redBright", bold: false },
  { max: 100, color: "red", bold: true },
] as const;
