import type { AnimationModule } from "./types.js";
import * as animations from "../animations/index.js";

export function getModules(): AnimationModule[] {
  return Object.values(animations);
}
