"use client";

import { useSyncExternalStore } from "react";
import {
  ActionIcon,
  Tooltip,
  useMantineColorScheme,
  type MantineColorScheme,
} from "@mantine/core";
import { MonitorIcon, MoonIcon, SunIcon } from "./Icon";

const noopSubscribe = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

/**
 * Returns `false` during SSR and the first client render, then `true`. Lets
 * components defer rendering of client-only state (e.g. resolved color scheme)
 * past hydration without tripping the eslint rule against setState in effects.
 */
function useIsHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, getTrue, getFalse);
}

const NEXT: Record<MantineColorScheme, MantineColorScheme> = {
  light: "dark",
  dark: "light",
  auto: "light",
};

const LABEL: Record<MantineColorScheme, string> = {
  light: "Light theme",
  dark: "Dark theme",
  auto: "System theme",
};

const ICON: Record<MantineColorScheme, (props: { size?: number }) => React.ReactElement> = {
  light: SunIcon,
  dark: MoonIcon,
  auto: MonitorIcon,
};

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  // The color scheme is resolved by `ColorSchemeScript` at runtime, so the
  // SSR snapshot is always `auto`. Hold the SSR value until after hydration
  // to avoid a mismatch on the icon/label.
  const hydrated = useIsHydrated();
  const displayScheme: MantineColorScheme = hydrated ? colorScheme : "auto";
  const next = NEXT[displayScheme];
  const Icon = ICON[displayScheme];

  return (
    <Tooltip label={`Click for ${LABEL[next]}`}>
      <ActionIcon
        size="lg"
        variant="default"
        aria-label={`Switch to ${LABEL[next]}`}
        onClick={() => setColorScheme(next)}
      >
        <Icon size={18} />
      </ActionIcon>
    </Tooltip>
  );
}
