"use client";

import { useMemo } from "react";
import { highlightLine } from "@/lib/highlight";
import {
  LANGUAGE_LABEL,
  defaultFilenameFor,
  type CodeLanguage,
} from "@/domain/language";

export interface CodeLineState {
  hover?: boolean;
  selected?: boolean;
  correct?: boolean;
  incorrect?: boolean;
}

export interface CodeViewerProps {
  code: string;
  language: CodeLanguage;
  /** Per-line visual state, keyed by 1-based line number. */
  lineStates?: Record<number, CodeLineState>;
  /** Click handler enables interactive line selection. */
  onLineClick?: (lineNumber: number) => void;
  /** Optional aria label for the whole block. */
  ariaLabel?: string;
  /** Display filename in the header bar. Defaults from language. */
  filename?: string;
  /** Hide the IDE-style header bar (filename + traffic lights). */
  showHeader?: boolean;
}

/**
 * Read-only/interactive monospaced code block. The same component renders
 * static snippets in feedback views and interactive snippets in mode runners.
 * Line-level states (selected / correct / incorrect) drive the highlight; the
 * runner owns the truth and just declares it here.
 */
export function CodeViewer({
  code,
  language,
  lineStates,
  onLineClick,
  ariaLabel,
  filename,
  showHeader = true,
}: CodeViewerProps) {
  const lines = useMemo(() => code.split("\n"), [code]);
  const interactive = Boolean(onLineClick);
  const displayName =
    filename ??
    (language !== "plaintext" ? defaultFilenameFor(language) : undefined);
  const headerVisible = showHeader && Boolean(displayName);

  return (
    <div className="code-block">
      {headerVisible ? (
        <div className="code-block__header" aria-hidden>
          <div className="code-block__dots">
            <span className="code-block__dot code-block__dot--red" />
            <span className="code-block__dot code-block__dot--amber" />
            <span className="code-block__dot code-block__dot--green" />
          </div>
          <div className="code-block__filename">
            <span>{displayName}</span>
          </div>
          <div className="code-block__lang">{LANGUAGE_LABEL[language]}</div>
        </div>
      ) : null}
      <div
        className="code-block__body"
        role={interactive ? "listbox" : undefined}
        aria-label={ariaLabel}
        aria-multiselectable={interactive ? true : undefined}
      >
        {lines.map((line, idx) => {
          const lineNumber = idx + 1;
          const state = lineStates?.[lineNumber];
          const className = [
            "code-block__row",
            interactive ? "code-block__row--interactive" : "",
            state?.selected ? "code-block__row--selected" : "",
            state?.correct ? "code-block__row--correct" : "",
            state?.incorrect ? "code-block__row--incorrect" : "",
          ]
            .filter(Boolean)
            .join(" ");

          const html = highlightLine(line, language);

          return (
            <div
              key={lineNumber}
              className={className}
              role={interactive ? "option" : undefined}
              aria-selected={interactive ? Boolean(state?.selected) : undefined}
              tabIndex={interactive ? 0 : -1}
              onClick={
                interactive ? () => onLineClick?.(lineNumber) : undefined
              }
              onKeyDown={
                interactive
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onLineClick?.(lineNumber);
                      }
                    }
                  : undefined
              }
            >
              <div className="code-block__gutter">{lineNumber}</div>
              <div
                className="code-block__line"
                dangerouslySetInnerHTML={{ __html: html || "&nbsp;" }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
