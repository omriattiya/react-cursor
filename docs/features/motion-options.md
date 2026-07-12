# Motion Options

Custom cursors support smoothing and native cursor visibility.

```tsx
import { useCursor } from "@omriattiya/react-cursor";

function Page() {
  useCursor({
    preset: "ring",
    smoothing: 0.2,
    hideNativeCursor: false,
  });

  return <main>...</main>;
}
```

## Type

```ts
type CustomCursorOptions = {
  smoothing?: number;
  hideNativeCursor?: boolean;
};
```

## Options

- `smoothing`: `0` snaps to the mouse. Values in `(0, 1]` trail behind it.
- `hideNativeCursor`: defaults to `true` for custom cursors. Set `false` to show both.

## Notes

- Smoothing is ignored when `prefers-reduced-motion` is active.
- Native cursors do not use these options.

