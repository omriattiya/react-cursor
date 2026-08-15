---
name: react-cursor
description: Warm stone workshop UI for the playground — coral ember accent, code-first, proof-first.
colors:
  ember: "#ff7a59"
  ember-deep: "#e0452b"
  ember-contrast-dark: "#1c100c"
  gold: "#f0b429"
  gold-deep: "#c9850c"
  stone: "#12100e"
  stone-soft: "#1c1917"
  stone-inset: "#0c0a09"
  parchment: "#f7f3ef"
  parchment-soft: "#fffdfb"
  parchment-inset: "#efe9e3"
  ink: "#1c1917"
  cream: "#f5f0eb"
  mute-dark: "#a8a29e"
  mute-light: "#78716c"
  border-dark: "#3f3a36"
  border-light: "#e7ddd3"
  success-dark: "#4ade80"
  warning-dark: "#fbbf24"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, Segoe UI, sans-serif"
    fontSize: "clamp(1.4rem, 4.2dvh + 0.9rem, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  title:
    fontFamily: "ui-sans-serif, system-ui, Segoe UI, sans-serif"
    fontSize: "clamp(1.6rem, 2.5vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "ui-sans-serif, system-ui, Segoe UI, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "ui-sans-serif, system-ui, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  control:
    fontFamily: "ui-sans-serif, system-ui, Segoe UI, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "normal"
  caption:
    fontFamily: "ui-sans-serif, system-ui, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.05em"
  label:
    fontFamily: "ui-sans-serif, system-ui, Segoe UI, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.05em"
  mono:
    fontFamily: "ui-monospace, Cascadia Code, Consolas, monospace"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
rounded:
  xs: "5px"
  sm: "6px"
  md: "8px"
  button: "10px"
  lg: "12px"
  card-sm: "14px"
  xl: "16px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ember}"
    textColor: "{colors.ember-contrast-dark}"
    rounded: "{rounded.button}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ember-contrast-dark}"
    rounded: "{rounded.button}"
    padding: "10px 18px"
  button-ghost:
    backgroundColor: "{colors.stone-inset}"
    textColor: "{colors.cream}"
    rounded: "{rounded.button}"
    padding: "10px 18px"
  card:
    backgroundColor: "{colors.stone-soft}"
    textColor: "{colors.cream}"
    rounded: "{rounded.xl}"
    padding: "24px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    rounded: "{rounded.pill}"
    padding: "7px 14px"
  nav-tab:
    backgroundColor: "transparent"
    textColor: "{colors.mute-dark}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
---

# Design System: react-cursor

## Overview

**Creative North Star: "Ember on Stone"**

The playground is a warm workshop, not a neon tool demo. Surfaces sit on charcoal stone (`#12100e`) or cream parchment (`#f7f3ef`); a coral ember (`#ff7a59`) and companion gold (`#f0b429`) mark the one thing that moves — the cursor, the active control, the primary action. Page backgrounds carry two soft radial embers (top-left coral, top-right gold) over the stone, then stay still.

Voice is technical and concise. Proof is the live cursor, not marketing claims. Density is editorial-tool: one 960px column, 24px page padding, 16px cards, tight control clusters with generous section gaps.

**Key Characteristics:**
- Warm stone / parchment, never cool navy or neon
- Ember + gold as a single accent voice (gradient on marks, active chips, slider fills)
- System sans for UI; mono only for code, package names, and measured values
- Tonal surfaces with 1px borders; shadows are small and offset, not glow halos
- Custom cursor is the signature motion; UI motion is short ease-out on state, not entrance theater

## Colors

Warm, slightly desaturated stone with one saturated ember. Light theme inverts the stone to parchment and deepens ember to `#e0452b` so contrast holds.

### Primary
- **Ember** (`#ff7a59` dark / `#e0452b` light): brand mark, active chips, primary buttons, focus rings, slider range, selected preset cards. The thing that is “on.”
- **Gold** (`#f0b429` dark / `#c9850c` light): second stop of the accent gradient; companion, not a competing brand color.

### Neutral
- **Stone** (`#12100e`): dark page ground.
- **Stone Soft** (`#1c1917`): cards, nav hover, raised panels.
- **Stone Inset** (`#0c0a09`): inputs, code wells, recessed tracks.
- **Parchment** (`#f7f3ef` / `#fffdfb` / `#efe9e3`): light-theme counterparts of the three stone layers.
- **Cream / Ink** (`#f5f0eb` / `#1c1917`): primary text, swapped by theme.
- **Mute** (`#a8a29e` dark / `#78716c` light): secondary copy, labels, inactive tabs.
- **Border** (`#3f3a36` dark / `#e7ddd3` light): 1px strokes on cards, nav, wells.

### Named Rules
**The Ember Voice Rule.** Ember and gold are one voice. Do not introduce a third accent (blue CTAs, purple links, neon). Gradient text is reserved for the brand wordmark only.

**The Stone Ground Rule.** Dark or light is chosen from the desk: a developer evaluating the library, usually on a dim editor. Default follows `prefers-color-scheme`; both themes must exist.

## Typography

**Display Font:** system UI sans (`ui-sans-serif, system-ui, "Segoe UI", sans-serif`)
**Body Font:** same stack
**Label/Mono Font:** `ui-monospace, "Cascadia Code", Consolas, monospace`

**Character:** Workhorse UI type. Hierarchy comes from size and weight, not a display face. Mono is for code and the package name, never as a costume for “developer.”

### Hierarchy
- **Display** (700, `clamp(1.4rem, 4.2dvh + 0.9rem, 3.25rem)`, tracking `-0.03em`): homepage title only. The 1.4rem floor is the short-viewport compact step (also 1.55rem / 1.65rem / 1.85rem along the way).
- **Title** (700, `clamp(1.6rem, 2.5vw, 2rem)`, tracking `-0.02em`): Playground / Getting Started page titles.
- **Headline** (600, `1.15rem`): card / section titles.
- **Body** (400, `1rem`, line-height 1.6, measure ≤65ch): ledes and explanations. Homepage lede may wrap at ~36ch because it is a centered stack, not a reading column.
- **Control** (500, `0.9rem`): tabs, chips, buttons, table cells.
- **Label** (600, `0.8rem`, tracking `0.05em`, uppercase): field labels and panel titles. One kicker per surface is enough; do not eyebrow every section.
- **Caption** (600, `0.75rem`; compact home `0.68rem` / `0.7rem`): code-block toolbar labels; the compact steps keep the home stage on-screen.
- **Mono** (400, `0.85rem`, line-height 1.65): code blocks, install commands, footer package name.

### Named Rules
**The One Face Rule.** No second display family. Emphasis is weight and size.

## Layout

Single column, max-width 960px, centered, 24px inline padding (16px below 640px). Vertical rhythm: 24px between page sections, 40px page top padding. More space above a heading than below it. Navbar is sticky; footer is a thin credit bar. Below 640px, nav tabs wrap full-width under brand + actions.

Home fills the viewport between navbar and footer with no page scroll. Hero + install stay a centered 34rem stack; the proof pair (usage + features) may use up to 46rem. Mark size, type, and gaps compress with viewport height so the full offer stays on screen. On tall screens the stack is vertically centered. Below 720px the proof pair stacks and features become a two-column compact list. Below 560px height, or below 700px height on narrow screens, the footer hides so the stage still fits.

## Elevation & Depth

Tonal layering first: inset wells are darker, cards are slightly lifted stone with a 1px border. Shadows are small and offset (`0 1px 2px` at ~40% black on dark, ~6% ink on light). Page atmosphere is two large, low-opacity radial gradients, not per-card glow.

### Shadow Vocabulary
- **Rest** (`0 1px 2px rgba(0, 0, 0, 0.4)` dark / `rgba(28, 25, 23, 0.06)` light): cards and thumbs.
- **Mark** (`0 1px 8px` ember at 45%): the 12px nav brand ring.
- **Hero mark** (`0 4px 28px` ember at 32%): the 96px open homepage ring.

### Named Rules
**The Offset Shadow Rule.** Shadows carry offset and blur. A zero-offset colored halo is decoration, except the brand marks.

## Shapes

16px cards, 14px preset tiles, 12px code wells, 10px CTAs and segmented controls, 8px tabs/inputs/icon buttons, 999px chips and sliders. Geometry is rounded-rect, not squircles or sharp tools. The nav brand mark is a 12px circle with a 3px ember–gold gradient ring. The homepage hero mark is a 96px open hoop (10px gradient stroke, transparent center so page atmosphere shows through).

## Components

### Buttons
- **Shape:** 8–10px radius.
- **Primary (link-button / CTA):** inset fill, 1px strong border, 10px 18px padding. Homepage Get Started may fill ember with ember-contrast text.
- **Ghost:** transparent icon button 36×36, muted until hover (soft fill + 1px border).
- **Hover / Focus:** border or fill shifts to ember; focus-visible is a 2px ember outline, 2px offset.

### Chips
- Pill, 1px strong border, transparent rest. On: ember–gold gradient fill, contrast text, weight 600.

### Cards / Containers
- 16px radius, 24px padding, 1px border, tonal surface gradient (soft stone kissed with ember at the top-left). Editor cards drop padding and put a tinted header.

### Inputs / Fields
- Inset well, 8px radius, 1px strong border, mono for typed values. Focus: ember border + 3px ember-mix ring. Color inputs are 40×34 swatches.

### Navigation
- Sticky, 82% stone over blur, 1px bottom border. Brand mark + gradient wordmark left; text tabs center (active = soft fill + inset 1px border); GitHub / npm / theme icons right.

### Code block
- Inset well, 12px radius, toolbar with uppercase 0.75rem label and copy control. Copy success uses success green, not ember.

### Install well
- Homepage only. npm/pnpm underline tabs over a one-line inset command (`$` prompt is visual; copy writes the bare command). 12px radius, copy control in-row. Not a docs editor.

## Do's and Don'ts

### Do:
- **Do** prove the library with a live `useCursor` on marketing surfaces — the cursor is the product.
- **Do** keep install commands copyable and short (npm / pnpm).
- **Do** use ember for the active thing and mute for the rest.
- **Do** respect `prefers-reduced-motion`: snap cursor, no trails, no UI animation.

### Don't:
- **Don't** introduce cool navy, electric blue CTAs, or a second brand accent.
- **Don't** invent testimonials, download counts, or customer logos.
- **Don't** wrap every section in a same-size icon+heading+text card grid.
- **Don't** use gradient text except the existing brand wordmark.
- **Don't** costume body copy in monospace.
