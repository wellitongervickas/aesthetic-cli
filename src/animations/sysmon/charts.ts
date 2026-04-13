import chalk from "chalk";
import type { MetricsState } from "./metrics.js";
import {
  BRAILLE_BASE,
  BRAILLE_DOT_MAP,
  BAR_BLOCKS,
  SPARKLINE_CHARS,
  BOX,
  COLOR_THRESHOLDS,
  CHART_HEIGHT,
  MAX_CORES_DISPLAY,
} from "./constants.js";

type ColorFn = (s: string) => string;

function getColorFn(value: number): ColorFn {
  for (const t of COLOR_THRESHOLDS) {
    if (value <= t.max) {
      const base = chalk[t.color] as ColorFn;
      return t.bold ? (s: string) => chalk.bold(base(s)) : base;
    }
  }
  return chalk.red.bold;
}

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

function padRight(str: string, len: number): string {
  const visible = stripAnsi(str);
  return visible.length >= len ? str : str + " ".repeat(len - visible.length);
}

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

function plotDot(
  grid: number[][],
  dotX: number,
  dotY: number,
  chartWidth: number,
  chartHeight: number,
): void {
  const col = Math.floor(dotX / 2);
  const row = Math.floor(dotY / 4);
  if (col < 0 || col >= chartWidth || row < 0 || row >= chartHeight) return;
  grid[row][col] |= BRAILLE_DOT_MAP[dotY % 4][dotX % 2];
}

function plotLine(
  grid: number[][],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  chartWidth: number,
  chartHeight: number,
): void {
  let dx = Math.abs(x1 - x0);
  let dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;

  for (;;) {
    plotDot(grid, x0, y0, chartWidth, chartHeight);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

function renderBrailleChart(
  data: number[],
  width: number,
  height: number,
): string[] {
  if (data.length === 0) return Array.from({ length: height }, () => " ".repeat(width));

  const grid: number[][] = Array.from({ length: height }, () =>
    new Array(width).fill(0) as number[],
  );

  const dotW = width * 2;
  const dotH = height * 4;

  const points: { dx: number; dy: number; value: number }[] = [];
  for (let i = 0; i < data.length; i++) {
    const dx = Math.round((i / Math.max(data.length - 1, 1)) * (dotW - 1));
    const v = Math.max(0, Math.min(100, data[i]));
    const dy = dotH - 1 - Math.round((v / 100) * (dotH - 1));
    points.push({ dx, dy, value: v });
  }

  for (let i = 0; i < points.length - 1; i++) {
    plotLine(
      grid,
      points[i].dx,
      points[i].dy,
      points[i + 1].dx,
      points[i + 1].dy,
      width,
      height,
    );
  }
  if (points.length === 1) {
    plotDot(grid, points[0].dx, points[0].dy, width, height);
  }

  for (const p of points) {
    for (let y = p.dy + 1; y < dotH; y++) {
      plotDot(grid, p.dx, y, width, height);
    }
  }

  for (let i = 0; i < points.length - 1; i++) {
    const startDx = points[i].dx;
    const endDx = points[i + 1].dx;
    const startVal = points[i].value;
    const endVal = points[i + 1].value;

    for (let dx = startDx; dx <= endDx; dx++) {
      const t = endDx === startDx ? 0 : (dx - startDx) / (endDx - startDx);
      const v = startVal + (endVal - startVal) * t;
      const dy = dotH - 1 - Math.round((v / 100) * (dotH - 1));
      for (let y = dy; y < dotH; y++) {
        plotDot(grid, dx, y, width, height);
      }
    }
  }

  const colValues: number[] = new Array(width).fill(0) as number[];
  for (let col = 0; col < width; col++) {
    const dotX = col * 2;
    let closest = 0;
    let minDist = Infinity;
    for (const p of points) {
      const dist = Math.abs(p.dx - dotX);
      if (dist < minDist) {
        minDist = dist;
        closest = p.value;
      }
    }
    colValues[col] = closest;
  }

  return grid.map((row) =>
    row
      .map((bits, col) => {
        const ch = String.fromCharCode(BRAILLE_BASE + bits);
        if (bits === 0) return chalk.dim(ch);
        return getColorFn(colValues[col])(ch);
      })
      .join(""),
  );
}

function renderGauge(percentage: number, width: number): string {
  const clamped = Math.max(0, Math.min(100, percentage));
  const innerWidth = width - 2;
  const filled = (clamped / 100) * innerWidth;
  const fullBlocks = Math.floor(filled);
  const partialIdx = Math.round((filled - fullBlocks) * 8);
  const emptyCount = innerWidth - fullBlocks - (partialIdx > 0 ? 1 : 0);

  const colorFn = getColorFn(clamped);
  const bar =
    colorFn("\u2588".repeat(fullBlocks)) +
    (partialIdx > 0 ? colorFn(BAR_BLOCKS[partialIdx]) : "") +
    chalk.dim("\u2500").repeat(Math.max(0, emptyCount));

  return chalk.dim("[") + bar + chalk.dim("]");
}

function renderSparkline(data: number[], width: number): string {
  const slice = data.slice(-width);
  if (slice.length === 0) return chalk.dim("\u2500").repeat(width);

  const result = slice
    .map((v) => {
      const clamped = Math.max(0, Math.min(100, v));
      const idx = Math.min(7, Math.floor((clamped / 100) * 8));
      return getColorFn(clamped)(SPARKLINE_CHARS[idx]);
    })
    .join("");

  const pad = width - slice.length;
  return pad > 0 ? chalk.dim("\u2500").repeat(pad) + result : result;
}

function renderPerCoreBars(
  perCore: number[],
  innerWidth: number,
): string[] {
  const cores = perCore.slice(0, MAX_CORES_DISPLAY);
  const twoCol = innerWidth >= 60 && cores.length > 1;
  const colWidth = twoCol ? Math.floor(innerWidth / 2) - 1 : innerWidth;
  const barWidth = Math.max(8, colWidth - 14);
  const lines: string[] = [];

  const entries = cores.map((v, i) => {
    const label = `C${String(i).padStart(2, " ")} `;
    const gauge = renderGauge(v, barWidth);
    const pct = `${Math.round(v).toString().padStart(3, " ")}%`;
    return label + gauge + " " + getColorFn(v)(pct);
  });

  if (twoCol) {
    const half = Math.ceil(entries.length / 2);
    for (let i = 0; i < half; i++) {
      const left = padRight(entries[i], colWidth);
      const right = i + half < entries.length ? entries[i + half] : "";
      lines.push(left + "  " + right);
    }
  } else {
    for (const entry of entries) {
      lines.push(entry);
    }
  }

  return lines;
}

function renderMemoryPanel(
  memory: { percentage: number; usedBytes: number; totalBytes: number },
  width: number,
): string[] {
  const pct = memory.percentage.toFixed(1);
  const used = formatBytes(memory.usedBytes);
  const total = formatBytes(memory.totalBytes);
  const colorFn = getColorFn(memory.percentage);

  const lines: string[] = [];
  lines.push(
    chalk.bold.cyan(" Memory ") +
      colorFn(`${pct}%`) +
      chalk.dim(`  ${used} / ${total}`),
  );
  lines.push(" " + renderGauge(memory.percentage, Math.min(width - 2, 40)));
  return lines;
}

function renderGpuPanel(
  gpu: {
    available: boolean;
    name: string;
    utilizationPercent: number;
    temperatureC: number;
    memoryUsedMB: number;
    memoryTotalMB: number;
    memoryPercent: number;
  },
  gpuHistory: number[],
  width: number,
): string[] {
  const lines: string[] = [];

  if (!gpu.available) {
    lines.push(chalk.bold.cyan(" GPU ") + chalk.dim("N/A"));
    lines.push(chalk.dim("  No NVIDIA GPU detected"));
    lines.push(chalk.dim("  nvidia-smi not available"));
    lines.push("");
    return lines;
  }

  const utilColor = getColorFn(gpu.utilizationPercent);
  const tempColor = getColorFn(
    gpu.temperatureC > 80 ? 90 : gpu.temperatureC > 60 ? 50 : 20,
  );

  lines.push(
    chalk.bold.cyan(" GPU ") + chalk.dim(gpu.name.substring(0, width - 8)),
  );
  lines.push(
    "  " +
      utilColor(`${Math.round(gpu.utilizationPercent)}%`) +
      chalk.dim(" util") +
      "  " +
      tempColor(`${Math.round(gpu.temperatureC)}\u00B0C`),
  );
  lines.push(
    "  " +
      chalk.dim(
        `${Math.round(gpu.memoryUsedMB)} / ${Math.round(gpu.memoryTotalMB)} MB`,
      ) +
      " " +
      renderGauge(gpu.memoryPercent, Math.min(width - 26, 20)),
  );
  lines.push("  " + renderSparkline(gpuHistory, Math.min(width - 4, 36)));

  return lines;
}

function renderTopBorder(title: string, width: number): string {
  const inner = width - 2;
  const titleText = ` ${title} `;
  const remaining = inner - 3 - titleText.length;
  return chalk.dim(
    BOX.TL +
      BOX.H.repeat(3) +
      chalk.bold.cyan(titleText) +
      chalk.dim(BOX.H.repeat(Math.max(0, remaining))) +
      BOX.TR,
  );
}

function renderBottomBorder(width: number, midPos?: number): string {
  if (midPos !== undefined) {
    return chalk.dim(
      BOX.BL +
        BOX.H.repeat(midPos - 1) +
        BOX.BJ +
        BOX.H.repeat(width - midPos - 2) +
        BOX.BR,
    );
  }
  return chalk.dim(BOX.BL + BOX.H.repeat(width - 2) + BOX.BR);
}

function renderMidDivider(width: number, midPos: number): string {
  return chalk.dim(
    BOX.LJ +
      BOX.H.repeat(midPos - 1) +
      BOX.TJ +
      BOX.H.repeat(width - midPos - 2) +
      BOX.RJ,
  );
}

function wrapLine(content: string, width: number): string {
  const visible = stripAnsi(content);
  const pad = width - 2 - visible.length;
  return (
    chalk.dim(BOX.V) +
    content +
    (pad > 0 ? " ".repeat(pad) : "") +
    chalk.dim(BOX.V)
  );
}

function wrapSplit(
  left: string,
  right: string,
  width: number,
  midPos: number,
): string {
  const leftVisible = stripAnsi(left);
  const rightVisible = stripAnsi(right);
  const leftPad = midPos - 1 - leftVisible.length;
  const rightPad = width - midPos - 2 - rightVisible.length;
  return (
    chalk.dim(BOX.V) +
    left +
    (leftPad > 0 ? " ".repeat(leftPad) : "") +
    chalk.dim(BOX.V) +
    right +
    (rightPad > 0 ? " ".repeat(rightPad) : "") +
    chalk.dim(BOX.V)
  );
}

export function renderDashboard(
  state: MetricsState,
  cols: number,
): string[] {
  const latest = state.history[state.history.length - 1];
  if (!latest) return [chalk.dim("  Collecting metrics...")];

  const width = cols;
  const innerWidth = width - 2;
  const lines: string[] = [];

  lines.push(renderTopBorder("System Monitor", width));

  const cpuLabel =
    "  " +
    chalk.bold.cyan("CPU ") +
    getColorFn(latest.cpu.average)(
      `${latest.cpu.average.toFixed(1)}%`,
    ) +
    chalk.dim(`  ${latest.cpu.modelName.substring(0, innerWidth - 22)}`);
  lines.push(wrapLine(cpuLabel, width));

  const chartWidth = innerWidth - 4;
  const cpuHistory = state.history.map((m) => m.cpu.average);
  const chartLines = renderBrailleChart(cpuHistory, chartWidth, CHART_HEIGHT);
  for (const cl of chartLines) {
    lines.push(wrapLine("  " + cl, width));
  }

  lines.push(wrapLine("", width));

  const coreLines = renderPerCoreBars(latest.cpu.perCore, innerWidth - 2);
  for (const cl of coreLines) {
    lines.push(wrapLine(" " + cl, width));
  }

  const midPos = Math.floor(width / 2);
  lines.push(renderMidDivider(width, midPos));

  const leftWidth = midPos - 1;
  const rightWidth = width - midPos - 2;
  const memLines = renderMemoryPanel(latest.memory, leftWidth);
  const gpuLines = renderGpuPanel(
    latest.gpu,
    state.history.map((m) => m.gpu.utilizationPercent),
    rightWidth,
  );

  const panelHeight = Math.max(memLines.length, gpuLines.length);
  while (memLines.length < panelHeight) memLines.push("");
  while (gpuLines.length < panelHeight) gpuLines.push("");

  for (let i = 0; i < panelHeight; i++) {
    lines.push(wrapSplit(memLines[i], gpuLines[i], width, midPos));
  }

  lines.push(renderBottomBorder(width, midPos));

  return lines;
}
