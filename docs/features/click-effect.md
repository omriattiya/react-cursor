# Click Effect

Provider-level press feedback spawned at the pointer coordinates.

Independent of the active Cursor — works with Native Cursor and Custom Cursor. Variants: `ripple` (expanding ring) and `rays` (short lines radiating outward).

```tsx
<CursorProvider
  clickEffect={{
    variant: "ripple", // or "rays"
    color: "#ff7a59",  // optional — default rgba(0,0,0,0.35)
    size: 48,          // optional — max radius / ray length
  }}
>
  <App />
</CursorProvider>
```

## Type

```ts
type ClickEffectVariant = "ripple" | "rays";

interface ClickEffectConfig {
  variant: ClickEffectVariant;
  color?: string;
  size?: number;
}

// on CursorProviderProps:
clickEffect?: false | ClickEffectConfig;
```

## Notes

- Fires on primary press only (mouse, touch, pen).
- Instances stack up to 10; older ones drop under spam.
- Disabled when `prefers-reduced-motion` is active.
- Layer is `pointer-events: none` — never steals clicks.
- Not the same as the `pulse` preset's ambient ring animation.
