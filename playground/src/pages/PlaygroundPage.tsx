import { useMemo, useState } from "react";
import {
  CursorZone,
  useCursor,
  useHasCursor,
  type CursorInput,
  type PresetName,
} from "@omriattiya/react-cursor";
import type { Theme } from "../App";

function spotlightColor(theme: Theme) {
  return theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
}

const SPOTLIGHT_ALPHA = 0.12;

function parseHex6(color: string): string | null {
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : null;
}

function rgbaToHex(color: string): string | null {
  const match = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(color);
  if (!match) return null;
  const r = Number(match[1]);
  const g = Number(match[2]);
  const b = Number(match[3]);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function colorPickerValue(color: string | undefined): string {
  if (!color) return "#38bdf8";
  return parseHex6(color) ?? rgbaToHex(color) ?? "#38bdf8";
}

function hexToRgba(hex: string, alpha: number): string {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!match?.[1]) return hex;
  const n = parseInt(match[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function colorFromPicker(hex: string, preset: PresetName): string {
  return preset === "spotlight" ? hexToRgba(hex, SPOTLIGHT_ALPHA) : hex;
}

const TARGET_SVG =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#f59e0b" opacity="0.9"/><circle cx="16" cy="16" r="6" fill="#fff"/></svg>',
  );

type Mode = "native" | "preset" | "render";

const NATIVE_CURSORS = [
  "auto",
  "default",
  "pointer",
  "grab",
  "grabbing",
  "crosshair",
  "text",
  "move",
  "wait",
  "progress",
  "help",
  "not-allowed",
  "zoom-in",
  "zoom-out",
  "copy",
  "cell",
] as const;

interface PresetMeta {
  defaultSize: number;
  defaultColor?: string;
  defaultContent?: string;
  hasColor: boolean;
  hasContent: boolean;
  contentLabel?: string;
  sizeMax: number;
}

const PRESETS: Record<PresetName, PresetMeta> = {
  dot: { defaultSize: 12, defaultColor: "#f43f5e", hasColor: true, hasContent: false, sizeMax: 64 },
  ring: { defaultSize: 36, defaultColor: "#38bdf8", hasColor: true, hasContent: false, sizeMax: 96 },
  pulse: { defaultSize: 40, defaultColor: "#a78bfa", hasColor: true, hasContent: false, sizeMax: 96 },
  spotlight: {
    defaultSize: 320,
    hasColor: true,
    hasContent: false,
    sizeMax: 600,
  },
  emoji: { defaultSize: 28, defaultContent: "🚀", hasColor: false, hasContent: true, contentLabel: "Emoji", sizeMax: 96 },
  text: {
    defaultSize: 14,
    defaultColor: "#a3e635",
    defaultContent: "HELLO",
    hasColor: true,
    hasContent: true,
    contentLabel: "Label",
    sizeMax: 48,
  },
  image: {
    defaultSize: 32,
    defaultContent: TARGET_SVG,
    hasColor: false,
    hasContent: true,
    contentLabel: "Image URL",
    sizeMax: 128,
  },
};

const PRESET_NAMES = Object.keys(PRESETS) as PresetName[];

function GlobalCursor({ input }: { input: CursorInput }) {
  useCursor(input);
  return null;
}

function formatValue(v: unknown): string {
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "object" && v !== null) {
    return JSON.stringify(v).replaceAll('"', "").replaceAll(",", ", ").replaceAll(":", ": ");
  }
  return String(v);
}

function buildSnippet(mode: Mode, input: CursorInput): string {
  if (mode === "native") {
    return `useCursor(${JSON.stringify(input)});`;
  }
  const obj = input as unknown as Record<string, unknown>;
  const lines = Object.entries(obj)
    .filter(([k]) => k !== "render")
    .map(([k, v]) => `  ${k}: ${formatValue(v)},`);
  if (mode === "render") {
    lines.unshift("  render: <Sparkle />,");
  }
  return ["useCursor({", ...lines, "});"].join("\n");
}

export function PlaygroundPage({ theme }: { theme: Theme }) {
  const hasCursor = useHasCursor();

  const [mode, setMode] = useState<Mode>("preset");
  const [nativeValue, setNativeValue] = useState<string>("pointer");
  const [presetName, setPresetName] = useState<PresetName>("ring");

  // Per-preset overrides so switching presets keeps your tweaks
  const [overrides, setOverrides] = useState<
    Partial<Record<PresetName, { size?: number; color?: string; content?: string }>>
  >({});

  const [smoothing, setSmoothing] = useState(75);
  const [stretch, setStretch] = useState(1);
  const [trailCount, setTrailCount] = useState(3);
  const [trailDelay, setTrailDelay] = useState(100);
  const [trailFadeDelay, setTrailFadeDelay] = useState(200);
  const [trailShrink, setTrailShrink] = useState(true);
  const [hideNative, setHideNative] = useState(true);

  const meta = useMemo(() => {
    const base = PRESETS[presetName];
    if (presetName === "spotlight") {
      return { ...base, defaultColor: spotlightColor(theme) };
    }
    return base;
  }, [presetName, theme]);
  const current = {
    size: overrides[presetName]?.size ?? meta.defaultSize,
    color: overrides[presetName]?.color ?? meta.defaultColor,
    content: overrides[presetName]?.content ?? meta.defaultContent,
  };

  const setOverride = (patch: { size?: number; color?: string; content?: string }) =>
    setOverrides((prev) => ({ ...prev, [presetName]: { ...prev[presetName], ...patch } }));

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

  const motionOptions = {
    smoothing: smoothing / 100,
    ...(stretch > 1 ? { velocity: { stretch } } : {}),
    ...(trailCount > 0
      ? {
          trail: {
            count: trailCount,
            delay: trailDelay,
            fadeDelay: trailFadeDelay,
            ...(trailShrink ? {} : { shrink: false }),
          },
        }
      : {}),
    hideNativeCursor: hideNative,
  };

  const cursorInput: CursorInput =
    mode === "native"
      ? nativeValue
      : mode === "render"
        ? { render: sparkle, ...motionOptions }
        : {
            preset: presetName,
            size: current.size,
            ...(meta.hasColor && current.color ? { color: current.color } : {}),
            ...(meta.hasContent && current.content ? { content: current.content } : {}),
            ...motionOptions,
          };

  const snippet = buildSnippet(mode, cursorInput);

  return (
    <main className="page">
      <GlobalCursor input={cursorInput} />

      <header className="hero">
        <h1 className="brand-name">@omriattiya/react-cursor</h1>
        <p>
          Configure a cursor below — it applies to this whole page instantly. The generated code
          updates as you tweak.
        </p>
        {!hasCursor && (
          <p className="warning">Touch-only device detected — custom cursors are disabled.</p>
        )}
      </header>

      <section className="card">
        <h2>Global Cursor</h2>

        <div className="field">
          <span className="field-label">Type</span>
          <div className="segmented">
            {(["native", "preset", "render"] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={mode === m ? "segment active" : "segment"}
                onClick={() => setMode(m)}
              >
                {m === "native" ? "Native CSS" : m === "preset" ? "Preset" : "Custom render"}
              </button>
            ))}
          </div>
        </div>

        {mode === "native" && (
          <div className="field">
            <span className="field-label">Cursor value</span>
            <div className="chips">
              {NATIVE_CURSORS.map((v) => (
                <button
                  key={v}
                  type="button"
                  className={nativeValue === v ? "chip active" : "chip"}
                  onClick={() => setNativeValue(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === "preset" && (
          <>
            <div className="field">
              <span className="field-label">Preset</span>
              <div className="chips">
                {PRESET_NAMES.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={presetName === name ? "chip active" : "chip"}
                    onClick={() => setPresetName(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="controls-grid">
              <label className="control">
                <span className="field-label">
                  Size <code>{current.size}px</code>
                </span>
                <input
                  type="range"
                  min={4}
                  max={meta.sizeMax}
                  step={1}
                  value={current.size}
                  onChange={(e) => setOverride({ size: Number(e.target.value) })}
                />
              </label>

              {meta.hasColor && (
                <label className="control">
                  <span className="field-label">Color</span>
                  <div className="color-row">
                    <input
                      type="color"
                      value={colorPickerValue(current.color)}
                      onChange={(e) => setOverride({ color: colorFromPicker(e.target.value, presetName) })}
                    />
                    <input
                      type="text"
                      className="text-input"
                      value={current.color ?? ""}
                      onChange={(e) => setOverride({ color: e.target.value })}
                      spellCheck={false}
                    />
                  </div>
                </label>
              )}

              {meta.hasContent && (
                <label className="control">
                  <span className="field-label">{meta.contentLabel}</span>
                  <input
                    type="text"
                    className="text-input"
                    value={current.content ?? ""}
                    onChange={(e) => setOverride({ content: e.target.value })}
                    spellCheck={false}
                  />
                </label>
              )}
            </div>
          </>
        )}

        {mode !== "native" && (
          <>
            <div className="controls-grid">
              <label className="control">
                <span className="field-label">
                  Smoothing <code>{smoothing}</code>
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={smoothing}
                  onChange={(e) => setSmoothing(Number(e.target.value))}
                />
              </label>

              <label className="control">
                <span className="field-label">
                  Velocity stretch <code>{stretch.toFixed(1)}x</code>
                </span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={stretch}
                  onChange={(e) => setStretch(Number(e.target.value))}
                />
              </label>

              <label className="control">
                <span className="field-label">
                  Trail segments <code>{trailCount === 0 ? "off" : trailCount}</code>
                </span>
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={1}
                  value={trailCount}
                  onChange={(e) => setTrailCount(Number(e.target.value))}
                />
              </label>
              {trailCount > 0 && (
                <>
                  <label className="control">
                    <span className="field-label">
                      Trail delay <code>{trailDelay}ms</code>
                    </span>
                    <input
                      type="range"
                      min={20}
                      max={400}
                      step={10}
                      value={trailDelay}
                      onChange={(e) => setTrailDelay(Number(e.target.value))}
                    />
                  </label>
                  <label className="control">
                    <span className="field-label">
                      Trail fade after <code>{trailFadeDelay}ms</code>
                    </span>
                    <input
                      type="range"
                      min={50}
                      max={2000}
                      step={50}
                      value={trailFadeDelay}
                      onChange={(e) => setTrailFadeDelay(Number(e.target.value))}
                    />
                  </label>
                  <label className="control checkbox">
                    <input
                      type="checkbox"
                      checked={trailShrink}
                      onChange={(e) => setTrailShrink(e.target.checked)}
                    />
                    <span>Shrink trail with depth</span>
                  </label>
                </>
              )}

              <label className="control checkbox">
                <input
                  type="checkbox"
                  checked={hideNative}
                  onChange={(e) => setHideNative(e.target.checked)}
                />
                <span>Hide native cursor</span>
              </label>
            </div>
          </>
        )}

        <div className="snippet">
          <span className="snippet-title">Code</span>
          <pre>
            <code>{snippet}</code>
          </pre>
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
          <CursorZone
            cursor={{ preset: "dot", color: "#22d3ee", size: 16 }}
            className="zone nested-outer"
          >
            Outer zone (dot)
            <CursorZone
              cursor={{ preset: "ring", color: "#f472b6", size: 44 }}
              className="zone nested-inner"
            >
              Inner zone wins (ring)
            </CursorZone>
          </CursorZone>
        </div>
      </section>
    </main>
  );
}
