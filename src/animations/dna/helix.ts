import chalk from "chalk";
import {
  BASE_PAIRS,
  HELIX_WIDTH,
  HELIX_CENTER,
  HELIX_AMPLITUDE,
  HELIX_ROWS,
  HELIX_FREQUENCY,
} from "./constants.js";

const PAIR_COLORS = [
  chalk.red,
  chalk.yellow,
  chalk.green,
  chalk.magenta,
];

const STRAND_LEFT = chalk.cyan;
const STRAND_RIGHT = chalk.magenta;
const RUNG_COLOR = chalk.dim;

export function renderHelix(phase: number): string[] {
  const lines: string[] = [];

  for (let row = 0; row < HELIX_ROWS; row++) {
    const angle = row * HELIX_FREQUENCY + phase;
    const x1 = Math.round(HELIX_CENTER + HELIX_AMPLITUDE * Math.sin(angle));
    const x2 = Math.round(HELIX_CENTER + HELIX_AMPLITUDE * Math.sin(angle + Math.PI));

    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const gap = right - left;

    const chars: string[] = new Array(HELIX_WIDTH + 1).fill(" ");

    if (gap <= 2) {
      // Strands crossing — show base pair label at center
      const pairIndex = (row + Math.floor(phase)) % BASE_PAIRS.length;
      const pair = BASE_PAIRS[pairIndex];
      const colorFn = PAIR_COLORS[pairIndex];
      const mid = Math.round((left + right) / 2);
      const pairStart = mid - 1;
      const rendered = colorFn.bold(pair);
      chars[left] = x1 < x2 ? STRAND_LEFT("╳") : STRAND_RIGHT("╳");
      if (pairStart >= 0 && pairStart + 2 <= HELIX_WIDTH) {
        chars[pairStart] = rendered;
        chars[pairStart + 1] = "";
        chars[pairStart + 2] = "";
      }
    } else {
      // Strands apart — draw rungs between them
      chars[left] = x1 < x2 ? STRAND_LEFT("●") : STRAND_RIGHT("●");
      chars[right] = x1 > x2 ? STRAND_LEFT("●") : STRAND_RIGHT("●");

      if (gap > 4 && row % 2 === 0) {
        const pairIndex = (row + Math.floor(phase)) % BASE_PAIRS.length;
        const pair = BASE_PAIRS[pairIndex];
        const colorFn = PAIR_COLORS[pairIndex];
        const mid = Math.round((left + right) / 2);

        for (let x = left + 1; x < right; x++) {
          if (x >= mid - 1 && x <= mid + 1) continue;
          chars[x] = RUNG_COLOR("─");
        }

        const pairStart = mid - 1;
        if (pairStart >= 0 && pairStart + 2 <= HELIX_WIDTH) {
          chars[pairStart] = colorFn.bold(pair);
          chars[pairStart + 1] = "";
          chars[pairStart + 2] = "";
        }
      } else if (gap > 2) {
        for (let x = left + 1; x < right; x++) {
          chars[x] = RUNG_COLOR("·");
        }
      }
    }

    lines.push(chars.join(""));
  }

  return lines;
}
