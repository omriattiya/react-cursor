# react-cursor

A unified API for native CSS cursors and custom-rendered cursors in React.

Declare what the cursor should look like — a native CSS value, a built-in preset, or any React element — and the library takes care of the rest: mouse tracking, zone hovering, priority resolution, touch-device detection, and reduced-motion support.

```tsx
import { CursorProvider, CursorZone, useCursor } from "@omri/react-cursor";

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
- **Accessible by default** — custom cursors are disabled on touch-only devices, smoothing is disabled when `prefers-reduced-motion` is active, and the cursor layer is `aria-hidden`.
- **SSR-safe** — no window access during render; server snapshots assume no fine pointer, so nothing custom is rendered until hydration.
- **Tiny surface** — two components, two hooks, zero dependencies beyond React.

## Installation

```bash
# npm
npm install @omri/react-cursor

# pnpm
pnpm add @omri/react-cursor
```

Requires React 19 or later (`react` and `react-dom` are peer dependencies).

## Setup

Wrap your app (or the subtree that should use managed cursors) in a single `CursorProvider`. It owns all cursor state and renders the custom cursor element when one is active.

```tsx
import { CursorProvider } from "@omri/react-cursor";

export function App() {
  return (
    <CursorProvider>
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
```

| Preset | Renders | `size` default | `color` default | `content` |
|---|---|---|---|---|
| `dot` | Filled circle | `10` | `#000` | — |
| `ring` | 2px outlined circle | `32` | `#000` | — |
| `spotlight` | Soft radial gradient | `200` | `rgba(255, 255, 255, 0.15)` | — |
| `emoji` | An emoji (font size = `size`) | `24` | — | The emoji string |
| `text` | A text label | `14` | `#000` | The label string |
| `image` | An `<img>` | `32` | — | The image URL |

All presets are centered on the mouse position and also accept `smoothing` and `hideNativeCursor` (see below).

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

- **`smoothing?: number`** — `0` (default) snaps the cursor to the mouse every frame. Values in `(0, 1]` are the fraction of the remaining distance covered per frame, so smaller values trail more (e.g. `0.15` is a loose, floaty follow; `0.5` is a quick catch-up). Automatically forced to `0` when the user has `prefers-reduced-motion` enabled.
- **`hideNativeCursor?: boolean`** — `true` by default: the native cursor is hidden everywhere (including on buttons and links, which normally set their own) so only the custom cursor is visible. Set to `false` to show both.

```tsx
// Ring accent alongside the normal OS cursor
useCursor({ preset: "ring", smoothing: 0.3, hideNativeCursor: false });
```

## Cursor Zones

`CursorZone` renders a `div` (all standard `div` props are forwarded) and swaps in its cursor while hovered:

```tsx
<CursorZone
  cursor={{ preset: "text", content: "Drag", color: "#fff" }}
  className="gallery"
  onMouseEnter={() => console.log("entered")} // your handlers still fire
>
  {images.map((img) => (
    <Photo key={img.id} {...img} />
  ))}
</CursorZone>
```

Zones nest naturally — the innermost hovered zone wins:

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
- **Reduced motion:** when `prefers-reduced-motion: reduce` is active, `smoothing` is ignored and the cursor snaps directly to the mouse.
- **Screen readers:** the custom cursor layer is `aria-hidden` and `pointer-events: none`, so it never intercepts clicks or appears in the accessibility tree.

```tsx
import { useHasCursor } from "@omri/react-cursor";

function Hint() {
  const hasCursor = useHasCursor();
  return hasCursor ? <p>Hover the cards to preview</p> : <p>Tap a card to preview</p>;
}
```

## Server-side rendering

The library is SSR-safe: nothing touches `window` during render, and on the server `useHasCursor()` reports `false`, so no custom cursor markup is emitted. The custom cursor appears after hydration on devices with a mouse.

## API reference

### `<CursorProvider>`

Wraps the app, owns cursor state, applies the native CSS cursor to `document.documentElement`, and renders the custom cursor layer when the active cursor is a preset or render cursor.

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | Your app. |

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
| `...rest` | `ComponentPropsWithoutRef<"div">` | Forwarded to the underlying `div`; `onMouseEnter` / `onMouseLeave` are composed, not overwritten. |

### `useHasCursor()`

Returns `true` when the device has a fine pointer (mouse/trackpad), `false` on touch-only devices and during SSR. Reactive — updates live if the pointer capability changes.

### Types

```ts
import type {
  CursorInput,       // string | CursorStyle — what useCursor/CursorZone accept
  CursorStyle,       // NativeCursor | PresetCursor | RenderCursor
  NativeCursor,      // { native: CSSProperties["cursor"] }
  PresetCursor,      // { preset: PresetName; size?; color?; content?; smoothing?; hideNativeCursor? }
  RenderCursor,      // { render: ReactNode; smoothing?; hideNativeCursor? }
  PresetName,        // "dot" | "ring" | "spotlight" | "emoji" | "image" | "text"
  NativeCursorValue, // CSSProperties["cursor"]
} from "@omri/react-cursor";
```

## How it works

- `CursorProvider` keeps a registry of global cursors and currently hovered zones, and resolves the active cursor as: innermost hovered zone → last-mounted global cursor → `auto`.
- Native cursors are applied via `document.documentElement.style.cursor`. When a custom cursor hides the native one, a temporary `cursor: none !important` stylesheet is injected so UA styles on buttons/links can't leak through; it's removed as soon as the custom cursor deactivates.
- The custom cursor layer tracks the mouse with a single `mousemove` listener and moves via `transform: translate3d(...)` inside `requestAnimationFrame` — React never re-renders on mouse move.

## Development

```bash
pnpm install
pnpm test           # vitest run
pnpm run typecheck  # tsc --noEmit
pnpm run build      # tsdown → dist/
```

## License

MIT © Omri Attiya
