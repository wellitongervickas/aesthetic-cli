import { useState } from "react";
import { Box, Text, useInput } from "ink";
import chalk from "chalk";
import type { AnimationModule } from "../core/types.js";

interface MenuProps {
  modules: AnimationModule[];
  onSelect: (mod: AnimationModule) => void;
  onQuit: () => void;
}

export function Menu({ modules, onSelect, onQuit }: MenuProps) {
  const [cursor, setCursor] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setCursor((prev) => (prev > 0 ? prev - 1 : modules.length - 1));
    } else if (key.downArrow) {
      setCursor((prev) => (prev < modules.length - 1 ? prev + 1 : 0));
    } else if (key.return) {
      modules[cursor] && onSelect(modules[cursor]);
    } else if (input === "q") {
      onQuit();
    }
  });

  return (
    <Box flexDirection="column" paddingLeft={2}>
      <Text>{chalk.bold("Select an animation:")}</Text>
      <Text>{""}</Text>
      {modules.map((mod, i) => {
        const isActive = i === cursor;
        const pointer = isActive ? chalk.cyan("❯") : " ";
        const name = isActive ? chalk.cyan.bold(mod.name) : mod.name;
        const desc = chalk.dim(mod.description);

        return (
          <Text key={mod.id}>
            {pointer} {name} {chalk.dim("—")} {desc}
          </Text>
        );
      })}
    </Box>
  );
}
