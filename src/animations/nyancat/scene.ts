import chalk from "chalk";
import {
  CAT_X_RATIO,
  BOB_AMPLITUDE,
  BOB_FREQUENCY,
  SPRITE_FRAME_INTERVAL,
  RAINBOW_BAND_COUNT,
  RAINBOW_WAVE_AMPLITUDE,
  RAINBOW_WAVE_FREQUENCY,
  RAINBOW_CHARS,
  RAINBOW_COLORS,
  STAR_COUNT,
  STAR_DEPTH_SPEEDS,
  STAR_DEPTH_CHARS,
  STAR_TWINKLE_CHANCE,
  PARTICLE_SPAWN_RATE,
  PARTICLE_MAX_LIFE,
  PARTICLE_MIN_LIFE,
  PARTICLE_SPEED,
  PARTICLE_CHARS,
} from "./constants.js";
import {
  SPRITE_FRAMES,
  SPRITE_HEIGHT,
  SPRITE_WIDTH,
  colorizeSprite,
} from "./sprites.js";

// --- Types ---

type Cell = string | null;
type Grid = Cell[][];

interface Star {
  x: number;
  y: number;
  depth: number;
  twinkle: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  char: string;
}

export interface NyanState {
  cols: number;
  rows: number;
  frame: number;
  stars: Star[];
  particles: Particle[];
  spriteFrame: number;
}

// --- Helpers ---

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function createGrid(rows: number, cols: number): Grid {
  return Array.from({ length: rows }, () => new Array<Cell>(cols).fill(null));
}

function getCatPosition(state: NyanState): { x: number; y: number } {
  const x = Math.floor(state.cols * CAT_X_RATIO);
  const y = Math.round(
    state.rows / 2 -
      SPRITE_HEIGHT / 2 +
      BOB_AMPLITUDE * Math.sin(state.frame * BOB_FREQUENCY),
  );
  return { x, y };
}

// --- Star color palette ---

const STAR_COLORS = [
  [chalk.gray, chalk.dim.gray],
  [chalk.white, chalk.gray],
  [chalk.whiteBright, chalk.white],
] as const;

// --- Rainbow color palette ---

const RAINBOW_CHALK = RAINBOW_COLORS.map(
  (name) => chalk[name] as (s: string) => string,
);

// --- Particle color palette ---

const PARTICLE_BRIGHT = (c: string) => chalk.whiteBright(c);
const PARTICLE_MID = (c: string) => chalk.white(c);
const PARTICLE_DIM = (c: string) => chalk.gray(c);

// --- State management ---

export function createNyanState(cols: number, rows: number): NyanState {
  const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * cols,
    y: randInt(0, rows - 1),
    depth: randInt(0, 2),
    twinkle: 0,
  }));

  return { cols, rows, frame: 0, stars, particles: [], spriteFrame: 0 };
}

export function tickNyan(state: NyanState): void {
  state.frame++;

  // Advance sprite frame
  if (state.frame % SPRITE_FRAME_INTERVAL === 0) {
    state.spriteFrame = (state.spriteFrame + 1) % SPRITE_FRAMES.length;
  }

  // Update stars
  for (const star of state.stars) {
    star.x -= STAR_DEPTH_SPEEDS[star.depth];

    if (star.x < -1) {
      star.x = state.cols + randFloat(0, 3);
      star.y = randInt(0, state.rows - 1);
    }

    if (Math.random() < STAR_TWINKLE_CHANCE) {
      star.twinkle = star.twinkle === 0 ? 1 : 0;
    }
  }

  // Update particles
  state.particles = state.particles.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    return p.life > 0;
  });

  // Spawn new particles
  const cat = getCatPosition(state);
  const spawnX = cat.x;
  const spawnYCenter = cat.y + SPRITE_HEIGHT / 2;

  for (let i = 0; i < PARTICLE_SPAWN_RATE; i++) {
    const maxLife = randInt(PARTICLE_MIN_LIFE, PARTICLE_MAX_LIFE);
    state.particles.push({
      x: spawnX + randFloat(-2, 2),
      y: spawnYCenter + randFloat(-3, 3),
      vx: randFloat(-PARTICLE_SPEED, -0.2),
      vy: randFloat(-PARTICLE_SPEED * 0.5, PARTICLE_SPEED * 0.5),
      life: maxLife,
      maxLife,
      char: PARTICLE_CHARS[randInt(0, PARTICLE_CHARS.length - 1)],
    });
  }
}

// --- Layer generators ---

function generateStarLayer(state: NyanState): Grid {
  const grid = createGrid(state.rows, state.cols);

  for (const star of state.stars) {
    const col = Math.floor(star.x);
    if (col < 0 || col >= state.cols || star.y < 0 || star.y >= state.rows) {
      continue;
    }

    const [normal, dim] = STAR_COLORS[star.depth];
    const colorFn = star.twinkle ? dim : normal;
    grid[star.y][col] = colorFn(STAR_DEPTH_CHARS[star.depth]);
  }

  return grid;
}

function generateRainbowLayer(state: NyanState): Grid {
  const grid = createGrid(state.rows, state.cols);
  const cat = getCatPosition(state);

  // Rainbow bands align with the cat body (skip ear row at top)
  const rainbowTop = cat.y + 1;

  for (let b = 0; b < RAINBOW_BAND_COUNT; b++) {
    const row = rainbowTop + b;
    if (row < 0 || row >= state.rows) continue;

    const rightEdge =
      cat.x +
      Math.round(
        RAINBOW_WAVE_AMPLITUDE *
          Math.sin(state.frame * RAINBOW_WAVE_FREQUENCY + b * 0.8),
      );

    const colorFn = RAINBOW_CHALK[b];
    for (let col = 0; col < Math.min(rightEdge, state.cols); col++) {
      const ch = RAINBOW_CHARS[(col + state.frame) % RAINBOW_CHARS.length];
      grid[row][col] = colorFn(ch);
    }
  }

  return grid;
}

function generateSpriteLayer(state: NyanState): Grid {
  const grid = createGrid(state.rows, state.cols);
  const cat = getCatPosition(state);
  const sprite = colorizeSprite(
    SPRITE_FRAMES[state.spriteFrame],
    state.frame,
  );

  for (let sy = 0; sy < sprite.length; sy++) {
    const gy = cat.y + sy;
    if (gy < 0 || gy >= state.rows) continue;

    for (let sx = 0; sx < sprite[sy].length; sx++) {
      const gx = cat.x + sx;
      if (gx < 0 || gx >= state.cols) continue;

      const cell = sprite[sy][sx];
      if (cell !== null) {
        grid[gy][gx] = cell;
      }
    }
  }

  return grid;
}

function generateParticleLayer(state: NyanState): Grid {
  const grid = createGrid(state.rows, state.cols);

  for (const p of state.particles) {
    const col = Math.round(p.x);
    const row = Math.round(p.y);
    if (row < 0 || row >= state.rows || col < 0 || col >= state.cols) continue;

    const fade = p.life / p.maxLife;
    const colorFn =
      fade > 0.6 ? PARTICLE_BRIGHT : fade > 0.3 ? PARTICLE_MID : PARTICLE_DIM;
    grid[row][col] = colorFn(p.char);
  }

  return grid;
}

// --- Compositor ---

function compositeLayers(layers: Grid[], rows: number, cols: number): Grid {
  const result = createGrid(rows, cols);

  for (const layer of layers) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = layer[r]?.[c];
        if (cell != null) {
          result[r][c] = cell;
        }
      }
    }
  }

  return result;
}

// --- Render ---

export function renderNyan(state: NyanState): string[] {
  const layers = [
    generateStarLayer(state),
    generateRainbowLayer(state),
    generateSpriteLayer(state),
    generateParticleLayer(state),
  ];

  const composited = compositeLayers(layers, state.rows, state.cols);

  return composited.map((row) => row.map((cell) => cell ?? " ").join(""));
}
