import chalk from "chalk";
import {
  CHARSET,
  MIN_SPEED,
  MAX_SPEED,
  MIN_LENGTH,
  MAX_LENGTH,
  SPAWN_CHANCE,
  MUTATION_CHANCE,
  BRIGHTNESS_EXPONENT,
  PRESEED_RATIO,
} from "./constants.js";

// --- Types ---

interface Stream {
  y: number;
  speed: number;
  length: number;
  tick: number;
  chars: string[];
}

interface ColumnState {
  stream: Stream | null;
  cooldown: number;
}

export interface RainState {
  cols: number;
  rows: number;
  columns: ColumnState[];
  frame: number;
}

// --- Helpers ---

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChar(): string {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)];
}

function createStream(y: number, prefilledLength?: number): Stream {
  const length = randInt(MIN_LENGTH, MAX_LENGTH);
  const charCount = prefilledLength ?? 1;
  return {
    y,
    speed: randInt(MIN_SPEED, MAX_SPEED),
    length,
    tick: 0,
    chars: Array.from({ length: charCount }, randomChar),
  };
}

// --- Fixed 6-level palette (no per-char RGB calls) ---

const HEAD = (c: string) => chalk.whiteBright.bold(c);
const GREEN_BRIGHT = (c: string) => chalk.greenBright.bold(c);
const GREEN = (c: string) => chalk.green(c);
const GREEN_DIM = (c: string) => chalk.green.dim(c);
const DARK = (c: string) => chalk.gray(c);
const DARKEST = (c: string) => chalk.dim.gray(c);

function colorize(char: string, brightness: number, isHead: boolean): string {
  if (isHead) return HEAD(char);
  if (brightness > 0.75) return GREEN_BRIGHT(char);
  if (brightness > 0.5) return GREEN(char);
  if (brightness > 0.3) return GREEN_DIM(char);
  if (brightness > 0.15) return DARK(char);
  return DARKEST(char);
}

// --- State management ---

export function createRainState(cols: number, rows: number): RainState {
  const columns: ColumnState[] = Array.from({ length: cols }, () => {
    if (Math.random() < PRESEED_RATIO) {
      const y = randInt(4, rows - 1);
      const filled = Math.min(y + 1, randInt(MIN_LENGTH, MAX_LENGTH));
      return { stream: createStream(y, filled), cooldown: 0 };
    }
    return { stream: null, cooldown: randInt(0, 25) };
  });

  return { cols, rows, columns, frame: 0 };
}

export function tickRain(state: RainState): void {
  state.frame++;
  const isGlitchFrame = state.frame % 17 === 0;

  for (const col of state.columns) {
    if (col.stream) {
      const s = col.stream;
      s.tick++;

      if (s.tick >= s.speed) {
        s.tick = 0;
        s.y++;
        s.chars.unshift(randomChar());
        if (s.chars.length > s.length) {
          s.chars.pop();
        }
      }

      const mutationRate = isGlitchFrame ? MUTATION_CHANCE * 3 : MUTATION_CHANCE;
      for (let i = 1; i < s.chars.length; i++) {
        if (Math.random() < mutationRate) {
          s.chars[i] = randomChar();
        }
      }

      if (s.y - s.length > state.rows) {
        col.stream = null;
        col.cooldown = randInt(5, 35);
      }
    } else {
      col.cooldown--;
      if (col.cooldown <= 0 && Math.random() < SPAWN_CHANCE) {
        col.stream = createStream(0);
      }
    }
  }
}

export function renderRain(state: RainState): string[] {
  const lines: string[] = [];

  for (let row = 0; row < state.rows; row++) {
    const parts: string[] = [];

    for (let c = 0; c < state.cols; c++) {
      const s = state.columns[c].stream;
      if (!s) {
        parts.push(" ");
        continue;
      }

      const dist = s.y - row;

      if (dist < 0 || dist >= s.chars.length) {
        parts.push(" ");
        continue;
      }

      const char = s.chars[dist];
      const brightness = Math.pow(
        (s.length - dist) / s.length,
        BRIGHTNESS_EXPONENT,
      );

      if (brightness < 0.05) {
        parts.push(" ");
      } else {
        parts.push(colorize(char, brightness, dist === 0));
      }
    }

    lines.push(parts.join(""));
  }

  return lines;
}
