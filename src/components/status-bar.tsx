import { Box, Text } from "ink";
import chalk from "chalk";

interface StatusBarProps {
  hint: string;
}

export function StatusBar({ hint }: StatusBarProps) {
  return (
    <Box marginTop={1} paddingLeft={2}>
      <Text>{chalk.dim(hint)}</Text>
    </Box>
  );
}
