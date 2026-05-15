"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import type { Components } from "react-markdown";

interface Props {
  children: string;
  className?: string;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-3 mt-4 text-lg font-bold text-app-fg">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-3 text-base font-semibold text-app-fg">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-3 text-sm font-semibold text-app-fg">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-2 text-sm leading-relaxed text-app-fg">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 ml-4 list-disc space-y-1 text-sm text-app-fg">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 ml-4 list-decimal space-y-1 text-sm text-app-fg">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-app-fg">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => (
    <code className="rounded bg-app-bg-elevated px-1 py-0.5 font-mono text-xs text-app-accent">
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-app-accent/40 pl-3 text-sm italic text-app-fg-muted">
      {children}
    </blockquote>
  ),
  img: ({ src, alt }) => {
    if (!src || typeof src !== "string") return null;
    return (
      <span className="my-3 block">
        <Image
          src={src}
          alt={alt ?? ""}
          width={800}
          height={450}
          className="rounded-lg border border-app-border object-contain"
          style={{ maxWidth: "100%", height: "auto" }}
          unoptimized
        />
      </span>
    );
  },
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-app-blue underline underline-offset-2 hover:text-app-accent"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-3 border-app-border" />,
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-app-border bg-app-bg-elevated px-3 py-1.5 text-left font-semibold text-app-fg">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-app-border px-3 py-1.5 text-app-fg">
      {children}
    </td>
  ),
};

export function MarkdownRenderer({ children, className }: Props) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
