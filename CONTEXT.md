# React Cursor

A React library providing a unified API for native CSS cursors and custom-rendered cursors.

## Language

**Cursor**:
The mouse pointer visual, either a native OS/CSS cursor or a custom-rendered React element that follows the mouse.
_Avoid_: Pointer (ambiguous with CSS `pointer` value)

**Native Cursor**:
A cursor rendered by the browser via the CSS `cursor` property (e.g. `pointer`, `grab`, `crosshair`, `wait`).
_Avoid_: CSS cursor, system cursor, default cursor

**Custom Cursor**:
A React element rendered by the library that visually replaces the native cursor and tracks mouse position via direct DOM manipulation.
_Avoid_: Fake cursor, overlay cursor, virtual cursor

**Preset**:
A built-in custom cursor style shipped with the library (Dot, Ring, Spotlight, Emoji, Image, Text).
_Avoid_: Template, theme, skin

**Provider**:
The `<CursorProvider>` component that wraps the application, owns cursor state, and renders the custom cursor element.
_Avoid_: Context, wrapper

**Cursor Zone**:
An element-scoped region that overrides the global cursor when the mouse enters it. Takes priority over the global cursor; falls back to global on exit.
_Avoid_: Hover zone, cursor area, trigger zone

**Global Cursor**:
The cursor active across the entire page, set via `useCursor()`. Acts as the fallback when no Cursor Zone is hovered.
_Avoid_: Default cursor, base cursor

**Smoothing**:
Optional lerp-based easing that makes the custom cursor trail behind the actual mouse position. Defaults to 0.75 (a quick catch-up); 0 means snap. Automatically disabled when `prefers-reduced-motion` is active.
_Avoid_: Lerp, easing, animation (too generic), Physics, Spring

**Trail**:
An optional per-style chain of segments behind the custom cursor (snake effect). Segments replay the mouse's recorded path exactly: each one sits where the head was one more delay ago. The trail emerges from the cursor as it moves and slides back onto it when it stops — at rest all segments stack on the cursor position. Segments are clones of the cursor visual, faded with depth and scaled down with depth unless `shrink: false`. Once the trail has settled after the mouse stops, the stacked tail dissolves segment by segment (deepest first, one fade delay apart); it reappears on the next movement. Configured as `trail: { count, delay, fadeDelay, shrink }` (count defaults to 3). Not rendered under `prefers-reduced-motion`.
_Avoid_: Trailing (ambiguous with tracking lag), tail, ghost

**Velocity Effect**:
Optional per-style visual response to cursor speed: stretching (elongation along the movement axis, with the cross axis squashed to preserve apparent area). Independent of tracking — works with Smoothing or direct snapping. Automatically disabled when `prefers-reduced-motion` is active.
_Avoid_: Distortion

**Click Effect**:
An optional family of transient visuals spawned at the primary press point when the user presses — not a reaction of the Custom Cursor visual itself. Configured on the Provider and active regardless of which Cursor is showing (including Native Cursor). v1 variants: `ripple` (expanding ring) and `rays` (short lines radiating outward). Distinct from the `pulse` Preset's ambient ring animation. Automatically disabled when `prefers-reduced-motion` is active.
_Avoid_: Ripple (as umbrella — ambiguous with `pulse`), Burst (as umbrella), Impact, Click feedback, Particle effect
