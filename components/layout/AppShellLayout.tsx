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
      className="app-shell-flow-footer-mobile"
    >
      <AppShell.Header className="bg-app-bg-elevated border-b border-app-border">
        <Header navOpened={navOpened} onToggleNav={toggleNav} />
      </AppShell.Header>

      <AppShell.Navbar className="bg-app-bg-elevated border-r border-app-border">
        <Sidebar onNavigate={closeNav} />
      </AppShell.Navbar>

      <AppShell.Main>
        <div className="min-h-[calc(100vh-64px-44px)] p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </AppShell.Main>

      <AppShell.Footer className="app-shell-footer-flow-mobile bg-app-accent border-0">
        <Footer />
      </AppShell.Footer>
    </AppShell>
  );
}
