import chalk from "chalk";

// Sprite character legend:
//   B = body fill        b = body border
//   S = sprinkle         . = transparent
//   E = ear              e = eye
//   F = face             M = mouth/nose
//   L = leg              T = tail
//   W = whisker          P = paw

const SPRINKLE_COLORS = [
  chalk.redBright,
  chalk.yellowBright,
  chalk.greenBright,
  chalk.cyanBright,
  chalk.whiteBright,
];

const COLOR_MAP: Record<string, (c: string, x: number, y: number, frame: number) => string> = {
  B: (_, _x, _y) => chalk.magentaBright("█"),
  b: (c) => chalk.magenta(c),
  S: (_, x, y, frame) => {
    const color = SPRINKLE_COLORS[(x + y + frame) % SPRINKLE_COLORS.length];
    return color("●");
  },
  E: () => chalk.gray("▲"),
  e: () => chalk.whiteBright("◕"),
  F: (c) => chalk.gray(c),
  M: () => chalk.magentaBright("ω"),
  W: (c) => chalk.gray(c),
  L: (c) => chalk.gray(c),
  T: (c) => chalk.gray(c),
  P: (c) => chalk.gray(c),
};

// 4 sprite frames: legs and tail animate
// Each frame: ~23 wide x 8 tall
export const SPRITE_FRAMES: string[][] = [
  // Frame 0: legs spread, tail up-curve
  [
    "...............E...E.",
    "..T.bbbbbbbbbbbFFeFeF",
    "..T.bSBBSBBSBBbFF.FF",
    ".T..bBBSBBSBBSbFMWWF",
    "....bSBBSBBSBBbFF.FF",
    "....bBBSBBSBBSb.....",
    "....bbbbbbbbbbb.....",
    "....L..L...L..L.....",
  ],
  // Frame 1: legs together, tail straight
  [
    "...............E...E.",
    "....bbbbbbbbbbbFFeFeF",
    ".T..bSBBSBBSBBbFF.FF",
    ".T..bBBSBBSBBSbFMWWF",
    "....bSBBSBBSBBbFF.FF",
    "....bBBSBBSBBSb.....",
    "....bbbbbbbbbbb.....",
    ".....L.L..L.L.......",
  ],
  // Frame 2: legs spread alt, tail down-curve
  [
    "...............E...E.",
    "....bbbbbbbbbbbFFeFeF",
    "....bSBBSBBSBBbFF.FF",
    ".T..bBBSBBSBBSbFMWWF",
    "..T.bSBBSBBSBBbFF.FF",
    "....bBBSBBSBBSb.....",
    "....bbbbbbbbbbb.....",
    "....L..L...L..L.....",
  ],
  // Frame 3: legs together alt, tail straight
  [
    "...............E...E.",
    "....bbbbbbbbbbbFFeFeF",
    ".T..bSBBSBBSBBbFF.FF",
    ".T..bBBSBBSBBSbFMWWF",
    "....bSBBSBBSBBbFF.FF",
    "....bBBSBBSBBSb.....",
    "....bbbbbbbbbbb.....",
    "......LL...LL.......",
  ],
];

export const SPRITE_HEIGHT = SPRITE_FRAMES[0].length;
export const SPRITE_WIDTH = SPRITE_FRAMES[0][0].length;

type Cell = string | null;

export function colorizeSprite(frame: string[], frameIndex: number): Cell[][] {
  const grid: Cell[][] = [];

  for (let y = 0; y < frame.length; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < frame[y].length; x++) {
      const ch = frame[y][x];
      if (ch === ".") {
        row.push(null);
      } else {
        const colorFn = COLOR_MAP[ch];
        row.push(colorFn ? colorFn(ch, x, y, frameIndex) : ch);
      }
    }
    grid.push(row);
  }

  return grid;
}
