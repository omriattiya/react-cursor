import { useMemo, useState } from "react";
import {
  CursorZone,
  useCursor,
  useHasCursor,
  type CursorInput,
  type PresetCursor,
} from "@omriattiya/react-cursor";

const TARGET_SVG =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#f59e0b" opacity="0.9"/><circle cx="16" cy="16" r="6" fill="#fff"/></svg>',
  );

type Choice =
  | { kind: "native"; label: string; value: CursorInput }
  | { kind: "preset"; label: string; value: PresetCursor }
  | { kind: "render"; label: string };

const CHOICES: Choice[] = [
  { kind: "native", label: "Native: auto", value: "auto" },
  { kind: "native", label: "Native: grab", value: "grab" },
  { kind: "native", label: "Native: crosshair", value: "crosshair" },
  { kind: "preset", label: "Dot", value: { preset: "dot", color: "#f43f5e", size: 12 } },
  { kind: "preset", label: "Ring", value: { preset: "ring", color: "#38bdf8", size: 36 } },
  {
    kind: "preset",
    label: "Spotlight",
    value: { preset: "spotlight", color: "rgba(255,255,255,0.12)", size: 320 },
  },
  { kind: "preset", label: "Emoji", value: { preset: "emoji", content: "🚀", size: 28 } },
  { kind: "preset", label: "Text", value: { preset: "text", content: "HELLO", color: "#a3e635" } },
  { kind: "preset", label: "Image", value: { preset: "image", content: TARGET_SVG, size: 32 } },
  { kind: "render", label: "Custom render" },
];

function GlobalCursor({
  choice,
  smoothing,
  hideNative,
}: {
  choice: Choice;
  smoothing: number;
  hideNative: boolean;
}) {
  const sparkle = useMemo(
    () => (
      <span
        style={{
          display: "block",
          transform: "translate(-50%, -50%) rotate(45deg)",
          width: 22,
          height: 22,
          background: "linear-gradient(135deg, #f0abfc, #818cf8)",
          boxShadow: "0 0 18px 4px rgba(129, 140, 248, 0.6)",
        }}
      />
    ),
    [],
  );

  const style: CursorInput =
    choice.kind === "native"
      ? choice.value
      : choice.kind === "render"
        ? { render: sparkle, smoothing, hideNativeCursor: hideNative }
        : { ...choice.value, smoothing, hideNativeCursor: hideNative };

  useCursor(style);
  return null;
}

export function App() {
  const [choiceIndex, setChoiceIndex] = useState(4); // Ring
  const [smoothing, setSmoothing] = useState(0.2);
  const [hideNative, setHideNative] = useState(true);
  const hasCursor = useHasCursor();

  const choice = CHOICES[choiceIndex]!;

  return (
    <main className="page">
      <GlobalCursor choice={choice} smoothing={smoothing} hideNative={hideNative} />

      <header className="header">
        <h1>@omriattiya/react-cursor</h1>
        <p>One API for native CSS cursors and custom-rendered cursors.</p>
        {!hasCursor && <p className="warning">Touch-only device detected — custom cursors are disabled.</p>}
      </header>

      <section className="card">
        <h2>Global Cursor</h2>
        <div className="chips">
          {CHOICES.map((c, i) => (
            <button
              key={c.label}
              className={i === choiceIndex ? "chip active" : "chip"}
              onClick={() => setChoiceIndex(i)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="controls">
          <label>
            Smoothing: {smoothing.toFixed(2)}
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={smoothing}
              onChange={(e) => setSmoothing(Number(e.target.value))}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={hideNative}
              onChange={(e) => setHideNative(e.target.checked)}
            />
            Hide native cursor
          </label>
        </div>
      </section>

      <section className="card">
        <h2>Cursor Zones</h2>
        <p>Hovering a zone overrides the global cursor; leaving falls back.</p>
        <div className="zones">
          <CursorZone cursor="pointer" className="zone">
            Native pointer
          </CursorZone>
          <CursorZone cursor={{ preset: "emoji", content: "🔥", size: 32 }} className="zone">
            Emoji zone
          </CursorZone>
          <CursorZone cursor={{ preset: "text", content: "VIEW", color: "#fbbf24" }} className="zone">
            Text zone
          </CursorZone>
          <CursorZone cursor={{ preset: "dot", color: "#22d3ee", size: 16 }} className="zone nested-outer">
            Outer zone (dot)
            <CursorZone cursor={{ preset: "ring", color: "#f472b6", size: 44 }} className="zone nested-inner">
              Inner zone wins (ring)
            </CursorZone>
          </CursorZone>
        </div>
      </section>
    </main>
  );
}
