import { useRef, useState } from "react";
import { Box, Text, useInput } from "ink";
import chalk from "chalk";
import { useInterval } from "../../core/hooks.js";
import { createNyanState, tickNyan, renderNyan } from "./scene.js";
import { TICK_MS, MAX_COLS, MAX_ROWS } from "./constants.js";
import type { AnimationProps } from "../../core/types.js";

export function NyanCat({ onExit }: AnimationProps) {
  const cols = Math.min(process.stdout.columns || 80, MAX_COLS);
  const rows = Math.min((process.stdout.rows || 30) - 3, MAX_ROWS);

  const stateRef = useRef(createNyanState(cols, rows));
  const [, setFrame] = useState(0);

  useInterval(() => {
    tickNyan(stateRef.current);
    setFrame((f) => f + 1);
  }, TICK_MS);

  useInput((input, key) => {
    if (input === "q" || key.escape) {
      onExit();
    }
  });

  const lines = renderNyan(stateRef.current);

  return (
    <Box flexDirection="column">
      {lines.map((line, i) => (
        <Text key={i}>{line}</Text>
      ))}
      <Text>{chalk.dim("  Press q or Esc to return to menu")}</Text>
    </Box>
  );
}
