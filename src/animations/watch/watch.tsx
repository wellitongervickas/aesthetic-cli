import { useState } from "react";
import { Box, Text, useInput } from "ink";
import chalk from "chalk";
import { useInterval } from "../../core/hooks.js";
import { renderTime } from "./digit.js";
import type { AnimationProps } from "../../core/types.js";

function getCurrentTime(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function getDateString(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function Watch({ onExit }: AnimationProps) {
  const [time, setTime] = useState(getCurrentTime);
  const [date, setDate] = useState(getDateString);

  useInterval(() => {
    setTime(getCurrentTime());
    setDate(getDateString());
  }, 1000);

  useInput((input, key) => {
    if (input === "q" || key.escape) {
      onExit();
    }
  });

  const rows = renderTime(time);

  return (
    <Box flexDirection="column" alignItems="center" paddingTop={1}>
      <Text>{chalk.dim("╔══════════════════════════════════════════════════════════════════════╗")}</Text>
      <Text>{""}</Text>
      {rows.map((row, i) => (
        <Text key={i}>{chalk.cyan.bold(row)}</Text>
      ))}
      <Text>{""}</Text>
      <Text>{chalk.white(date)}</Text>
      <Text>{""}</Text>
      <Text>{chalk.dim("╚══════════════════════════════════════════════════════════════════════╝")}</Text>
      <Text>{""}</Text>
      <Text>{chalk.dim("  Press q or Esc to return to menu")}</Text>
    </Box>
  );
}
