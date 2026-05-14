"use client";

import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";

export function AppShellLayout({ children }: { children: React.ReactNode }) {
  const [navOpened, { toggle: toggleNav, close: closeNav }] =
    useDisclosure(false);

  return (
    <AppShell
      header={{ height: 64 }}
      footer={{ height: 44 }}
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { mobile: !navOpened },
      }}
      padding={0}
    >
      <AppShell.Header
        style={{ background: "var(--app-bg-elevated)", borderBottom: "1px solid var(--app-border)" }}
      >
        <Header navOpened={navOpened} onToggleNav={toggleNav} />
      </AppShell.Header>

      <AppShell.Navbar
        style={{ background: "var(--app-bg-elevated)", borderRight: "1px solid var(--app-border)" }}
      >
        <Sidebar onNavigate={closeNav} />
      </AppShell.Navbar>

      <AppShell.Main>
        <div
          style={{
            minHeight: "calc(100vh - 64px - 44px)",
            padding: "clamp(1rem, 2.5vw, 2rem)",
          }}
        >
          {children}
        </div>
      </AppShell.Main>

      <AppShell.Footer
        style={{ background: "var(--app-accent)", border: "none" }}
      >
        <Footer />
      </AppShell.Footer>
    </AppShell>
  );
}
