import { Anchor, Stack, Text } from "@mantine/core";

interface QAItem {
  q: string;
  a: React.ReactNode;
}

export const QaItems: QAItem[] = [
  {
    q: "What is SecureCoding Training?",
    a: (
      <Text size="sm">
        A practice app for the NTNU course{" "}
        <strong>TDT4237 Software Security and Data Privacy</strong>. Made by
        Fredrik Carsten Hansteen. It turns the syllabus into short, repeatable
        drills: spot vulnerabilities in code, pick the right patch, write
        exam-style answers, and sprint through multiple-choice questions.
      </Text>
    ),
  },
  {
    q: "Do I need to log in?",
    a: (
      <Text size="sm">
        No. There are no user accounts and no login. Everything runs locally in
        your browser.
      </Text>
    ),
  },
  {
    q: "Where is my progress stored?",
    a: (
      <Text size="sm">
        In your browser&apos;s{" "}
        <code className="font-mono text-xs px-1 py-0.5 bg-app-surface-muted rounded">
          localStorage
        </code>{" "}
        under the namespace{" "}
        <code className="font-mono text-xs px-1 py-0.5 bg-app-surface-muted rounded">
          sct/v1/*
        </code>
        . Your streak, statistics, filters, theme, and missed challenges live
        there, only on your own device. See the{" "}
        <Anchor href="/privacy" className="text-app-accent">
          privacy policy
        </Anchor>{" "}
        for details.
      </Text>
    ),
  },
  {
    q: "Does progress sync between devices?",
    a: (
      <Text size="sm">
        No. Because everything is kept locally in the browser, each device and
        each browser will have its own progress. That is a deliberate choice so
        we can avoid collecting personal data.
      </Text>
    ),
  },
  {
    q: "How do I reset my progress?",
    a: (
      <Text size="sm">
        Clear site data for this site in your browser settings, or use DevTools
        then Application then Local Storage. That removes every key under{" "}
        <code className="font-mono text-xs px-1 py-0.5 bg-app-surface-muted rounded">
          sct/v1/*
        </code>{" "}
        and the app starts fresh.
      </Text>
    ),
  },
  {
    q: "Which practice modes are available?",
    a: (
      <Stack gap={4}>
        <Text size="sm">The active modes are:</Text>
        <Text size="sm">
          <strong>Vulnerability Searching</strong>. Read a snippet and tag the
          lines you suspect.
        </Text>
        <Text size="sm">
          <strong>Find &amp; Fix</strong>. Locate the vulnerable lines, then
          pick the correct patch.
        </Text>
        <Text size="sm">
          <strong>Explain Like the Exam</strong>. Write a 3 to 6 sentence
          answer; the app scores it against expected keywords.
        </Text>
        <Text size="sm">
          <strong>Multiple Choice Sprint</strong>. 20 quick exam-style questions
          with instant feedback.
        </Text>
        <Text size="sm" mt="xs" className="text-app-fg-muted">
          More modes (STRIDE threat modeling, risk scoring, crypto misuse, GDPR
          reasoning, AI code review, and others) appear on the dashboard as{" "}
          <em>coming soon</em>.
        </Text>
      </Stack>
    ),
  },
  {
    q: "What is exam mode?",
    a: (
      <Text size="sm">
        In exam mode per-question feedback is hidden until the run is over, so
        you can practice under conditions closer to the real exam. You can
        toggle it from the button at the top of the page.
      </Text>
    ),
  },
  {
    q: "What do the Topic and Difficulty filters do?",
    a: (
      <Stack gap={4}>
        <Text size="sm">
          <strong>Topic</strong> narrows the challenges to one or more syllabus
          areas (web, authentication, cryptography, GDPR, and so on).
        </Text>
        <Text size="sm">
          <strong>Difficulty</strong> filters by <em>Intro</em>, <em>Core</em>,
          or <em>Advanced</em>. With nothing selected, all challenges are shown.
        </Text>
      </Stack>
    ),
  },
  {
    q: "The challenge count on a mode card looks off. Why?",
    a: (
      <Text size="sm">
        Each card shows the count after your filters are applied. Clear the
        filters at the top to see the full pool again.
      </Text>
    ),
  },
  {
    q: "Does the app work offline?",
    a: (
      <Text size="sm">
        After the first load, all practice logic runs in the browser. The app is
        not an installable PWA, so the assets still have to be fetched the first
        time. Once the pages are loaded, the logic works without a network.
      </Text>
    ),
  },
  {
    q: "Why is the syntax highlighting so simple?",
    a: (
      <Text size="sm">
        The app uses a small built-in highlighter (no{" "}
        <code className="font-mono text-xs px-1 py-0.5 bg-app-surface-muted rounded">
          highlight.js
        </code>{" "}
        or{" "}
        <code className="font-mono text-xs px-1 py-0.5 bg-app-surface-muted rounded">
          prism
        </code>
        ) to keep the bundle size down and the page fast.
      </Text>
    ),
  },
  {
    q: "Can I suggest new challenges?",
    a: (
      <Text size="sm">
        Yes. Send an email to{" "}
        <Anchor href="mailto:fhansteen@gmail.com" className="text-app-accent">
          fhansteen@gmail.com
        </Anchor>{" "}
        or just open a PR on{" "}
        <Anchor
          href="https://github.com/fredrir/SecureCoding"
          className="text-app-accent"
        >
          GitHub
        </Anchor>
        .
      </Text>
    ),
  },
  {
    q: "Who is behind this?",
    a: (
      <Text size="sm">
        The app is built by Fredrik Carsten Hansteen as a personal practice
        resource for TDT4237. It is not officially affiliated with NTNU or with
        the course staff.
      </Text>
    ),
  },
];
