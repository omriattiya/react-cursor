# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are frontend / React engineers building marketing sites, creative portfolios, or interactive product UIs. Their job: add expressive custom cursors without hand-wiring mouse tracking, zone overrides, motion, or accessibility behavior.

## Product Purpose

`@omriattiya/react-cursor` is a React library that unifies native CSS cursors and custom-rendered cursors behind one API (`useCursor` / `CursorZone`). Success means developers can declare cursor look and feel (native value, preset, or any React element) and get correct tracking, zone priority, touch-device handling, and reduced-motion behavior without a heavy animation stack.

## Positioning

One small surface for native CSS, shipped presets, and arbitrary React render — with zone priority, optional motion (smoothing, velocity stretch, trails), and accessibility defaults (custom cursors off on touch-only devices, motion disabled under `prefers-reduced-motion`, SSR-safe) — and zero runtime dependencies beyond React.

## Operating Context

- Consumed as an npm package (`@omriattiya/react-cursor`) in React 19+ apps
- Evaluated and demonstrated via the Vite playground (`pnpm playground`) with Playground + Getting Started pages
- Live demo: https://react-cursor-xi.vercel.app/
- Source / issues: https://github.com/omriattiya/react-cursor
- Domain terminology lives in `CONTEXT.md` (Cursor, Native/Custom Cursor, Preset, Provider, Cursor Zone, Global Cursor, Smoothing, Trail, Velocity Effect)

## Capabilities and Constraints

**Capabilities**

- Native CSS cursors, built-in presets (dot, ring, spotlight, emoji, text, image, pulse), and custom `render` escape hatch
- Global cursor via `useCursor`; element-scoped overrides via `CursorZone` (innermost hovered zone wins)
- Optional lerp smoothing, velocity stretch, and trail segments
- Touch-only devices skip custom cursors; reduced-motion disables smoothing/trails/velocity effects

**Constraints**

- Peer deps: React / React DOM ≥ 19
- No runtime deps beyond React
- MIT license; author Omri Attiya
- Package / product name: `react-cursor` / `@omriattiya/react-cursor`

**Undecided (do not invent)**

- Commercial packaging, pricing, or paid tiers
- Audience expansion beyond React engineers (e.g. design-tool integrations)
- Formal brand voice guidelines beyond the existing technical, concise docs tone

## Brand Commitments

- Name: **react-cursor** (npm: `@omriattiya/react-cursor`)
- Authorship: Omri Attiya
- Voice in docs/playground: technical, concise, code-first — no invented marketing claims
- Playground is the canonical interactive proof surface; Getting Started is the usage docs surface

## Evidence on Hand

- README feature list, API docs, and code samples
- Interactive playground + Getting Started pages under `playground/`
- Deployed demo at https://react-cursor-xi.vercel.app/
- GitHub repo and npm package pages
- No customer testimonials, case studies, benchmarks, or press assets — do not fabricate them

## Product Principles

1. **One API, three shapes** — native, preset, and render share the same hooks/components; don’t fragment the mental model.
2. **Declare, don’t wire** — consumers describe intent; the library owns tracking, priority, and cleanup.
3. **Accessible by default** — touch and reduced-motion paths are first-class, not afterthoughts.
4. **Tiny and honest** — stay dependency-light; don’t claim customers, metrics, or capabilities the repo doesn’t have.
5. **Proof before polish** — playground and Getting Started must stay able to demonstrate every user-facing feature.

## Accessibility & Inclusion

- Custom cursors disabled on touch-only / coarse-pointer devices
- Smoothing, trails, and velocity effects disabled when `prefers-reduced-motion: reduce`
- Custom cursor layer is `aria-hidden`
- SSR-safe: no window access during render; server assumes no fine pointer until hydration
