export const CODE_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "go",
  "php",
  "ruby",
  "sql",
  "html",
  "bash",
  "yaml",
  "json",
  "http",
  "plaintext",
] as const;

export type CodeLanguage = (typeof CODE_LANGUAGES)[number];

export const LANGUAGE_LABEL: Record<CodeLanguage, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  csharp: "C#",
  go: "Go",
  php: "PHP",
  ruby: "Ruby",
  sql: "SQL",
  html: "HTML",
  bash: "Bash",
  yaml: "YAML",
  json: "JSON",
  http: "HTTP",
  plaintext: "Text",
};

const LANGUAGE_EXTENSION: Record<CodeLanguage, string> = {
  javascript: "js",
  typescript: "ts",
  python: "py",
  java: "java",
  csharp: "cs",
  go: "go",
  php: "php",
  ruby: "rb",
  sql: "sql",
  html: "html",
  bash: "sh",
  yaml: "yml",
  json: "json",
  http: "http",
  plaintext: "txt",
};

const LANGUAGE_DEFAULT_BASENAME: Record<CodeLanguage, string> = {
  javascript: "snippet",
  typescript: "snippet",
  python: "snippet",
  java: "Snippet",
  csharp: "Snippet",
  go: "snippet",
  php: "snippet",
  ruby: "snippet",
  sql: "query",
  html: "page",
  bash: "script",
  yaml: "config",
  json: "data",
  http: "request",
  plaintext: "notes",
};

export function defaultFilenameFor(language: CodeLanguage): string {
  return `${LANGUAGE_DEFAULT_BASENAME[language]}.${LANGUAGE_EXTENSION[language]}`;
}
