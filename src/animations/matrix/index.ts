import type { AnimationModule } from "../../core/types.js";
import { Matrix } from "./matrix.js";

export const matrixModule: AnimationModule = {
  id: "matrix",
  name: "Matrix Rain",
  description: "Digital rain with katakana, mutation, and phosphor fade",
  component: Matrix,
};
