# Presets

Presets are built-in custom cursors.

Use them when you want a styled cursor without building your own element.

```tsx
import { useCursor } from "@omriattiya/react-cursor";

function Page() {
  useCursor({ preset: "emoji", content: "🔥", size: 28 });

  return <main>...</main>;
}
```

## Type

```ts
type PresetName = "dot" | "ring" | "spotlight" | "emoji" | "image" | "text" | "pulse";

type PresetCursor = {
  preset: PresetName;
  size?: number;
  color?: string;
  content?: string;
  smoothing?: number;
  hideNativeCursor?: boolean;
};
```

## Presets

- `dot`: filled circle.
- `ring`: outlined circle.
- `spotlight`: radial gradient.
- `emoji`: emoji text.
- `image`: image URL from `content`.
- `text`: text label from `content`.
- `pulse`: dot with CSS ripple.

