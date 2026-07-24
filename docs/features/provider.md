# Provider

`CursorProvider` owns cursor state, renders the custom cursor layer, and optionally a Click Effect layer.

Use one provider around the app or subtree that needs managed cursors.

```tsx
import { CursorProvider } from "@omriattiya/react-cursor";

export function App() {
  return (
    <CursorProvider clickEffect={{ variant: "ripple" }}>
      <YourApp />
    </CursorProvider>
  );
}
```

## Type

```ts
interface CursorProviderProps {
  children?: React.ReactNode;
  clickEffect?: false | ClickEffectConfig;
}
```

## Notes

- `useCursor` and `CursorZone` must be used under this provider.
- Native cursors are applied to the document.
- Custom cursors render in a fixed, click-through layer.
- `clickEffect` is Provider-scoped (see [Click Effect](./click-effect.md)); omit or pass `false` to disable.
