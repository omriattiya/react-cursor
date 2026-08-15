import { useMemo, useState } from "react";
import * as Label from "@radix-ui/react-label";
import * as Slider from "@radix-ui/react-slider";
import * as Switch from "@radix-ui/react-switch";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import {
  PresetVisual,
  useCursor,
  useHasCursor,
  type ClickEffectVariant,
  type CursorInput,
  type PresetName,
} from "@omriattiya/react-cursor";
import type { PlaygroundClickEffect, Theme } from "../App";
import { CodeBlock } from "../components/CodeBlock";

function spotlightColor(theme: Theme) {
  return theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
}

const SPOTLIGHT_ALPHA = 0.12;

function parseHex6(color: string): string | null {
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : null;
}

function parseHex8(color: string): { hex6: string; alpha: number } | null {
  const match = /^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})$/.exec(color);
  if (!match?.[1] || !match[2]) return null;
  return { hex6: `#${match[1]}`, alpha: parseInt(match[2], 16) / 255 };
}

function rgbaParts(color: string): { hex6: string; alpha: number } | null {
  const match = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/.exec(color);
  if (!match) return null;
  const r = Number(match[1]);
  const g = Number(match[2]);
  const b = Number(match[3]);
  const alpha = match[4] === undefined ? 1 : Number(match[4]);
  return {
    hex6: `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`,
    alpha,
  };
}

function rgbaToHex(color: string): string | null {
  return rgbaParts(color)?.hex6 ?? null;
}

function colorPickerValue(color: string | undefined): string {
  if (!color) return "#ff7a59";
  return (
    parseHex6(color) ??
    parseHex8(color)?.hex6 ??
    rgbaToHex(color) ??
    "#ff7a59"
  );
}

/** Read alpha from a CSS color; opaque when unspecified. */
function colorAlpha(color: string): number {
  return parseHex8(color)?.alpha ?? rgbaParts(color)?.alpha ?? 1;
}

function hexToRgba(hex: string, alpha: number): string {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!match?.[1]) return hex;
  const n = parseInt(match[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  if (alpha >= 1) return `#${match[1]}`;
  const a = Math.round(alpha * 1000) / 1000;
  return `rgba(${r},${g},${b},${a})`;
}

/** Swatch pick: keep existing alpha from the current color string. */
function clickColorFromPicker(hex: string, current: string): string {
  return hexToRgba(hex, colorAlpha(current));
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

/** Card-preview sizes — large enough to read as the primary glyph. */
const PREVIEW_SIZE: Record<PresetName, number> = {
  dot: 22,
  ring: 36,
  pulse: 36,
  arrow: 32,
  hand: 34,
  crosshair: 32,
  wand: 34,
  comet: 28,
  spotlight: 40,
  emoji: 32,
  text: 16,
  image: 32,
};

const TIP_HOTSPOT = new Set<PresetName>(["arrow", "hand", "wand"]);

function PresetCardPreview({ name, theme }: { name: PresetName; theme: Theme }) {
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
      <span className="preset-card-icon preset-card-icon-tip" aria-hidden>
        {visual}
      </span>
    );
  }
  return (
    <span className="preset-card-icon" aria-hidden>
      <span className="preset-card-icon-origin">{visual}</span>
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

function buildClickEffectSnippet(clickEffect: PlaygroundClickEffect): string {
  if (!clickEffect.enabled) {
    return `<CursorProvider>\n  <App />\n</CursorProvider>`;
  }
  return [
    "<CursorProvider",
    "  clickEffect={{",
    `    variant: "${clickEffect.variant}",`,
    `    color: "${clickEffect.color}",`,
    `    size: ${clickEffect.size},`,
    `    duration: ${clickEffect.duration},`,
    "  }}",
    ">",
    "  <App />",
    "</CursorProvider>",
  ].join("\n");
}

function isCssColor(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (typeof CSS !== "undefined" && typeof CSS.supports === "function") {
    return CSS.supports("color", trimmed);
  }
  return Boolean(parseHex6(trimmed) ?? parseHex8(trimmed) ?? rgbaParts(trimmed));
}

function ColorControl({
  id,
  label,
  value,
  swatchAriaLabel,
  span,
  onSwatchChange,
  onTextChange,
}: {
  id: string;
  label: string;
  value: string;
  swatchAriaLabel: string;
  span?: boolean;
  onSwatchChange: (hex: string) => void;
  onTextChange: (value: string) => void;
}) {
  const valid = isCssColor(value);
  const textId = `${id}-text`;
  const swatchId = `${id}-swatch`;

  return (
    <div className={span ? "control control-span" : "control"}>
      <Label.Root htmlFor={textId} className="field-label">
        {label}
      </Label.Root>
      <div className="color-field">
        <span className="color-swatch">
          <span
            className="color-swatch-fill"
            style={valid ? { background: value } : undefined}
            aria-hidden
          />
          <input
            id={swatchId}
            type="color"
            aria-label={swatchAriaLabel}
            value={colorPickerValue(value)}
            onChange={(e) => onSwatchChange(e.target.value)}
          />
        </span>
        <input
          id={textId}
          type="text"
          className="text-input"
          value={value}
          onChange={(e) => onTextChange(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={!valid}
        />
      </div>
    </div>
  );
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

export function PlaygroundPage({
  theme,
  clickEffect,
  onClickEffectChange,
}: {
  theme: Theme;
  clickEffect: PlaygroundClickEffect;
  onClickEffectChange: (next: PlaygroundClickEffect) => void;
}) {
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
            ...(stretch > 1 ? { velocity: { stretch } } : {}),
            ...motionOptions,
          };

  const snippet = buildSnippet(mode, cursorInput);
  const clickEffectSnippet = buildClickEffectSnippet(clickEffect);

  const patchClickEffect = (patch: Partial<PlaygroundClickEffect>) =>
    onClickEffectChange({ ...clickEffect, ...patch });

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
                  className="preset-cards"
                  value={presetName}
                  onValueChange={(value) => {
                    if (value) setPresetName(value as PresetName);
                  }}
                  aria-labelledby="preset-label"
                >
                  {PRESET_NAMES.map((name) => (
                    <ToggleGroup.Item key={name} value={name} className="preset-card">
                      <PresetCardPreview name={name} theme={theme} />
                      <span className="preset-card-name">{name}</span>
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
                  <ColorControl
                    id="color"
                    label="Color"
                    value={current.color ?? ""}
                    swatchAriaLabel="Color swatch"
                    onSwatchChange={(hex) =>
                      setOverride({ color: colorFromPicker(hex, presetName) })
                    }
                    onTextChange={(color) => setOverride({ color })}
                  />
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

                {mode === "preset" && (
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
                )}
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
                      max={20}
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
                      label="Fade after each segment stops"
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

          <section className="control-panel" aria-labelledby="panel-click">
            <h3 className="panel-title" id="panel-click">
              Click Effect
            </h3>
            <p>
              Provider-level press feedback at the click point — works with native and custom
              cursors. Click anywhere to preview.
            </p>
            <div className="controls-options">
              <SwitchControl
                id="click-effect-enabled"
                label="Click Effect"
                checked={clickEffect.enabled}
                onCheckedChange={(enabled) => patchClickEffect({ enabled })}
              />
            </div>

            {clickEffect.enabled && (
              <div className="controls-subpanel">
                <div className="controls-grid">
                  <div className="control control-span">
                    <span className="field-label" id="click-variant-label">
                      Variant
                    </span>
                    <ToggleGroup.Root
                      type="single"
                      className="chips"
                      value={clickEffect.variant}
                      onValueChange={(value) => {
                        if (value) patchClickEffect({ variant: value as ClickEffectVariant });
                      }}
                      aria-labelledby="click-variant-label"
                    >
                      <ToggleGroup.Item className="chip" value="ripple">
                        Ripple
                      </ToggleGroup.Item>
                      <ToggleGroup.Item className="chip" value="rays">
                        Rays
                      </ToggleGroup.Item>
                    </ToggleGroup.Root>
                  </div>
                  <ColorControl
                    id="click-color"
                    label="Color"
                    value={clickEffect.color}
                    swatchAriaLabel="Click effect color swatch"
                    span
                    onSwatchChange={(hex) =>
                      patchClickEffect({
                        color: clickColorFromPicker(hex, clickEffect.color),
                      })
                    }
                    onTextChange={(color) => patchClickEffect({ color })}
                  />
                  <RangeControl
                    id="click-size"
                    label="Size"
                    valueLabel={`${clickEffect.size}px`}
                    value={clickEffect.size}
                    min={24}
                    max={120}
                    step={4}
                    onChange={(size) => patchClickEffect({ size })}
                  />
                  <RangeControl
                    id="click-duration"
                    label="Duration"
                    valueLabel={`${clickEffect.duration}ms`}
                    value={clickEffect.duration}
                    min={150}
                    max={1000}
                    step={50}
                    onChange={(duration) => patchClickEffect({ duration })}
                  />
                </div>
              </div>
            )}
          </section>

          <section className="control-panel control-panel-output" aria-labelledby="panel-output">
            <h3 className="panel-title" id="panel-output">
              Output
            </h3>
            <CodeBlock code={snippet} label="Cursor" language="tsx" theme={theme} />
            <CodeBlock code={clickEffectSnippet} label="Provider" language="tsx" theme={theme} />
          </section>
        </div>
      </section>
    </main>
  );
}
