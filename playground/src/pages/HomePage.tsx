/*
THESIS: The homepage is the library running. A centered proof stack (mark, offer, install, the live snippet) instead of a playground-first landing or a feature-card marketing page.

OWN-WORLD: Ember on Stone — charcoal/parchment, coral+gold ring mark, system sans, mono only in wells. Existing sticky nav and footer.

STORY: An engineer lands, a ring trail follows the mouse, they see the exact hook, then install or open docs/playground.

FIRST VIEWPORT: Centered column. Hero ring, title, lede, Get Started + Playground, npm/pnpm install, usage snippet. The trail in the mockup is the real cursor.

FORM: Joyride-canon centered stack, user-pinned. No concept-seed (precisely specified). Staging: centered.
*/
import { useState } from "react";
import { Link } from "react-router";
import { Check, Copy } from "lucide-react";
import clsx from "clsx";
import { useCursor, useHasCursor } from "@omriattiya/react-cursor";
import type { Theme } from "../App";
import { BrandLogo } from "../components/BrandLogo";
import { CodeBlock } from "../components/CodeBlock";

const NPM_INSTALL = "npm install @omriattiya/react-cursor";
const PNPM_INSTALL = "pnpm add @omriattiya/react-cursor";

const USAGE = `useCursor({
  preset: "ring",
  color: "#ff7a59",
  smoothing: 1,
  trail: { count: 10, delay: 20 },
});`;

type Installer = "npm" | "pnpm";

const INSTALL: Record<Installer, string> = {
  npm: NPM_INSTALL,
  pnpm: PNPM_INSTALL,
};

function InstallWell({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="install-well">
      <code className="install-command">
        <span className="install-prompt" aria-hidden="true">
          $
        </span>
        {command}
      </code>
      <button
        type="button"
        className={clsx("code-block-copy", copied && "copied")}
        onClick={handleCopy}
        title={copied ? "Copied!" : "Copy"}
        aria-label={copied ? "Copied" : "Copy install command"}
      >
        <span className="copy-icon-stack" aria-hidden="true">
          <Copy size={16} strokeWidth={2} className={clsx("copy-icon", !copied && "is-visible")} />
          <Check
            size={16}
            strokeWidth={2.25}
            className={clsx("copy-icon is-check", copied && "is-visible")}
          />
        </span>
        <span className={clsx("copy-label", copied && "is-visible")}>Copied</span>
      </button>
    </div>
  );
}

export function HomePage({ theme }: { theme: Theme }) {
  const hasCursor = useHasCursor();
  const [installer, setInstaller] = useState<Installer>("npm");

  useCursor({
    preset: "ring",
    color: "#ff7a59",
    smoothing: 1,
    trail: { count: 10, delay: 20 },
  });

  return (
    <main className="page page-home">
      <header className="home-hero">
        <BrandLogo variant="home" />
        <h1 className="home-title">react-cursor</h1>
        <p className="home-lede">
          Custom cursors for React. Native, preset, or any element — one API.
        </p>
        {!hasCursor && (
          <p className="warning" role="status">
            Touch-only device detected — custom cursors are disabled.
          </p>
        )}
        <div className="home-cta-row">
          <Link to="/getting-started" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/playground" className="btn btn-ghost">
            Playground
          </Link>
        </div>
      </header>

      <div className="home-install">
        <div className="install-tabs" role="tablist" aria-label="Package manager">
          <button
            type="button"
            role="tab"
            id="install-tab-npm"
            aria-controls="install-panel"
            aria-selected={installer === "npm"}
            className="install-tab"
            data-state={installer === "npm" ? "on" : "off"}
            onClick={() => setInstaller("npm")}
          >
            npm
          </button>
          <button
            type="button"
            role="tab"
            id="install-tab-pnpm"
            aria-controls="install-panel"
            aria-selected={installer === "pnpm"}
            className="install-tab"
            data-state={installer === "pnpm" ? "on" : "off"}
            onClick={() => setInstaller("pnpm")}
          >
            pnpm
          </button>
        </div>
        <div
          id="install-panel"
          role="tabpanel"
          aria-labelledby={installer === "npm" ? "install-tab-npm" : "install-tab-pnpm"}
        >
          <InstallWell command={INSTALL[installer]} />
        </div>
      </div>

      <div className="home-proof">
        <CodeBlock code={USAGE} label="usage example" theme={theme} />
        <section className="home-points-card" aria-labelledby="home-points-label">
          <div className="code-block-toolbar">
            <span className="code-block-label" id="home-points-label">
              features
            </span>
          </div>
          <ul className="home-points">
            <li>
              <strong>Lightweight</strong>
              <span>&lt; 10 kb gzip, zero runtime deps</span>
            </li>
            <li>
              <strong>React 19</strong>
              <span>
                <code>useCursor</code> + <code>CursorZone</code>, SSR-safe
              </span>
            </li>
            <li>
              <strong>One API</strong>
              <span>native CSS, presets, or any element</span>
            </li>
            <li>
              <strong>Motion</strong>
              <span>smoothing, trails, velocity, click effects</span>
            </li>
            <li>
              <strong>Accessible</strong>
              <span>off on touch; respects reduced motion</span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
