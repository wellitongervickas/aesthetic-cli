import { useState } from "react";
import { Box, Text, useInput } from "ink";
import chalk from "chalk";
import { useInterval } from "../../core/hooks.js";
import { renderHelix } from "./helix.js";
import { ANIMATION_SPEED_MS, PHASE_STEP } from "./constants.js";
import type { AnimationProps } from "../../core/types.js";

export function Dna({ onExit }: AnimationProps) {
  const [phase, setPhase] = useState(0);

  useInterval(() => {
    setPhase((p) => p + PHASE_STEP);
  }, ANIMATION_SPEED_MS);

  useInput((input, key) => {
    if (input === "q" || key.escape) {
      onExit();
    }
  });

  const lines = renderHelix(phase);

  return (
    <Box flexDirection="column" alignItems="center" paddingTop={1}>
      <Text>{chalk.bold.cyan("  ⧬ ") + chalk.bold("DNA Helix") + chalk.bold.magenta(" ⧬")}</Text>
      <Text>{""}</Text>
      {lines.map((line, i) => (
        <Text key={i}>{line}</Text>
      ))}
      <Text>{""}</Text>
      <Text>{chalk.dim("  Press q or Esc to return to menu")}</Text>
    </Box>
  );
}
