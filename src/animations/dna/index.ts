import type { AnimationModule } from "../../core/types.js";
import { Dna } from "./dna.js";

export const dnaModule: AnimationModule = {
  id: "dna",
  name: "DNA Helix",
  description: "Rotating double helix with colored base pairs",
  component: Dna,
};
