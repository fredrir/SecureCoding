import { Paper, Stack, Text } from "@mantine/core";

interface Props {
  label?: string;
  question?: string;
}

const QuestionBox = ({ label = "Question", question }: Props) => {
  if (!question) {
    return null;
  }

  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
      className="bg-app-surface border-app-border"
    >
      <Stack gap="md">
        <div className="text-xs uppercase font-bold text-app-fg-muted tracking-wider">
          {label}
        </div>
        <Text size="sm" fw={500} style={{ whiteSpace: "pre-wrap" }}>
          {question}
        </Text>
      </Stack>
    </Paper>
  );
};

export default QuestionBox;
