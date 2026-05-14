import type { GameModeIcon } from "@/domain/gameMode";

interface IconProps {
  size?: number;
  className?: string;
  "aria-hidden"?: boolean;
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Frame({
  size = 22,
  className,
  children,
}: {
  size?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <circle cx="11" cy="11" r="6.5" {...stroke} />
      <path d="m20 20-4-4" {...stroke} />
    </Frame>
  );
}

export function WrenchIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path
        d="M14 6a4 4 0 1 1 4 4l-9 9a2 2 0 1 1-3-3l9-9Z"
        {...stroke}
      />
    </Frame>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M12 3 4 6v6c0 5 3.6 8.5 8 9 4.4-.5 8-4 8-9V6l-8-3Z" {...stroke} />
      <path d="m9 12 2.2 2.2L15 10.5" {...stroke} />
    </Frame>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M4 20h4l11-11-4-4L4 16v4Z" {...stroke} />
      <path d="m14 6 4 4" {...stroke} />
    </Frame>
  );
}

export function BugIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="7" y="8" width="10" height="11" rx="5" {...stroke} />
      <path d="M9 6a3 3 0 0 1 6 0" {...stroke} />
      <path d="M3 12h4M17 12h4M4 6l3 2M20 6l-3 2M4 18l3-2M20 18l-3-2" {...stroke} />
    </Frame>
  );
}

export function MapIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2V6Z" {...stroke} />
      <path d="M9 4v14M15 6v14" {...stroke} />
    </Frame>
  );
}

export function FlagIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M5 21V4h12l-2 4 2 4H5" {...stroke} />
    </Frame>
  );
}

export function DiagramIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="3" y="3" width="6" height="5" rx="1" {...stroke} />
      <rect x="15" y="3" width="6" height="5" rx="1" {...stroke} />
      <rect x="9" y="16" width="6" height="5" rx="1" {...stroke} />
      <path d="M6 8v3h12V8M12 11v5" {...stroke} />
    </Frame>
  );
}

export function ScaleIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M12 4v16M4 20h16M6 8l-3 6h6L6 8ZM18 8l-3 6h6l-3-6Z" {...stroke} />
    </Frame>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" {...stroke} />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" {...stroke} />
    </Frame>
  );
}

export function KeyIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <circle cx="8" cy="14" r="4" {...stroke} />
      <path d="M11 11 21 3M17 7l3 3M14 10l3 3" {...stroke} />
    </Frame>
  );
}

export function LightningIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" {...stroke} />
    </Frame>
  );
}

export function RobotIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="4" y="8" width="16" height="11" rx="3" {...stroke} />
      <path d="M12 4v4M9 13v1M15 13v1M9 19v2M15 19v2" {...stroke} />
    </Frame>
  );
}

export function ReportIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M6 3h9l4 4v14H6z" {...stroke} />
      <path d="M9 12h7M9 16h5M9 8h4" {...stroke} />
    </Frame>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path
        d="M12 3c2 3 5 5 5 9a5 5 0 1 1-10 0c0-2 1-3 2-4-.5 2 .5 3 1 3 0-3 1-5 2-8Z"
        {...stroke}
      />
    </Frame>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <circle cx="12" cy="12" r="4" {...stroke} />
      <path
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"
        {...stroke}
      />
    </Frame>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M20 14A8 8 0 1 1 10 4a7 7 0 0 0 10 10Z" {...stroke} />
    </Frame>
  );
}

export function MonitorIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="3" y="4" width="18" height="12" rx="2" {...stroke} />
      <path d="M9 20h6M12 16v4" {...stroke} />
    </Frame>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="m4 12 5 5L20 6" {...stroke} />
    </Frame>
  );
}

export function CrossIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="m6 6 12 12M18 6 6 18" {...stroke} />
    </Frame>
  );
}

export function TargetIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <circle cx="12" cy="12" r="8.5" {...stroke} />
      <circle cx="12" cy="12" r="4.5" {...stroke} />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </Frame>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M5 12h14M13 5l7 7-7 7" {...stroke} />
    </Frame>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M19 12H5M11 5l-7 7 7 7" {...stroke} />
    </Frame>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z" {...stroke} />
    </Frame>
  );
}

export function GaugeIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M4 15a8 8 0 1 1 16 0" {...stroke} />
      <path d="m12 15 4-5" {...stroke} />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" />
    </Frame>
  );
}

export function TagIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M3 12V4h8l10 10-8 8L3 12Z" {...stroke} />
      <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" />
    </Frame>
  );
}

const ICON_MAP: Record<GameModeIcon, (props: IconProps) => React.ReactElement> = {
  search: SearchIcon,
  wrench: WrenchIcon,
  shield: ShieldIcon,
  pencil: PencilIcon,
  bug: BugIcon,
  map: MapIcon,
  flag: FlagIcon,
  diagram: DiagramIcon,
  scale: ScaleIcon,
  lock: LockIcon,
  key: KeyIcon,
  lightning: LightningIcon,
  robot: RobotIcon,
  report: ReportIcon,
};

export function GameModeIconView({
  name,
  size,
  className,
}: {
  name: GameModeIcon;
  size?: number;
  className?: string;
}) {
  const Component = ICON_MAP[name];
  return <Component size={size} className={className} />;
}
