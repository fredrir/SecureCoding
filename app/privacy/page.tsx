import type { Metadata } from "next";
import {
  Anchor,
  Divider,
  List,
  ListItem,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { ShieldIcon } from "@/components/common/Icon";

const LAST_UPDATED = "14 May 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for PatchQuest. No personal data is collected.",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </Title>
          <Text c="white" className="opacity-90 pt-2" size="sm">
            Last updated: {LAST_UPDATED}
          </Text>
        </Stack>
      </Paper>

      <Paper
        withBorder
        radius="lg"
        p="lg"
        className="bg-app-surface border-app-border"
      >
        <Stack gap="lg">
          <Text size="sm" className="text-app-fg-muted">
            This privacy policy explains how <strong>PatchQuest</strong> handles
            personal data. The app is built by Fredrik Carsten Hansteen as a
            personal practice resource for TDT4237. It is not officially
            affiliated with NTNU or with the course staff. The app runs entirely
            in your browser.
          </Text>

          <Section title="1. In short">
            <Text size="sm">
              PatchQuest does not collect, store, or share personal data from
              users. The whole app runs locally in your browser. Anything you do
              in the app is processed on your own device and is not sent to us.
            </Text>
            <Text size="sm" mt="sm">
              The page does not use:
            </Text>
            <List size="sm" mt="xs" spacing={2} withPadding>
              <ListItem>logins or user accounts</ListItem>
              <ListItem>contact forms</ListItem>
              <ListItem>analytics tools</ListItem>
              <ListItem>tracking cookies</ListItem>
              <ListItem>advertising cookies</ListItem>
              <ListItem>third-party tracking</ListItem>
              <ListItem>server-side APIs for user data</ListItem>
            </List>
          </Section>

          <Divider color="var(--app-border)" />

          <Section title="2. Who is the data controller?">
            <Text size="sm">The data controller for the website is:</Text>
            <Stack gap={2} mt="xs">
              <Text size="sm" fw={600}>
                Fredrik Carsten Hansteen
              </Text>
              <Text size="sm">
                Email:{" "}
                <Anchor
                  href="mailto:fhansteen@gmail.com"
                  className="text-app-accent"
                >
                  fhansteen@gmail.com
                </Anchor>
              </Text>
            </Stack>
            <Text size="sm" mt="sm" className="text-app-fg-muted">
              The data controller is the party that decides the purpose and
              means of any processing of personal data.
            </Text>
          </Section>

          <Divider color="var(--app-border)" />

          <Section title="3. What personal data do the app process?">
            <Text size="sm">
              The app itself processes no personal data on the servers, because
              there are no servers.
            </Text>
            <Text size="sm" mt="sm">
              All activity in the app (answers to challenges, choices you make,
              statistics, and settings) happens locally in your browser. That
              information is not sent to me, and I do not have access to it.
            </Text>
          </Section>

          <Divider color="var(--app-border)" />

          <Section title="4. Technical delivery of the website">
            <Text size="sm">
              When you visit the website, your browser has to contact the
              hosting provider that delivers it. In that process the hosting
              provider may process technical data such as:
            </Text>
            <List size="sm" mt="xs" spacing={2} withPadding>
              <ListItem>IP address</ListItem>
              <ListItem>time of the request</ListItem>
              <ListItem>browser type</ListItem>
              <ListItem>device type</ListItem>
              <ListItem>which file or page was loaded</ListItem>
            </List>
            <Text size="sm" mt="sm">
              Technical data of this kind is normally used to deliver the
              website, keep it stable, and protect it against abuse. I do not
              use this data to identify you, profile you, or follow you across
              websites.
            </Text>
            <Text size="sm" mt="sm">
              Hosting provider: <strong>Vercel</strong>. See Vercel&apos;s
              privacy information at{" "}
              <Anchor
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-app-accent"
              >
                vercel.com/legal/privacy-policy
              </Anchor>
              .
            </Text>
          </Section>

          <Divider color="var(--app-border)" />

          <Section title="5. Cookies and local storage">
            <Text size="sm">
              PatchQuest does not use cookies for tracking, analytics, or
              marketing.
            </Text>
            <Text size="sm" mt="sm">
              The app uses{" "}
              <code className="font-mono text-xs px-1 py-0.5 bg-app-surface-muted rounded">
                localStorage
              </code>{" "}
              in your browser to store:
            </Text>
            <List size="sm" mt="xs" spacing={2} withPadding>
              <ListItem>your selected theme (light, dark, or system)</ListItem>
              <ListItem>filters for topic and difficulty</ListItem>
              <ListItem>your streak and progress through the drills</ListItem>
              <ListItem>challenges you missed (for review)</ListItem>
              <ListItem>whether exam mode is enabled</ListItem>
            </List>
            <Text size="sm" mt="sm">
              This data is stored only on your own device and is not sent to us.
              The keys are namespaced under{" "}
              <code className="font-mono text-xs px-1 py-0.5 bg-app-surface-muted rounded">
                sct/v1/*
              </code>
              . You can delete it at any time by clearing site data in your
              browser settings, which resets the whole app.
            </Text>
          </Section>

          <Divider color="var(--app-border)" />

          <Section title="6. Sharing personal data">
            <Text size="sm">
              I do not sell, share, or transfer personal data about users to
              third parties. I have no personal data to share, because I do not
              collect any.
            </Text>
            <Text size="sm" mt="sm">
              The hosting provider may process technical data as described above
              in order to deliver the website.
            </Text>
          </Section>

          <Divider color="var(--app-border)" />

          <Section title="7. Retention">
            <Text size="sm">
              I do not store personal data from the app. The data kept in{" "}
              <code className="font-mono text-xs px-1 py-0.5 bg-app-surface-muted rounded">
                localStorage
              </code>{" "}
              stays there until you delete it yourself.
            </Text>
            <Text size="sm" mt="sm">
              Any technical logs at the hosting provider are kept according to
              that provider&apos;s own routines. See the hosting provider&apos;s
              privacy policy for more information.
            </Text>
          </Section>

          <Divider color="var(--app-border)" />

          <Section title="8. Your rights">
            <Text size="sm">
              If I were to process personal data about you, you would have
              rights under data protection law, including the right to access,
              correction, deletion, restriction, and objection.
            </Text>
            <Text size="sm" mt="sm">
              Since the app does not collect or store personal data on our side,
              I normally have no personal data to grant access to, correct, or
              delete.
            </Text>
            <Text size="sm" mt="sm">
              You can reach us at{" "}
              <Anchor
                href="mailto:fhansteen@gmail.com"
                className="text-app-accent"
              >
                fhansteen@gmail.com
              </Anchor>{" "}
              if you have questions.
            </Text>
          </Section>

          <Divider color="var(--app-border)" />

          <Section title="9. Changes">
            <Text size="sm">
              I may update this privacy policy if the app changes, for example
              if I later add login, analytics, contact forms, server features,
              or third-party services.
            </Text>
            <Text size="sm" mt="sm">
              The latest version will always be available on this page.
            </Text>
          </Section>
        </Stack>
      </Paper>

      <Text size="xs" c="dimmed" ta="center">
        Have questions? See the{" "}
        <Anchor href="/qa" className="text-app-accent">
          Q&amp;A page
        </Anchor>
        .
      </Text>
    </Stack>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <Title order={3} m="xs" className="tracking-tight">
        {title}
      </Title>
      {children}
    </section>
  );
}
