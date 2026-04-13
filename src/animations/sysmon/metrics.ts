import os from "node:os";
import { execSync } from "node:child_process";
import { HISTORY_LENGTH, GPU_POLL_INTERVAL } from "./constants.js";

interface CpuSnapshot {
  perCore: { idle: number; total: number }[];
}

export interface CpuMetrics {
  perCore: number[];
  average: number;
  modelName: string;
}

export interface MemoryMetrics {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  percentage: number;
}

export interface GpuMetrics {
  available: boolean;
  name: string;
  utilizationPercent: number;
  memoryUsedMB: number;
  memoryTotalMB: number;
  memoryPercent: number;
  temperatureC: number;
}

export interface SystemMetrics {
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  gpu: GpuMetrics;
}

export interface MetricsState {
  history: SystemMetrics[];
  prevCpuSnapshot: CpuSnapshot | null;
  gpuAvailable: boolean | null;
  cachedGpu: GpuMetrics;
}

const GPU_UNAVAILABLE: GpuMetrics = {
  available: false,
  name: "N/A",
  utilizationPercent: 0,
  memoryUsedMB: 0,
  memoryTotalMB: 0,
  memoryPercent: 0,
  temperatureC: 0,
};

function takeCpuSnapshot(): CpuSnapshot {
  return {
    perCore: os.cpus().map((cpu) => {
      const t = cpu.times;
      const total = t.user + t.nice + t.sys + t.idle + t.irq;
      return { idle: t.idle, total };
    }),
  };
}

function computeCpu(prev: CpuSnapshot, curr: CpuSnapshot): number[] {
  return prev.perCore.map((p, i) => {
    const c = curr.perCore[i];
    const idleDelta = c.idle - p.idle;
    const totalDelta = c.total - p.total;
    if (totalDelta === 0) return 0;
    return Math.max(0, Math.min(100, (1 - idleDelta / totalDelta) * 100));
  });
}

function collectMemory(): MemoryMetrics {
  const totalBytes = os.totalmem();
  const freeBytes = os.freemem();
  const usedBytes = totalBytes - freeBytes;
  return {
    totalBytes,
    usedBytes,
    freeBytes,
    percentage: (usedBytes / totalBytes) * 100,
  };
}

function collectGpu(state: MetricsState): GpuMetrics {
  if (state.gpuAvailable === false) return GPU_UNAVAILABLE;

  try {
    const raw = execSync(
      "nvidia-smi --query-gpu=utilization.gpu,utilization.memory,temperature.gpu,memory.used,memory.total,name --format=csv,noheader,nounits",
      { encoding: "utf8", timeout: 2000, stdio: ["pipe", "pipe", "pipe"] },
    ).trim();

    const parts = raw.split(",").map((s) => s.trim());
    state.gpuAvailable = true;

    const memUsed = parseFloat(parts[3]);
    const memTotal = parseFloat(parts[4]);
    return {
      available: true,
      utilizationPercent: parseFloat(parts[0]) || 0,
      memoryPercent: memTotal > 0 ? (memUsed / memTotal) * 100 : 0,
      temperatureC: parseFloat(parts[2]) || 0,
      memoryUsedMB: memUsed || 0,
      memoryTotalMB: memTotal || 0,
      name: parts[5] || "NVIDIA GPU",
    };
  } catch {
    state.gpuAvailable = false;
    return GPU_UNAVAILABLE;
  }
}

export function createMetricsState(): MetricsState {
  return {
    history: [],
    prevCpuSnapshot: null,
    gpuAvailable: null,
    cachedGpu: GPU_UNAVAILABLE,
  };
}

export function collectMetrics(
  state: MetricsState,
  tickCount: number,
): SystemMetrics {
  const currentSnapshot = takeCpuSnapshot();
  const cpuModel = os.cpus()[0]?.model ?? "Unknown CPU";

  let perCore: number[];
  if (state.prevCpuSnapshot) {
    perCore = computeCpu(state.prevCpuSnapshot, currentSnapshot);
  } else {
    perCore = new Array(currentSnapshot.perCore.length).fill(0) as number[];
  }
  state.prevCpuSnapshot = currentSnapshot;

  const average = perCore.reduce((a, b) => a + b, 0) / perCore.length;
  const cpu: CpuMetrics = { perCore, average, modelName: cpuModel };

  const memory = collectMemory();

  let gpu: GpuMetrics;
  if (tickCount % GPU_POLL_INTERVAL === 0 || state.history.length === 0) {
    gpu = collectGpu(state);
    state.cachedGpu = gpu;
  } else {
    gpu = state.cachedGpu;
  }

  const metrics: SystemMetrics = { cpu, memory, gpu };

  state.history.push(metrics);
  if (state.history.length > HISTORY_LENGTH) {
    state.history.shift();
  }

  return metrics;
}
