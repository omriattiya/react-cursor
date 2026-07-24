# Accessibility and SSR

Custom cursors are disabled when a fine pointer is not available.

Use `useHasCursor` when UI copy or controls should adapt.

```tsx
import { useHasCursor } from "@omriattiya/react-cursor";

function Hint() {
  const hasCursor = useHasCursor();

  return hasCursor ? <p>Hover cards to preview.</p> : <p>Tap cards to preview.</p>;
}
```

## Type

```ts
function useHasCursor(): boolean;
```

## Notes

- Returns `false` during SSR.
- Returns `true` for mouse or trackpad devices.
- Custom cursor layer is `aria-hidden`.
- Custom cursor and click-effect layers use `pointer-events: none`, so they never block clicks.
- Click effects are disabled when `prefers-reduced-motion: reduce` is active.

