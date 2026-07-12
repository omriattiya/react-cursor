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
Optional lerp-based easing that makes the custom cursor trail behind the actual mouse position. Disabled by default. Automatically disabled when `prefers-reduced-motion` is active. Mutually exclusive with Physics on a given cursor style.
_Avoid_: Lerp, easing, animation (too generic)

**Physics**:
Optional spring-based tracking (stiffness, damping, mass) that makes the custom cursor follow the mouse with momentum and overshoot. Configured per cursor style, not globally. Mutually exclusive with Smoothing. Automatically disabled when `prefers-reduced-motion` is active.
_Avoid_: Spring, trailing (ambiguous with Trail)

**Magnetic Element**:
An element wrapped in `<Magnetic>` that attracts the custom cursor. Within `range` px of the element's bounding-box edge, the cursor position blends between the true mouse position and the element center; `strength` (0–1) is the maximum blend reached at the center (1 = full lock). Attraction affects only custom cursors — it is a no-op when a native cursor is active, and disabled entirely under `prefers-reduced-motion`. When multiple magnetic ranges overlap, the element with the nearest edge wins exclusively. Renders a `div` wrapper (like Cursor Zone); composes with Cursor Zone by nesting.
_Avoid_: Sticky element, snap target

**Trail**:
An optional per-style chain of segments behind the custom cursor (snake effect). Each segment tracks the previous one with a configured delay; spacing acts as a minimum gap so segments don't stack at rest. Segments are clones of the cursor visual, automatically scaled down and faded with depth. Configured as `trail: { count, spacing, delay }`. Not rendered under `prefers-reduced-motion`.
_Avoid_: Trailing (ambiguous with tracking lag), tail, ghost

**Velocity Effect**:
Optional per-style visual response to cursor speed: stretching (elongation along the movement axis) and/or rotation (facing the movement direction). Independent of the tracking model — works with Smoothing, Physics, or direct snapping. Automatically disabled when `prefers-reduced-motion` is active.
_Avoid_: Velocity stretch (only half the concept), distortion
