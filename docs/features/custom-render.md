# Custom Render

`render` lets you provide any React node as the cursor.

Use it when presets are not enough.

```tsx
import { useCursor } from "@omriattiya/react-cursor";

function Page() {
  useCursor({
    render: (
      <div
        style={{
          transform: "translate(-50%, -50%)",
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "hotpink",
        }}
      />
    ),
  });

  return <main>...</main>;
}
```

## Type

```ts
type RenderCursor = {
  render: React.ReactNode;
  smoothing?: number;
  hideNativeCursor?: boolean;
};
```

## Notes

- The cursor layer is fixed and `pointer-events: none`.
- Add `translate(-50%, -50%)` if the visual should center on the pointer.
- Memoize complex rendered nodes to avoid unnecessary cursor updates.

