# Cursor Zone

`CursorZone` overrides the global cursor while hovered.

Use it for buttons, cards, galleries, and other hover regions. Pass `clickEffect` to override Provider press feedback while the zone is hovered.

```tsx
import { CursorZone } from "@omriattiya/react-cursor";

<CursorZone
  cursor={{ preset: "hand", color: "#111827" }}
  clickEffect={{ variant: "ripple", color: "rgba(255, 122, 89, 0.75)" }}
>
  <button>Home</button>
</CursorZone>;
```

## Type

```ts
interface CursorZoneProps extends React.ComponentPropsWithoutRef<"div"> {
  cursor: CursorInput;
  clickEffect?: false | ClickEffectConfig;
}
```

## Notes

- Renders a `div`.
- Forwards normal `div` props.
- Nested zones work: the innermost hovered zone wins.
- On exit, it falls back to parent zone, then global cursor, then `auto`.
- `clickEffect` on a zone overrides the Provider while hovered. Omit to inherit; `false` disables.

