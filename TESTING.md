# Testing Strategy

## Tooling

- **Test runner:** Vitest (jsdom environment)
- **Component testing:** React Testing Library
- **Dev playground:** Vite app in `/playground` for manual visual testing

## Architecture for Testability

Position calculation, smoothing/lerp math, and detection logic are extracted into pure functions. The side-effect layer (rAF loop, DOM mutation) is a thin shell around this pure core. This split makes the critical math trivially testable without needing a real browser.

## What to Test

### Unit Tests (pure functions)

- Position math: lerp interpolation, snap behavior, smoothing at various factors
- Cursor state resolution: global vs zone priority, fallback on zone exit
- Touch/pointer detection logic
- `prefers-reduced-motion` handling (smoothing disabled, custom cursor still renders)
- Preset config normalization and validation

### Integration Tests (React Testing Library)

- `<CursorProvider>` renders without crashing
- `useCursor()` changes the active cursor type in provider state
- `<CursorZone>` overrides global cursor on mouseenter, reverts on mouseleave
- Native cursor hiding (`cursor: none`) applied when custom cursor is active
- `hideNativeCursor: false` keeps native cursor visible
- `useHasCursor()` returns correct value based on pointer capability
- Unmounting components cleanly reverts cursor state

### What NOT to Test (in automated tests)

- Visual appearance of presets — verified in the playground
- Pixel-perfect cursor positioning in a real browser — jsdom can't meaningfully test this
- Animation frame timing — jsdom's rAF polyfill doesn't match real browser behavior

## Dev Playground

A minimal Vite React app in `/playground` that imports the library from source. Used for:

- Visual verification of all 6 presets (Dot, Ring, Spotlight, Emoji, Image, Text)
- Manual testing of smoothing/lerp feel
- Zone priority behavior (hovering in/out of zones)
- Touch device testing via browser DevTools device emulation
- Render escape hatch demos

## Future (not in v1)

- **E2E visual regression tests** with Playwright once the API stabilizes
- Screenshot comparison for presets across browsers
