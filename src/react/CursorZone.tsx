import {
  useContext,
  useEffect,
  useId,
  type ComponentPropsWithoutRef,
  type MouseEvent,
} from "react";
import { CursorContext } from "./context";
import { normalizeCursor, type CursorInput } from "./normalize";

export interface CursorZoneProps extends ComponentPropsWithoutRef<"div"> {
  cursor: CursorInput;
}

/** A region whose cursor overrides the Global Cursor while hovered. */
export function CursorZone({ cursor, onMouseEnter, onMouseLeave, ...rest }: CursorZoneProps) {
  const registry = useContext(CursorContext);
  if (registry === null) {
    throw new Error("CursorZone must be used within a <CursorProvider>");
  }

  const id = useId();

  // If the zone unmounts while hovered, the mouseleave never fires; clean up here.
  useEffect(() => () => registry.leaveZone(id), [registry, id]);

  return (
    <div
      {...rest}
      onMouseEnter={(e: MouseEvent<HTMLDivElement>) => {
        registry.enterZone(id, normalizeCursor(cursor));
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e: MouseEvent<HTMLDivElement>) => {
        registry.leaveZone(id);
        onMouseLeave?.(e);
      }}
    />
  );
}
