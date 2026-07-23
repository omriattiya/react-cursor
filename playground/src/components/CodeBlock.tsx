import { useState } from "react";
import { Highlight, themes, type Language } from "prism-react-renderer";
import { Check, Copy } from "lucide-react";
import clsx from "clsx";
import type { Theme } from "../App";

type CodeBlockProps = {
  code: string;
  label?: string;
  language?: Language;
  theme?: Theme;
  className?: string;
};

export function CodeBlock({
  code,
  label,
  language = "tsx",
  theme = "dark",
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const prismTheme = theme === "light" ? themes.github : themes.oneDark;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className={clsx("code-block-wrap", className)}>
      <div className="code-block-toolbar">
        {label ? <span className="code-block-label">{label}</span> : <span />}
        <button
          type="button"
          className={clsx("code-block-copy", copied && "copied")}
          onClick={handleCopy}
          title={copied ? "Copied!" : "Copy"}
          aria-label={copied ? "Copied" : "Copy code"}
        >
          <span className="copy-icon-stack" aria-hidden="true">
            <Copy
              size={16}
              strokeWidth={2}
              className={clsx("copy-icon", !copied && "is-visible")}
            />
            <Check
              size={16}
              strokeWidth={2.25}
              className={clsx("copy-icon is-check", copied && "is-visible")}
            />
          </span>
          <span className={clsx("copy-label", copied && "is-visible")}>Copied</span>
        </button>
      </div>
      <Highlight theme={prismTheme} code={code.trimEnd()} language={language}>
        {({ className: preClass, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={clsx("code-block", preClass)} style={{ ...style, background: "transparent" }}>
            <code>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}
