import type { ComponentType } from "react";

export interface AnimationProps {
  onExit: () => void;
}

export interface AnimationModule {
  id: string;
  name: string;
  description: string;
  component: ComponentType<AnimationProps>;
}
