import type { AnimationModule } from "../../core/types.js";
import { Watch } from "./watch.js";

export const watchModule: AnimationModule = {
  id: "watch",
  name: "Watch",
  description: "Live clock with ASCII art digits",
  component: Watch,
};
