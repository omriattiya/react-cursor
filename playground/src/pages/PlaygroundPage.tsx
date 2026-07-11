import { useMemo, useState } from "react";
import {
  CursorZone,
  useCursor,
  useHasCursor,
  type CursorInput,
  type PresetName,
} from "@omriattiya/react-cursor";

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
    defaultColor: "rgba(255,255,255,0.12)",
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

function buildSnippet(mode: Mode, input: CursorInput): string {
  if (mode === "native") {
    return `useCursor(${JSON.stringify(input)});`;
  }
  if (mode === "render") {
    const opts = input as { smoothing?: number; hideNativeCursor?: boolean };
    return [
      "useCursor({",
      "  render: <Sparkle />,",
      `  smoothing: ${opts.smoothing},`,
      `  hideNativeCursor: ${opts.hideNativeCursor},`,
      "});",
    ].join("\n");
  }
  const obj = input as unknown as Record<string, unknown>;
  const lines = Object.entries(obj).map(
    ([k, v]) => `  ${k}: ${typeof v === "string" ? JSON.stringify(v) : String(v)},`,
  );
  return ["useCursor({", ...lines, "});"].join("\n");
}

export function PlaygroundPage() {
  const hasCursor = useHasCursor();

  const [mode, setMode] = useState<Mode>("preset");
  const [nativeValue, setNativeValue] = useState<string>("pointer");
  const [presetName, setPresetName] = useState<PresetName>("ring");

  // Per-preset overrides so switching presets keeps your tweaks
  const [overrides, setOverrides] = useState<
    Partial<Record<PresetName, { size?: number; color?: string; content?: string }>>
  >({});

  const [smoothing, setSmoothing] = useState(0.2);
  const [hideNative, setHideNative] = useState(true);

  const meta = PRESETS[presetName];
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

  const cursorInput: CursorInput =
    mode === "native"
      ? nativeValue
      : mode === "render"
        ? { render: sparkle, smoothing, hideNativeCursor: hideNative }
        : {
            preset: presetName,
            size: current.size,
            ...(meta.hasColor && current.color ? { color: current.color } : {}),
            ...(meta.hasContent && current.content ? { content: current.content } : {}),
            smoothing,
            hideNativeCursor: hideNative,
          };

  const snippet = buildSnippet(mode, cursorInput);

  return (
    <main className="page">
      <GlobalCursor input={cursorInput} />

      <header className="hero">
        <h1>Playground</h1>
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
                      value={/^#[0-9a-fA-F]{6}$/.test(current.color ?? "") ? current.color : "#38bdf8"}
                      onChange={(e) => setOverride({ color: e.target.value })}
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
          <div className="controls-grid">
            <label className="control">
              <span className="field-label">
                Smoothing <code>{smoothing.toFixed(2)}</code>
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={smoothing}
                onChange={(e) => setSmoothing(Number(e.target.value))}
              />
            </label>
            <label className="control checkbox">
              <input
                type="checkbox"
                checked={hideNative}
                onChange={(e) => setHideNative(e.target.checked)}
              />
              <span>Hide native cursor</span>
            </label>
          </div>
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
