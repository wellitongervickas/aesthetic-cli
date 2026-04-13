import { useRef, useState } from "react";
import { Box, Text, useInput } from "ink";
import chalk from "chalk";
import { useInterval } from "../../core/hooks.js";
import { createRainState, tickRain, renderRain } from "./rain.js";
import { TICK_MS, MAX_COLS, MAX_ROWS } from "./constants.js";
import type { AnimationProps } from "../../core/types.js";

export function Matrix({ onExit }: AnimationProps) {
  const cols = Math.min(process.stdout.columns || 80, MAX_COLS);
  const rows = Math.min((process.stdout.rows || 30) - 3, MAX_ROWS);

  const stateRef = useRef(createRainState(cols, rows));
  const [, setFrame] = useState(0);

  useInterval(() => {
    tickRain(stateRef.current);
    setFrame((f) => f + 1);
  }, TICK_MS);

  useInput((input, key) => {
    if (input === "q" || key.escape) {
      onExit();
    }
  });

  const lines = renderRain(stateRef.current);

  return (
    <Box flexDirection="column">
      {lines.map((line, i) => (
        <Text key={i}>{line}</Text>
      ))}
      <Text>{chalk.green.dim("  Press q or Esc to return to menu")}</Text>
    </Box>
  );
}
