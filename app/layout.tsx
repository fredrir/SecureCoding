import type { Metadata } from "next";
import { Open_Sans, JetBrains_Mono } from "next/font/google";

// globals.css must come first: it declares `@layer theme, base, mantine,
// components, utilities;`. CSS cascade-layer order is fixed by the first time
// each name appears, so if Mantine's `@layer mantine { ... }` block loaded
// first it would claim position #1 and Tailwind's preflight (in `base`) would
// end up overriding all Mantine padding/border/radius styles.
import "./globals.css";
import "@mantine/core/styles.layer.css";
import "@mantine/notifications/styles.layer.css";

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";

import { themeOverride } from "@/theme/theme";
import { AppShellLayout } from "@/components/layout/AppShellLayout";

const sans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PatchQuest",
    template: "%s · PatchQuest",
  },
  description:
    "Practice secure coding, vulnerability identification, threat modeling, " +
    "GDPR reasoning, and cryptography for TDT4237 - Software Security and Data Privacy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      {...mantineHtmlProps}
      className={`${sans.variable} ${mono.variable} h-full`}
    >
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>

      <body className="min-h-screen app-backdrop">
        <MantineProvider theme={themeOverride} defaultColorScheme="auto">
          <ModalsProvider>
            <Notifications position="top-right" autoClose={3500} />
            <AppShellLayout>{children}</AppShellLayout>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
