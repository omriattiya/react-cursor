import { useMemo, useState } from "react";
import * as Label from "@radix-ui/react-label";
import * as Slider from "@radix-ui/react-slider";
import * as Switch from "@radix-ui/react-switch";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import {
  PresetVisual,
  useCursor,
  useHasCursor,
  type CursorInput,
  type PresetName,
} from "@omriattiya/react-cursor";
import type { Theme } from "../App";
import { CodeBlock } from "../components/CodeBlock";

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
  if (!color) return "#ff7a59";
  return parseHex6(color) ?? rgbaToHex(color) ?? "#ff7a59";
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
  ring: { defaultSize: 36, defaultColor: "#ff7a59", hasColor: true, hasContent: false, sizeMax: 96 },
  pulse: { defaultSize: 40, defaultColor: "#f0b429", hasColor: true, hasContent: false, sizeMax: 96 },
  arrow: { defaultSize: 24, defaultColor: "#111827", hasColor: true, hasContent: false, sizeMax: 64 },
  hand: { defaultSize: 28, defaultColor: "#111827", hasColor: true, hasContent: false, sizeMax: 64 },
  crosshair: { defaultSize: 32, defaultColor: "#a3e635", hasColor: true, hasContent: false, sizeMax: 64 },
  wand: { defaultSize: 28, defaultColor: "#c084fc", hasColor: true, hasContent: false, sizeMax: 64 },
  comet: { defaultSize: 32, defaultColor: "#a78bfa", hasColor: true, hasContent: false, sizeMax: 96 },
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

/** Compact sizes so each chip shows a recognizable glyph. */
const PREVIEW_SIZE: Record<PresetName, number> = {
  dot: 10,
  ring: 14,
  pulse: 14,
  arrow: 16,
  hand: 16,
  crosshair: 14,
  wand: 16,
  comet: 12,
  spotlight: 18,
  emoji: 14,
  text: 9,
  image: 14,
};

const TIP_HOTSPOT = new Set<PresetName>(["arrow", "hand", "wand"]);

function PresetChipPreview({ name, theme }: { name: PresetName; theme: Theme }) {
  const meta = PRESETS[name];
  const color = name === "spotlight" ? spotlightColor(theme) : meta.defaultColor;
  const content = name === "text" ? "Aa" : meta.defaultContent;
  const visual = (
    <PresetVisual
      style={{
        preset: name,
        size: PREVIEW_SIZE[name],
        color,
        content,
      }}
    />
  );
  // Tip-hotspot presets aren't centered via translate(-50%), so box-center them instead.
  if (TIP_HOTSPOT.has(name)) {
    return (
      <span className="chip-preview chip-preview-tip" aria-hidden>
        {visual}
      </span>
    );
  }
  return (
    <span className="chip-preview" aria-hidden>
      <span className="chip-preview-origin">{visual}</span>
    </span>
  );
}

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

function RangeControl({
  id,
  label,
  valueLabel,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  valueLabel: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="control">
      <div className="control-label-row">
        <Label.Root htmlFor={id} className="field-label">
          {label}
        </Label.Root>
        <code className="control-value">{valueLabel}</code>
      </div>
      <Slider.Root
        id={id}
        className="slider-root"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => {
          if (next !== undefined) onChange(next);
        }}
      >
        <Slider.Track className="slider-track">
          <Slider.Range className="slider-range" />
        </Slider.Track>
        <Slider.Thumb className="slider-thumb" aria-label={label} />
      </Slider.Root>
    </div>
  );
}

function SwitchControl({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="control switch-control">
      <Label.Root htmlFor={id} className="switch-label">
        {label}
      </Label.Root>
      <Switch.Root
        id={id}
        className="switch-root"
        checked={checked}
        onCheckedChange={onCheckedChange}
      >
        <Switch.Thumb className="switch-thumb" />
      </Switch.Root>
    </div>
  );
}

export function PlaygroundPage({ theme }: { theme: Theme }) {
  const hasCursor = useHasCursor();

  const [mode, setMode] = useState<Mode>("preset");
  const [nativeValue, setNativeValue] = useState<string>("pointer");
  const [presetName, setPresetName] = useState<PresetName>("ring");

  const [overrides, setOverrides] = useState<
    Partial<Record<PresetName, { size?: number; color?: string; content?: string }>>
  >({});

  const [smoothing, setSmoothing] = useState(75);
  const [stretch, setStretch] = useState(1);
  const [trailEnabled, setTrailEnabled] = useState(true);
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
          background: "linear-gradient(135deg, #ff7a59, #f0b429)",
          boxShadow: "0 0 18px 4px rgba(255, 122, 89, 0.45)",
        }}
      />
    ),
    [],
  );

  const motionOptions = {
    smoothing: smoothing / 100,
    ...(stretch > 1 ? { velocity: { stretch } } : {}),
    ...(trailEnabled
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
          <p className="warning" role="status">
            Touch-only device detected — custom cursors are disabled.
          </p>
        )}
      </header>

      <section className="card editor-card">
        <header className="card-header">
          <h2>Global Cursor</h2>
          <p className="card-lede">Pick a type, tune the look, then copy the snippet.</p>
        </header>

        <div className="control-stack">
          <section className="control-panel" aria-labelledby="panel-type">
            <h3 className="panel-title" id="panel-type">
              Type
            </h3>
            <div className="field field-flush">
              <ToggleGroup.Root
                type="single"
                className="segmented"
                value={mode}
                onValueChange={(value) => {
                  if (value) setMode(value as Mode);
                }}
                aria-labelledby="panel-type"
              >
                <ToggleGroup.Item value="native" className="segment">
                  Native CSS
                </ToggleGroup.Item>
                <ToggleGroup.Item value="preset" className="segment">
                  Preset
                </ToggleGroup.Item>
                <ToggleGroup.Item value="render" className="segment">
                  Custom render
                </ToggleGroup.Item>
              </ToggleGroup.Root>
            </div>

            {mode === "native" && (
              <div className="field field-flush">
                <span className="field-label" id="native-label">
                  Cursor value
                </span>
                <ToggleGroup.Root
                  type="single"
                  className="chips"
                  value={nativeValue}
                  onValueChange={(value) => {
                    if (value) setNativeValue(value);
                  }}
                  aria-labelledby="native-label"
                >
                  {NATIVE_CURSORS.map((v) => (
                    <ToggleGroup.Item key={v} value={v} className="chip">
                      {v}
                    </ToggleGroup.Item>
                  ))}
                </ToggleGroup.Root>
              </div>
            )}

            {mode === "preset" && (
              <div className="field field-flush">
                <span className="field-label" id="preset-label">
                  Preset
                </span>
                <ToggleGroup.Root
                  type="single"
                  className="chips"
                  value={presetName}
                  onValueChange={(value) => {
                    if (value) setPresetName(value as PresetName);
                  }}
                  aria-labelledby="preset-label"
                >
                  {PRESET_NAMES.map((name) => (
                    <ToggleGroup.Item key={name} value={name} className="chip">
                      <PresetChipPreview name={name} theme={theme} />
                      {name}
                    </ToggleGroup.Item>
                  ))}
                </ToggleGroup.Root>
              </div>
            )}

            {mode === "render" && (
              <p className="panel-note">Uses a built-in sparkle element as the custom render demo.</p>
            )}
          </section>

          {mode === "preset" && (
            <section className="control-panel" aria-labelledby="panel-appearance">
              <h3 className="panel-title" id="panel-appearance">
                Appearance
              </h3>
              <div className="controls-grid">
                <RangeControl
                  id="size"
                  label="Size"
                  valueLabel={`${current.size}px`}
                  value={current.size}
                  min={4}
                  max={meta.sizeMax}
                  step={1}
                  onChange={(size) => setOverride({ size })}
                />

                {meta.hasColor && (
                  <div className="control">
                    <Label.Root htmlFor="color-text" className="field-label">
                      Color
                    </Label.Root>
                    <div className="color-row">
                      <input
                        id="color-swatch"
                        type="color"
                        aria-label="Color swatch"
                        value={colorPickerValue(current.color)}
                        onChange={(e) =>
                          setOverride({ color: colorFromPicker(e.target.value, presetName) })
                        }
                      />
                      <input
                        id="color-text"
                        type="text"
                        className="text-input"
                        value={current.color ?? ""}
                        onChange={(e) => setOverride({ color: e.target.value })}
                        spellCheck={false}
                      />
                    </div>
                  </div>
                )}

                {meta.hasContent && (
                  <div className="control control-span">
                    <Label.Root htmlFor="content" className="field-label">
                      {meta.contentLabel}
                    </Label.Root>
                    <input
                      id="content"
                      type="text"
                      className="text-input"
                      value={current.content ?? ""}
                      onChange={(e) => setOverride({ content: e.target.value })}
                      spellCheck={false}
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          {mode !== "native" && (
            <section className="control-panel" aria-labelledby="panel-motion">
              <h3 className="panel-title" id="panel-motion">
                Motion
              </h3>
              <div className="controls-grid">
                <RangeControl
                  id="smoothing"
                  label="Smoothing"
                  valueLabel={String(smoothing)}
                  value={smoothing}
                  min={0}
                  max={100}
                  step={1}
                  onChange={setSmoothing}
                />

                <RangeControl
                  id="stretch"
                  label="Velocity stretch"
                  valueLabel={`${stretch.toFixed(1)}x`}
                  value={stretch}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={setStretch}
                />

              </div>

              <div className="controls-options">
                <SwitchControl
                  id="trail-enabled"
                  label="Trail"
                  checked={trailEnabled}
                  onCheckedChange={setTrailEnabled}
                />
              </div>

              {trailEnabled && (
                <div className="controls-subpanel">
                  <span className="field-label">Trail details</span>
                  <div className="controls-grid">
                    <RangeControl
                      id="trail-count"
                      label="Trail segments"
                      valueLabel={String(trailCount)}
                      value={trailCount}
                      min={1}
                      max={12}
                      step={1}
                      onChange={setTrailCount}
                    />
                    <RangeControl
                      id="trail-delay"
                      label="Trail delay"
                      valueLabel={`${trailDelay}ms`}
                      value={trailDelay}
                      min={20}
                      max={400}
                      step={10}
                      onChange={setTrailDelay}
                    />
                    <RangeControl
                      id="trail-fade"
                      label="Trail fade after"
                      valueLabel={`${trailFadeDelay}ms`}
                      value={trailFadeDelay}
                      min={50}
                      max={2000}
                      step={50}
                      onChange={setTrailFadeDelay}
                    />
                    <SwitchControl
                      id="trail-shrink"
                      label="Shrink trail with depth"
                      checked={trailShrink}
                      onCheckedChange={setTrailShrink}
                    />
                  </div>
                </div>
              )}

              <div className="controls-options">
                <SwitchControl
                  id="hide-native"
                  label="Hide native cursor"
                  checked={hideNative}
                  onCheckedChange={setHideNative}
                />
              </div>
            </section>
          )}

          <section className="control-panel control-panel-output" aria-labelledby="panel-output">
            <h3 className="panel-title" id="panel-output">
              Output
            </h3>
            <CodeBlock code={snippet} label="Code" language="tsx" theme={theme} />
          </section>
        </div>
      </section>
    </main>
  );
}
