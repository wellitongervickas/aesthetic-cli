import { useRef, useState } from "react";
import { Box, Text, useInput } from "ink";
import chalk from "chalk";
import { useInterval } from "../../core/hooks.js";
import { createMetricsState, collectMetrics } from "./metrics.js";
import { renderDashboard } from "./charts.js";
import { TICK_MS, MAX_COLS } from "./constants.js";
import type { AnimationProps } from "../../core/types.js";

export function SystemMonitor({ onExit }: AnimationProps) {
  const cols = Math.min(process.stdout.columns || 80, MAX_COLS);

  const stateRef = useRef(createMetricsState());
  const tickRef = useRef(0);
  const [, setFrame] = useState(0);

  useInterval(() => {
    tickRef.current++;
    collectMetrics(stateRef.current, tickRef.current);
    setFrame((f) => f + 1);
  }, TICK_MS);

  useInput((input, key) => {
    if (input === "q" || key.escape) {
      onExit();
    }
  });

  const lines = renderDashboard(stateRef.current, cols);

  return (
    <Box flexDirection="column">
      {lines.map((line, i) => (
        <Text key={i}>{line}</Text>
      ))}
      <Text>{chalk.dim("  Press q or Esc to return to menu")}</Text>
    </Box>
  );
}
