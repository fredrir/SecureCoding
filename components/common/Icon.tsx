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
      <path d="M14 6a4 4 0 1 1 4 4l-9 9a2 2 0 1 1-3-3l9-9Z" {...stroke} />
    </Frame>
  );
}

export function SecureCodingIcon({
  size = 22,
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="120 60 400 500"
      className={className}
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M271.883 75.125C239.18 75.125 219.953 127.504 210.52 175.75H182.938C170.988 175.75 161.375 185.363 161.375 197.312C161.375 209.262 170.988 218.875 182.938 218.875H204.5V247.625C204.5 262.898 207.465 277.453 212.855 290.75H204.5H186.082C172.426 290.75 161.375 301.801 161.375 315.457C161.375 318.152 161.824 320.758 162.633 323.273L188.598 401.078C154.367 430.547 132.625 474.121 132.625 522.816C132.625 537.551 144.574 549.5 159.309 549.5H479.691C494.426 549.5 506.375 537.551 506.375 522.816C506.375 474.121 484.633 430.547 450.402 401.168L476.367 323.363C477.176 320.848 477.625 318.242 477.625 315.547C477.625 301.891 466.574 290.84 452.918 290.84H434.5H426.145C431.535 277.543 434.5 262.988 434.5 247.715V218.965H456.062C468.012 218.965 477.625 209.352 477.625 197.402C477.625 185.453 468.012 175.84 456.062 175.84H428.48C419.137 127.594 399.82 75.2148 367.117 75.2148C358.492 75.2148 350.047 78.7187 342.41 82.582C335.043 86.2656 325.879 89.5898 319.5 89.5898C313.121 89.5898 303.957 86.2656 296.59 82.582C288.953 78.6289 280.508 75.125 271.883 75.125ZM356.066 510.328L333.785 446.629L358.852 417.43C361.277 414.555 362.625 410.961 362.625 407.188C362.625 398.473 355.617 391.465 346.902 391.465H292.098C283.383 391.465 276.375 398.473 276.375 407.188C276.375 410.961 277.723 414.555 280.148 417.43L305.215 446.629L282.934 510.328L231.723 348.25H263.797C280.328 357.414 299.285 362.625 319.5 362.625C339.715 362.625 358.672 357.414 375.203 348.25H407.277L356.066 510.328ZM319.5 319.5C288.324 319.5 261.82 299.645 251.848 271.883C256.969 274.758 262.898 276.375 269.188 276.375H280.328C295.152 276.375 308.27 266.852 312.941 252.836C315.008 246.547 323.902 246.547 325.969 252.836C330.641 266.852 343.848 276.375 358.582 276.375H369.723C376.012 276.375 381.941 274.758 387.063 271.883C377.09 299.645 350.586 319.5 319.41 319.5H319.5Z"
      />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path
        d="M12 3 4 6v6c0 5 3.6 8.5 8 9 4.4-.5 8-4 8-9V6l-8-3Z"
        {...stroke}
      />
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
      <path
        d="M3 12h4M17 12h4M4 6l3 2M20 6l-3 2M4 18l3-2M20 18l-3-2"
        {...stroke}
      />
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
      <path
        d="M12 4v16M4 20h16M6 8l-3 6h6L6 8ZM18 8l-3 6h6l-3-6Z"
        {...stroke}
      />
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

const ICON_MAP: Record<GameModeIcon, (props: IconProps) => React.ReactElement> =
  {
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
