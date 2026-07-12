# Provider

`CursorProvider` owns cursor state and renders the custom cursor layer.

Use one provider around the app or subtree that needs managed cursors.

```tsx
import { CursorProvider } from "@omriattiya/react-cursor";

export function App() {
  return (
    <CursorProvider>
      <YourApp />
    </CursorProvider>
  );
}
```

## Type

```ts
interface CursorProviderProps {
  children?: React.ReactNode;
}
```

## Notes

- `useCursor` and `CursorZone` must be used under this provider.
- Native cursors are applied to the document.
- Custom cursors render in a fixed, click-through layer.

