import { ExternalLink } from "lucide-react";
import { GITHUB_URL, NPM_URL, type Theme } from "../App";
import { CodeBlock } from "../components/CodeBlock";

const NPM_INSTALL = "npm install @omriattiya/react-cursor";
const PNPM_INSTALL = "pnpm add @omriattiya/react-cursor";

const SETUP = `import { CursorProvider } from "@omriattiya/react-cursor";

export function App() {
  return (
    <CursorProvider>
      <YourApp />
    </CursorProvider>
  );
}`;

const GLOBAL = `import { useCursor } from "@omriattiya/react-cursor";

function Page() {
  // A ring that follows the mouse everywhere
  useCursor({ preset: "ring", color: "#ff7a59", smoothing: 0.2 });

  return <main>...</main>;
}`;

const ZONES = `import { CursorZone } from "@omriattiya/react-cursor";

<CursorZone cursor={{ preset: "emoji", content: "🔥" }}>
  <p>Hover me!</p>
</CursorZone>

// Zones nest — the innermost hovered zone wins
<CursorZone cursor={{ preset: "ring" }}>
  <CursorZone cursor="not-allowed">
    <DisabledArea />
  </CursorZone>
</CursorZone>`;

const MOTION = `// Stretch along the movement path as speed grows
useCursor({
  preset: "comet",
  color: "#a78bfa",
  velocity: { stretch: 1.8 },
});

// A snake trail that retraces the exact mouse path
useCursor({
  preset: "wand",
  color: "#c084fc",
  trail: {
    count: 5,       // segments (default 3)
    delay: 100,     // lag (ms) per segment
    fadeDelay: 200, // ms between per-segment fades after trail settles (deepest first)
    shrink: false,  // keep segments full size (default true: smaller with depth)
  },
});`;

const RENDER = `useCursor({
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
});`;

export function GettingStartedPage({ theme }: { theme: Theme }) {
  return (
    <main className="page">
      <header className="hero">
        <h1>Getting Started</h1>
        <p>
          One API for native CSS cursors and custom-rendered cursors in React. Declare what the
          cursor should look like — the library handles mouse tracking, zone hovering, priority
          resolution, touch-device detection, and reduced-motion support.
        </p>
      </header>

      <section className="card">
        <h2>1. Install</h2>
        <p>
          Requires React 19 or later (<code>react</code> and <code>react-dom</code> are peer
          dependencies).
        </p>
        <div className="install-blocks">
          <CodeBlock code={NPM_INSTALL} label="npm" language="bash" theme={theme} />
          <CodeBlock code={PNPM_INSTALL} label="pnpm" language="bash" theme={theme} />
        </div>
      </section>

      <section className="card">
        <h2>2. Wrap your app in a provider</h2>
        <p>
          A single <code>CursorProvider</code> owns all cursor state and renders the custom cursor
          element when one is active.
        </p>
        <CodeBlock code={SETUP} theme={theme} />
      </section>

      <section className="card">
        <h2>3. Set a global cursor</h2>
        <p>
          <code>useCursor</code> applies a page-wide cursor while the calling component is mounted,
          and cleans up on unmount. Pass a CSS cursor string, a preset, or a custom render.
        </p>
        <CodeBlock code={GLOBAL} theme={theme} />
      </section>

      <section className="card">
        <h2>4. Override per region with zones</h2>
        <p>
          <code>CursorZone</code> swaps in its cursor while hovered, then falls back to the
          enclosing zone, the global cursor, or the browser default.
        </p>
        <CodeBlock code={ZONES} theme={theme} />
      </section>

      <section className="card">
        <h2>5. Add motion: velocity, trails</h2>
        <p>
          Every custom cursor accepts speed-based <code>velocity</code> effects and a{" "}
          <code>trail</code> of segments that snakes behind the cursor and fades away after it
          settles.
        </p>
        <CodeBlock code={MOTION} theme={theme} />
      </section>

      <section className="card">
        <h2>6. Go fully custom</h2>
        <p>
          Pass any React element via <code>render</code>. It's placed in a fixed, pointer-events-none
          layer that tracks the mouse.
        </p>
        <CodeBlock code={RENDER} theme={theme} />
      </section>

      <section className="card">
        <h2>Built-in presets</h2>
        <div className="table-scroll">
          <table className="presets-table">
            <thead>
              <tr>
                <th>Preset</th>
                <th>Renders</th>
                <th>
                  <code>size</code>
                </th>
                <th>
                  <code>color</code>
                </th>
                <th>
                  <code>content</code>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>dot</code>
                </td>
                <td>Filled circle</td>
                <td>10</td>
                <td>#000</td>
                <td>—</td>
              </tr>
              <tr>
                <td>
                  <code>ring</code>
                </td>
                <td>2px outlined circle</td>
                <td>32</td>
                <td>#000</td>
                <td>—</td>
              </tr>
              <tr>
                <td>
                  <code>spotlight</code>
                </td>
                <td>Soft radial gradient</td>
                <td>200</td>
                <td>rgba(255,255,255,0.15)</td>
                <td>—</td>
              </tr>
              <tr>
                <td>
                  <code>emoji</code>
                </td>
                <td>An emoji</td>
                <td>24</td>
                <td>—</td>
                <td>The emoji string</td>
              </tr>
              <tr>
                <td>
                  <code>text</code>
                </td>
                <td>A text label</td>
                <td>14</td>
                <td>#000</td>
                <td>The label string</td>
              </tr>
              <tr>
                <td>
                  <code>image</code>
                </td>
                <td>An image</td>
                <td>32</td>
                <td>—</td>
                <td>The image URL</td>
              </tr>
              <tr>
                <td>
                  <code>pulse</code>
                </td>
                <td>Dot with animated ripple ring</td>
                <td>32</td>
                <td>#000</td>
                <td>—</td>
              </tr>
              <tr>
                <td>
                  <code>arrow</code>
                </td>
                <td>Classic OS arrow (tip hotspot)</td>
                <td>24</td>
                <td>#000</td>
                <td>—</td>
              </tr>
              <tr>
                <td>
                  <code>hand</code>
                </td>
                <td>Pointing hand (fingertip hotspot)</td>
                <td>28</td>
                <td>#000</td>
                <td>—</td>
              </tr>
              <tr>
                <td>
                  <code>crosshair</code>
                </td>
                <td>Game-style FPS reticle</td>
                <td>28</td>
                <td>#000</td>
                <td>—</td>
              </tr>
              <tr>
                <td>
                  <code>wand</code>
                </td>
                <td>Magic wand with twinkling star tip</td>
                <td>28</td>
                <td>#c084fc</td>
                <td>—</td>
              </tr>
              <tr>
                <td>
                  <code>comet</code>
                </td>
                <td>Bright core with soft bloom</td>
                <td>28</td>
                <td>#a78bfa</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          All presets also accept <code>smoothing</code> (0 = snap, (0, 1] = trailing) and{" "}
          <code>hideNativeCursor</code> (defaults to <code>true</code>).
        </p>
      </section>

      <section className="card">
        <h2>Accessibility, touch, and SSR</h2>
        <ul className="feature-list">
          <li>
            Custom cursors are disabled on touch-only devices — check with{" "}
            <code>useHasCursor()</code>.
          </li>
          <li>
            When <code>prefers-reduced-motion</code> is active, smoothing snaps, velocity effects are
            skipped, and trails are not rendered.
          </li>
          <li>
            The cursor layer is <code>aria-hidden</code> and never intercepts clicks.
          </li>
          <li>
            SSR-safe: nothing touches <code>window</code> during render.
          </li>
        </ul>
      </section>

      <section className="card links-card">
        <h2>Learn more</h2>
        <div className="link-row">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="link-button">
            Full docs on GitHub
            <ExternalLink size={14} strokeWidth={2} aria-hidden="true" />
          </a>
          <a href={NPM_URL} target="_blank" rel="noreferrer" className="link-button">
            Package on npm
            <ExternalLink size={14} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}
