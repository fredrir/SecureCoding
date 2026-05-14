<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

In a Server Component, never use Mantine's dot-syntax (Accordion.Item, List.Item, AppShell.Header, Tabs.List, etc.). Import the dedicated named export. Keep "use client" only on files that actually need state, effects, or browser APIs

Refrain from using em-dashes.

<!-- END:nextjs-agent-rules -->
