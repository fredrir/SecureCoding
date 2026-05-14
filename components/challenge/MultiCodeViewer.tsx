import { Stack } from "@mantine/core";
import { CodeViewer } from "./CodeViewer";
import type { CodeSnippet } from "@/domain/challenge";

interface Props {
  snippets: readonly CodeSnippet[];
}

export function MultiCodeViewer({ snippets }: Props) {
  return (
    <Stack gap="sm">
      {snippets.map((s, i) => (
        <CodeViewer
          key={i}
          code={s.code}
          language={s.language}
          filename={s.filename}
        />
      ))}
    </Stack>
  );
}
