import type { AnimationModule } from "../../core/types.js";
import { NyanCat } from "./nyancat.js";

export const nyancatModule: AnimationModule = {
  id: "nyancat",
  name: "Nyan Cat",
  description: "Rainbow-trailing cat with parallax stars and sparkle particles",
  component: NyanCat,
};
