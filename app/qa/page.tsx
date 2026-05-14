import type { Metadata } from "next";
import {
  Accordion,
  AccordionControl,
  AccordionItem,
  AccordionPanel,
  Anchor,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { TargetIcon } from "@/components/common/Icon";
import { QaItems } from "./QaItems";

export const metadata: Metadata = {
  title: "Q&A",
  description:
    "Common questions about PatchQuest, the practice app for TDT4237 Software Security and Data Privacy.",
};

export default function QAPage() {
  return (
    <Stack gap="lg" maw={760} mx="auto" w="100%">
      <Paper
        withBorder
        radius="lg"
        p="lg"
        className="bg-app-accent border-transparent text-white"
      >
        <Stack gap={4}>
          <Title order={1} c="white" className="tracking-tight">
            Questions &amp; Answers
          </Title>
          <Text c="white" className="opacity-90 pt-2" size="sm">
            Some answers to common questions about PatchQuest. If you have a
            question that is not answered here, please email:{" "}
            <Anchor
              href="mailto:fhansteen@gmail.com 
            "
              className="text-white underline"
            >
              fhansteen@gmail.com
            </Anchor>
          </Text>
        </Stack>
      </Paper>

      <Paper
        withBorder
        radius="lg"
        p="md"
        className="bg-app-surface border-app-border"
      >
        <Accordion multiple variant="separated" radius="md">
          {QaItems.map((item, i) => (
            <AccordionItem key={i} value={`q-${i}`}>
              <AccordionControl className="hover:bg-app-accent-soft transition-colors duration-150">
                <Text fw={600} size="sm">
                  {item.q}
                </Text>
              </AccordionControl>
              <AccordionPanel>{item.a}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Paper>

      <Text size="xs" c="dimmed" ta="center">
        Did not find the answer? Email{" "}
        <Anchor href="mailto:fhansteen@gmail.com" className="text-app-accent">
          fhansteen@gmail.com
        </Anchor>
        .
      </Text>
    </Stack>
  );
}
