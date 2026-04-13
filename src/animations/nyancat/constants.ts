// --- Timing ---
export const TICK_MS = 70;
export const SPRITE_FRAME_INTERVAL = 4;

// --- Viewport ---
export const MAX_COLS = 80;
export const MAX_ROWS = 24;

// --- Cat Position ---
export const CAT_X_RATIO = 0.62;
export const BOB_AMPLITUDE = 1.5;
export const BOB_FREQUENCY = 0.12;

// --- Rainbow ---
export const RAINBOW_BAND_COUNT = 6;
export const RAINBOW_WAVE_AMPLITUDE = 2;
export const RAINBOW_WAVE_FREQUENCY = 0.3;
export const RAINBOW_CHARS = ["-", "_"] as const;
export const RAINBOW_COLORS = [
  "redBright",
  "yellowBright",
  "yellow",
  "greenBright",
  "cyanBright",
  "magentaBright",
] as const;

// --- Star Field ---
export const STAR_COUNT = 35;
export const STAR_DEPTH_SPEEDS = [0.3, 0.6, 1.0] as const;
export const STAR_DEPTH_CHARS = [".", "+", "*"] as const;
export const STAR_TWINKLE_CHANCE = 0.03;

// --- Particles ---
export const PARTICLE_SPAWN_RATE = 2;
export const PARTICLE_MAX_LIFE = 12;
export const PARTICLE_MIN_LIFE = 5;
export const PARTICLE_SPEED = 1.5;
export const PARTICLE_CHARS = ["*", "+", ".", "`", "'"] as const;
