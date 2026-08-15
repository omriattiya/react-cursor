# react-cursor

[![npm version](https://img.shields.io/npm/v/%40omriattiya%2Freact-cursor)](https://www.npmjs.com/package/@omriattiya/react-cursor)
[![bundle size](https://img.shields.io/bundlephobia/minzip/%40omriattiya%2Freact-cursor)](https://bundlephobia.com/package/@omriattiya/react-cursor)
[![dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](https://www.npmjs.com/package/@omriattiya/react-cursor?activeTab=dependencies)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/omriattiya/react-cursor?style=social)](https://github.com/omriattiya/react-cursor/stargazers)

A unified API for native CSS cursors and custom-rendered cursors in React.

**[Live playground →](https://react-cursor-xi.vercel.app/)**

Detailed feature notes live in [`docs/features`](./docs/features/) for future playground docs.

Declare what the cursor should look like — a native CSS value, a built-in preset, or any React element — and the library takes care of the rest: mouse tracking, zone hovering, priority resolution, touch-device detection, and reduced-motion support.

```tsx
import { CursorProvider, CursorZone, useCursor } from "@omriattiya/react-cursor";

function App() {
  return (
    <CursorProvider>
      <Page />
    </CursorProvider>
  );
}

function Page() {
  // The Global Cursor: a black ring that follows the mouse everywhere
  useCursor({ preset: "ring", color: "#000", smoothing: 0.2 });

  return (
    <main>
      <h1>Hello</h1>

      {/* While hovered, this region overrides the Global Cursor */}
      <CursorZone cursor={{ preset: "emoji", content: "🔥" }}>
        <p>Hover me!</p>
      </CursorZone>
    </main>
  );
}
```

## Features

- **One API for everything** — native CSS cursors, shipped presets, and fully custom React elements all go through the same `useCursor` / `CursorZone` interface.
- **Zones with sane priority** — hovered zones override the global cursor; nested zones resolve innermost-first; everything falls back cleanly on unmount.
- **Smooth trailing** — optional lerp-based smoothing, driven by `requestAnimationFrame` and direct DOM transforms (no re-renders on mouse move).
- **Velocity effects** — stretch the cursor along its movement path as speed grows.
- **Trails** — a chain of segments that snakes behind the cursor, scaled and faded with depth.
- **Click effects** — Provider-level ripple or rays at the press point (works with native cursors too).
- **Accessible by default** — custom cursors are disabled on touch-only devices; smoothing, trails, velocity, and click effects respect `prefers-reduced-motion`; layers are `aria-hidden`.
- **SSR-safe** — no window access during render; server snapshots assume no fine pointer, so nothing custom is rendered until hydration.
- **Lightweight** — < 10 kb gzip, two components, two hooks, zero dependencies beyond React.

## Installation

```bash
# npm
npm install @omriattiya/react-cursor

# pnpm
pnpm add @omriattiya/react-cursor
```

Requires React 19 or later (`react` and `react-dom` are peer dependencies).

## Setup

Wrap your app (or the subtree that should use managed cursors) in a single `CursorProvider`. It owns all cursor state and renders the custom cursor element when one is active. Optionally pass `clickEffect` for press feedback at the pointer.

```tsx
import { CursorProvider } from "@omriattiya/react-cursor";

export function App() {
  return (
    <CursorProvider clickEffect={{ variant: "ripple", color: "rgba(255, 122, 89, 0.75)" }}>
      <YourApp />
    </CursorProvider>
  );
}
```

Both `useCursor` and `CursorZone` throw if used outside a provider.

## Core concepts

There are two levels of cursor, resolved in a fixed priority order:

1. **Cursor Zone** — an element-scoped region (`<CursorZone>`) whose cursor applies while the mouse is inside it. When zones are nested, the **innermost hovered zone wins**.
2. **Global Cursor** — the page-wide cursor, set with `useCursor()`. It applies whenever no zone is hovered. If several components set a global cursor at once, the **last one to mount wins**, and unmounting restores the previous one.

If neither is set, the cursor is the browser default (`auto`).

## Cursor styles

Everywhere a cursor is accepted (`useCursor(input)` and `<CursorZone cursor={input}>`), you can pass one of three shapes — or a plain string as shorthand for a native cursor.

### 1. Native cursors

Any value of the CSS `cursor` property. Applied to the document via CSS; nothing custom is rendered.

```tsx
useCursor("wait");                 // string shorthand
useCursor({ native: "crosshair" }); // explicit form

<CursorZone cursor="pointer">
  <Card />
</CursorZone>
```

### 2. Presets

Built-in custom cursors that replace the native cursor and follow the mouse.

```tsx
useCursor({ preset: "dot", size: 12, color: "tomato" });
useCursor({ preset: "ring", size: 40, color: "#333", smoothing: 0.25 });
useCursor({ preset: "spotlight", size: 300 });
useCursor({ preset: "emoji", content: "👆", size: 28 });
useCursor({ preset: "text", content: "View", color: "#fff" });
useCursor({ preset: "image", content: "/cursor.png", size: 32 });
useCursor({ preset: "pulse", size: 40, color: "#7c3aed" });
useCursor({ preset: "arrow", size: 24, color: "#111" });
useCursor({ preset: "hand", color: "#111" });
useCursor({ preset: "crosshair", color: "#111" });
useCursor({ preset: "wand", size: 28, color: "#c084fc" });
useCursor({ preset: "comet", size: 32, color: "#a78bfa", trail: { count: 6 } });
```

| Preset | Renders | `size` default | `color` default | `content` |
|---|---|---|---|---|
| `dot` | Filled circle | `10` | `#000` | — |
| `ring` | 2px outlined circle | `32` | `#000` | — |
| `spotlight` | Soft radial gradient | `200` | `rgba(255, 255, 255, 0.15)` | — |
| `emoji` | An emoji (font size = `size`) | `24` | — | The emoji string |
| `text` | A text label | `14` | `#000` | The label string |
| `image` | An `<img>` | `32` | — | The image URL |
| `pulse` | Dot with an animated expanding ripple ring | `32` | `#000` | — |
| `arrow` | Classic OS arrow (tip on the pointer) | `24` | `#000` | — |
| `hand` | Pointing hand (fingertip on the pointer) | `28` | `#000` | — |
| `crosshair` | Game-style FPS reticle | `28` | `#000` | — |
| `wand` | Magic wand with a twinkling star tip | `28` | `#c084fc` | — |
| `comet` | Soft bloom orb (great with trails / velocity) | `28` | `#a78bfa` | — |

Most presets are centered on the mouse position; `arrow`, `hand`, and `wand` use a tip hotspot like native cursors. All also accept `smoothing` and `hideNativeCursor` (see below).

The `pulse`, `wand`, and `comet` animations are pure CSS and pause automatically when `prefers-reduced-motion: reduce` is active.

### 3. Render (escape hatch)

Pass any React element to render it as the cursor. The element is placed inside a fixed-position, pointer-events-none layer that tracks the mouse; use `transform: translate(-50%, -50%)` on your element if you want it centered on the pointer.

```tsx
useCursor({
  render: (
    <div
      style={{
        transform: "translate(-50%, -50%)",
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: "hotpink",
        mixBlendMode: "difference",
      }}
    />
  ),
  smoothing: 0.15,
});
```

> **Tip:** define the rendered node outside the component (or memoize it) if you can. The hook tracks the node by identity, so a stable node avoids unnecessary registry updates.

### Common options for custom cursors

Both presets and render cursors accept:

- **`smoothing?: number`** — the fraction of the remaining distance covered per frame, so smaller values trail more (e.g. `0.15` is a loose, floaty follow). Defaults to `0.75` (a quick catch-up); `0` snaps the cursor to the mouse every frame. Automatically forced to `0` when the user has `prefers-reduced-motion` enabled.
- **`trail?: { count?, delay?, fadeDelay?, shrink? }`** — a segment chain behind the cursor; see [Motion](#motion-velocity-effects-and-trails).
- **`hideNativeCursor?: boolean`** — `true` by default: the native cursor is hidden everywhere (including on buttons and links, which normally set their own) so only the custom cursor is visible. Set to `false` to show both.

Presets additionally accept:

- **`velocity?: { stretch? }`** — speed-based stretch; see [Motion](#motion-velocity-effects-and-trails). Not available on custom `render` cursors (own motion inside your element).

```tsx
// Ring accent alongside the normal OS cursor
useCursor({ preset: "ring", smoothing: 0.3, hideNativeCursor: false });
```

## Motion: velocity effects and trails

### Velocity effects

Make a **preset** cursor react to how fast it's moving. Works with snapping or `smoothing`:

```tsx
useCursor({
  preset: "dot",
  size: 18,
  velocity: {
    stretch: 1.6, // elongate along the movement path, up to 1.6x at speed
  },
});
```

`stretch` preserves apparent area (the cross axis squashes as the movement axis stretches), so fast dots become comet-like slivers. Trail segments use the same stretch, each along its own path motion.

### Trails

Render a chain of segments that follows the cursor like a snake. Segments retrace the exact mouse path — each one replays where the cursor was a moment ago, cornering where the mouse cornered instead of cutting across. Segments are clones of the cursor visual, faded with depth and — unless `shrink: false` — scaled down with depth too:

```tsx
useCursor({
  preset: "dot",
  color: "tomato",
  trail: {
    count: 5,       // number of segments (default 3)
    delay: 100,     // lag (ms) each segment trails the one before it on the path
    fadeDelay: 200, // ms after each segment stops before that segment fades
    shrink: false,  // keep every segment full size (default true: smaller with depth)
  },
});
```

The trail emerges from the cursor: at rest all segments sit stacked on the cursor position, spread out only as far as the mouse actually travels, and slide back onto the cursor along the recorded path when it stops. Each segment fades on its own clock — `fadeDelay` ms after that segment stops moving (nearest settles first, so it fades first). The trail peels off the cursor again one segment at a time when the mouse moves.

## Cursor Zones

`CursorZone` renders a `div` (all standard `div` props are forwarded) and swaps in its cursor while hovered:

```tsx
<CursorZone
  cursor={{ preset: "hand", color: "#111827" }}
  clickEffect={{ variant: "ripple", color: "rgba(255, 122, 89, 0.75)" }}
>
  <button>Home</button>
</CursorZone>
```

Zones nest naturally — the innermost hovered zone wins. `clickEffect` on a zone overrides the Provider while hovered (`false` disables; omit to inherit).

```tsx
<CursorZone cursor={{ preset: "ring" }}>
  <section>
    ...
    <CursorZone cursor="not-allowed">
      <DisabledArea />
    </CursorZone>
  </section>
</CursorZone>
```

Leaving a zone (or unmounting it mid-hover) restores the next cursor in line: the enclosing zone, then the Global Cursor, then the browser default.

## Conditional and temporary cursors

`useCursor` applies its cursor for as long as the calling component is mounted, and cleans up on unmount. That makes state-driven cursors trivial — mount a small component instead of toggling values:

```tsx
function SaveButton() {
  const [saving, setSaving] = useState(false);

  return (
    <>
      {saving && <BusyCursor />}
      <button onClick={() => save().finally(() => setSaving(false))}>Save</button>
    </>
  );
}

function BusyCursor() {
  useCursor("progress");
  return null;
}
```

Changing the input object also works — the hook re-registers when any of the cursor's properties change.

## Touch devices and accessibility

- **Touch-only devices:** custom cursors (presets and render) are only shown when the device reports a fine pointer (`(pointer: fine)` media query). On touch-only devices nothing is rendered and the native cursor is left alone. You can read the same signal yourself with `useHasCursor()`.
- **Reduced motion:** when `prefers-reduced-motion: reduce` is active, `smoothing` is ignored (the cursor snaps directly to the mouse), velocity effects are not applied, trails are not rendered, and click effects are disabled. Leaving the page hides the cursor instantly instead of fading.
- **Pointer left the page:** the custom cursor (and its trail) fades out when the pointer leaves the document, and fades back in at the re-entry point.
- **Screen readers:** the custom cursor and click-effect layers are `aria-hidden` and `pointer-events: none`, so they never intercept clicks or appear in the accessibility tree.

```tsx
import { useHasCursor } from "@omriattiya/react-cursor";

function Hint() {
  const hasCursor = useHasCursor();
  return hasCursor ? <p>Hover the cards to preview</p> : <p>Tap a card to preview</p>;
}
```

## Server-side rendering

The library is SSR-safe: nothing touches `window` during render, and on the server `useHasCursor()` reports `false`, so no custom cursor markup is emitted. The custom cursor appears after hydration on devices with a mouse.

## API reference

### `<CursorProvider>`

Wraps the app, owns cursor state, applies the native CSS cursor to `document.documentElement`, and renders the custom cursor layer when the active cursor is a preset or render cursor. Optionally mounts a Click Effect layer for press feedback.

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | Your app. |
| `clickEffect` | `false \| ClickEffectConfig` | Optional press feedback at the pointer (`ripple` or `rays`). Omit or `false` to disable. |

### `useCursor(input)`

Sets the Global Cursor while the calling component is mounted; removes it on unmount. Last mounted caller wins.

| Parameter | Type | Description |
|---|---|---|
| `input` | `CursorInput` | A CSS cursor string, or a `{ native }`, `{ preset, ... }`, or `{ render, ... }` object. |

### `<CursorZone>`

A `div` whose cursor overrides the Global Cursor while hovered. Accepts all `div` props.

| Prop | Type | Description |
|---|---|---|
| `cursor` | `CursorInput` | The cursor to apply while the zone is hovered. |
| `clickEffect` | `false \| ClickEffectConfig` | Optional press feedback while hovered. Omit to inherit the enclosing zone / Provider; `false` disables. |
| `...rest` | `ComponentPropsWithoutRef<"div">` | Forwarded to the underlying `div`; `onMouseEnter` / `onMouseLeave` are composed, not overwritten. |

### `useHasCursor()`

Returns `true` when the device has a fine pointer (mouse/trackpad), `false` on touch-only devices and during SSR. Reactive — updates live if the pointer capability changes.

### Types

```ts
import type {
  CursorInput,          // string | CursorStyle — what useCursor/CursorZone accept
  CursorStyle,          // NativeCursor | PresetCursor | RenderCursor
  NativeCursor,         // { native: CSSProperties["cursor"] }
  PresetCursor,         // { preset: PresetName; size?; color?; content?; velocity?; ... }
  RenderCursor,         // { render: ReactNode; smoothing?; trail?; hideNativeCursor? }
  PresetName,           // "dot" | "ring" | "spotlight" | "emoji" | "image" | "text" | "pulse" | "arrow" | "hand" | "crosshair" | "wand" | "comet"
  PresetVisual,         // render a preset visual without the cursor layer (e.g. previews)
  NativeCursorValue,    // CSSProperties["cursor"]
  VelocityEffectConfig, // { stretch? }
  TrailConfig,          // { count?; delay?; fadeDelay?; shrink? }
  ClickEffectConfig,    // { variant: "ripple" | "rays"; color?; size?; duration? }
  ClickEffectVariant,   // "ripple" | "rays"
} from "@omriattiya/react-cursor";
```

`smoothing`, `trail`, and `hideNativeCursor` are accepted by both `PresetCursor` and `RenderCursor`. `velocity` is preset-only. `clickEffect` is accepted by `CursorProvider` and `CursorZone`.

## How it works

- `CursorProvider` keeps a registry of global cursors and currently hovered zones, and resolves the active cursor as: innermost hovered zone → last-mounted global cursor → `auto`.
- Native cursors are applied via `document.documentElement.style.cursor`. When a custom cursor hides the native one, a temporary `cursor: none !important` stylesheet is injected so UA styles on buttons/links can't leak through; it's removed as soon as the custom cursor deactivates.
- The custom cursor layer tracks the mouse with a single `mousemove` listener and moves via `transform: translate3d(...)` inside `requestAnimationFrame` — React never re-renders on mouse move. Velocity transforms and trail chains run inside that same frame loop as pure math over positions.

## Development

```bash
pnpm install
pnpm test           # vitest run
pnpm run typecheck  # tsc --noEmit
pnpm run build      # tsdown → dist/
```

## License

MIT © Omri Attiya
