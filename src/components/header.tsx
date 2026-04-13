import { Box, Text } from "ink";
import figlet from "figlet";
import chalk from "chalk";

export function Header() {
  const banner = figlet.textSync("AESTHETIC", {
    font: "Small",
    horizontalLayout: "default",
  });

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text>{chalk.cyan(banner)}</Text>
      <Text>{chalk.dim("  Terminal Animation Playground")}</Text>
    </Box>
  );
}
