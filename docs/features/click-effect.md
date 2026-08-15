# Click Effect

Press feedback spawned at the pointer coordinates.

Set it on `CursorProvider` for the whole tree, or on `CursorZone` to override while that zone is hovered. Independent of the active Cursor — works with Native Cursor and Custom Cursor. Variants: `ripple` (ring that expands then shrinks) and `rays` (short firework sparks that burst out then retract). No opacity fade — transparency comes only from `color` alpha.

```tsx
<CursorProvider
  clickEffect={{
    variant: "ripple", // or "rays"
    color: "rgba(255, 122, 89, 0.75)",  // optional — any CSS color incl. alpha; default #000
    size: 48,          // optional — max radius / ray length
    duration: 450,     // optional — animation ms
  }}
>
  <CursorZone
    cursor={{ preset: "hand" }}
    clickEffect={{ variant: "ripple", color: "rgba(255, 122, 89, 0.75)" }}
  >
    <button>Home</button>
  </CursorZone>
</CursorProvider>
```

## Type

```ts
type ClickEffectVariant = "ripple" | "rays";

interface ClickEffectConfig {
  variant: ClickEffectVariant;
  color?: string;
  size?: number;
  duration?: number;
}

// on CursorProviderProps and CursorZoneProps:
clickEffect?: false | ClickEffectConfig;
```

## Notes

- Fires on primary press only (mouse, touch, pen).
- Instances stack up to 10; older ones drop under spam.
- Disabled when `prefers-reduced-motion` is active.
- Layer is `pointer-events: none` — never steals clicks.
- Not the same as the `pulse` preset's ambient ring animation.
- Zone `clickEffect` wins while hovered (innermost explicit value). Omit to inherit; `false` disables.
