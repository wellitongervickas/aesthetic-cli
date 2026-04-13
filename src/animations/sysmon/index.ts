import type { AnimationModule } from "../../core/types.js";
import { SystemMonitor } from "./sysmon.js";

export const sysmonModule: AnimationModule = {
  id: "sysmon",
  name: "System Monitor",
  description: "Real-time CPU, Memory & GPU dashboard with braille charts",
  component: SystemMonitor,
};
