import { useEffect, useState } from "react";
import { GettingStartedPage } from "./pages/GettingStartedPage";
import { PlaygroundPage } from "./pages/PlaygroundPage";

export const GITHUB_URL = "https://github.com/omriattiya/react-cursor";
export const NPM_URL = "https://www.npmjs.com/package/@omriattiya/react-cursor";

type Page = "playground" | "getting-started";
type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  const stored = localStorage.getItem("playground-theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function NpmIcon() {
  return (
    <svg viewBox="0 0 27.23 27.23" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M0 0v27.23h27.23V0H0zm22.46 22.46h-4.03V9.53h-4.02v12.93H4.77V4.77h17.69v17.69z" />
    </svg>
  );
}

function ThemeIcon({ theme }: { theme: Theme }) {
  return theme === "dark" ? (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function App() {
  const [page, setPage] = useState<Page>("playground");
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("playground-theme", theme);
  }, [theme]);

  return (
    <div className="app">
      <header className="navbar">
        <div className="navbar-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true" />
            <span className="brand-name">react-cursor</span>
          </div>

          <nav className="tabs" aria-label="Pages">
            <button
              className={page === "playground" ? "tab active" : "tab"}
              onClick={() => setPage("playground")}
            >
              Playground
            </button>
            <button
              className={page === "getting-started" ? "tab active" : "tab"}
              onClick={() => setPage("getting-started")}
            >
              Getting Started
            </button>
          </nav>

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
              <NpmIcon />
            </a>
            <button
              className="icon-button"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              aria-label="Toggle theme"
            >
              <ThemeIcon theme={theme} />
            </button>
          </div>
        </div>
      </header>

      {page === "playground" ? <PlaygroundPage /> : <GettingStartedPage />}
    </div>
  );
}
