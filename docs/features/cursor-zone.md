# Cursor Zone

`CursorZone` overrides the global cursor while hovered.

Use it for buttons, cards, galleries, and other hover regions.

```tsx
import { CursorZone } from "@omriattiya/react-cursor";

<CursorZone cursor={{ preset: "text", content: "Open", color: "#fff" }}>
  <button>Project</button>
</CursorZone>;
```

## Type

```ts
interface CursorZoneProps extends React.ComponentPropsWithoutRef<"div"> {
  cursor: CursorInput;
}
```

## Notes

- Renders a `div`.
- Forwards normal `div` props.
- Nested zones work: the innermost hovered zone wins.
- On exit, it falls back to parent zone, then global cursor, then `auto`.

