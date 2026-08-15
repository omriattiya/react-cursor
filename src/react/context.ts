import { createContext } from "react";
import type { ClickEffectConfig, CursorStyle } from "../core/types";

export interface CursorRegistry {
  setGlobal(id: string, style: CursorStyle): void;
  removeGlobal(id: string): void;
  enterZone(
    id: string,
    style: CursorStyle,
    clickEffect?: false | ClickEffectConfig,
  ): void;
  leaveZone(id: string): void;
}

export const CursorContext = createContext<CursorRegistry | null>(null);
