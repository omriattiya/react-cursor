import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Moon, Package, Sun } from "lucide-react";
import {
  CursorProvider,
  type ClickEffectConfig,
  type ClickEffectVariant,
} from "@omriattiya/react-cursor";
import { GettingStartedPage } from "./pages/GettingStartedPage";
import { HomePage } from "./pages/HomePage";
import { PlaygroundPage } from "./pages/PlaygroundPage";

export const GITHUB_URL = "https://github.com/omriattiya/react-cursor";
export const NPM_URL = "https://www.npmjs.com/package/@omriattiya/react-cursor";

type Page = "home" | "playground" | "getting-started";
export type Theme = "dark" | "light";

export type PlaygroundClickEffect = {
  enabled: boolean;
  variant: ClickEffectVariant;
  color: string;
  size: number;
  duration: number;
};

function getInitialTheme(): Theme {
  const stored = localStorage.getItem("playground-theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function toClickEffectConfig(state: PlaygroundClickEffect): false | ClickEffectConfig {
  if (!state.enabled) return false;
  return {
    variant: state.variant,
    color: state.color,
    size: state.size,
    duration: state.duration,
  };
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export function App() {
  const [page, setPage] = useState<Page>("home");
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [clickEffect, setClickEffect] = useState<PlaygroundClickEffect>({
    enabled: false,
    variant: "ripple",
    color: "rgba(255, 122, 89, 0.75)",
    size: 48,
    duration: 450,
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("playground-theme", theme);
  }, [theme]);

  return (
    <CursorProvider clickEffect={toClickEffectConfig(clickEffect)}>
      <div className="app">
        <header className="navbar">
          <div className="navbar-inner">
            <button type="button" className="brand" onClick={() => setPage("home")}>
              <span className="brand-mark" aria-hidden="true" />
              <span className="brand-name">react-cursor</span>
            </button>

            <Tabs.Root
              value={page}
              onValueChange={(value) => setPage(value as Page)}
              className="tabs-root"
            >
              <Tabs.List className="tabs" aria-label="Pages">
                <Tabs.Trigger value="home" className="tab">
                  Home
                </Tabs.Trigger>
                <Tabs.Trigger value="playground" className="tab">
                  Playground
                </Tabs.Trigger>
                <Tabs.Trigger value="getting-started" className="tab">
                  Getting Started
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>

            <div className="navbar-actions">
              <a
                className="icon-button"
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                title="GitHub repository"
                aria-label="GitHub repository"
              >
                <GitHubIcon />
              </a>
              <a
                className="icon-button"
                href={NPM_URL}
                target="_blank"
                rel="noreferrer"
                title="npm package"
                aria-label="npm package"
              >
                <Package size={18} strokeWidth={1.75} aria-hidden="true" />
              </a>
              <button
                type="button"
                className="icon-button"
                onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              >
                <span className="theme-icon" aria-hidden="true">
                  {theme === "dark" ? (
                    <Sun size={18} strokeWidth={1.75} />
                  ) : (
                    <Moon size={18} strokeWidth={1.75} />
                  )}
                </span>
              </button>
            </div>
          </div>
        </header>

        {page === "home" ? (
          <HomePage theme={theme} onNavigate={(next) => setPage(next)} />
        ) : page === "playground" ? (
          <PlaygroundPage
            theme={theme}
            clickEffect={clickEffect}
            onClickEffectChange={setClickEffect}
          />
        ) : (
          <GettingStartedPage theme={theme} />
        )}

        <footer className="footer">
          <div className="footer-inner">
            <span className="footer-package">@omriattiya/react-cursor</span>
            <span className="footer-credit">Open source · by Omri Attiya</span>
          </div>
        </footer>
      </div>
    </CursorProvider>
  );
}
