# Native Cursors

Native cursors use the browser CSS `cursor` property.

Use a string shorthand or explicit `{ native }` object.

```tsx
import { CursorZone, useCursor } from "@omriattiya/react-cursor";

function Page() {
  useCursor("crosshair");

  return (
    <CursorZone cursor={{ native: "not-allowed" }}>
      <button disabled>Disabled</button>
    </CursorZone>
  );
}
```

## Type

```ts
type NativeCursorValue = React.CSSProperties["cursor"];

interface NativeCursor {
  native: NativeCursorValue;
}
```

## Notes

- No custom element is rendered.
- Works with any valid CSS cursor value.
- Useful for loading, disabled, drag, and text states.

