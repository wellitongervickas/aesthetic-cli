import { useState } from "react";
import { Box, useApp } from "ink";
import { Header } from "./components/header.js";
import { Menu } from "./components/menu.js";
import { StatusBar } from "./components/status-bar.js";
import { getModules } from "./core/registry.js";
import type { AnimationModule } from "./core/types.js";

export function App() {
  const { exit } = useApp();
  const [activeModule, setActiveModule] = useState<AnimationModule | null>(null);
  const modules = getModules();

  if (activeModule) {
    const Component = activeModule.component;
    return <Component onExit={() => setActiveModule(null)} />;
  }

  return (
    <Box flexDirection="column">
      <Header />
      <Menu modules={modules} onSelect={setActiveModule} onQuit={exit} />
      <StatusBar hint="↑/↓ Navigate  ⏎ Select  q Quit" />
    </Box>
  );
}
