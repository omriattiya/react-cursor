# Global Cursor

`useCursor` sets the cursor while the calling component is mounted.

Use it for page-wide cursor behavior.

```tsx
import { useCursor } from "@omriattiya/react-cursor";

function Page() {
  useCursor({ preset: "ring", color: "#38bdf8", smoothing: 0.2 });

  return <main>...</main>;
}
```

## Type

```ts
function useCursor(input: CursorInput): void;

type CursorInput = NativeCursorValue | CursorStyle;
```

## Notes

- Last mounted global cursor wins.
- Unmount restores the previous global cursor.
- Changing the input updates the active cursor.

