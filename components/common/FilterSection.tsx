interface FilterSectionProps {
  icon: React.ReactNode;
  label: string;
  selected: number;
  total: number;
  onClear?: () => void;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}

export function FilterSection({
  icon,
  label,
  selected,
  total,
  onClear,
  trailing,
  children,
}: FilterSectionProps) {
  const countText =
    selected === 0 ? `all · ${total}` : `${selected} / ${total}`;
  const countActive = selected > 0;
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-app-fg-muted">
          <span
            aria-hidden
            className="inline-flex h-5 w-5 items-center justify-center rounded-md text-app-blue"
          >
            {icon}
          </span>
          {label}
        </span>
        <span
          className={`rounded border px-2 py-0.5 font-mono text-[0.7rem] tabular-nums tracking-wider ${
            countActive
              ? "border-app-accent/30 bg-app-accent-soft text-app-blue"
              : "border-app-border bg-app-bg-elevated text-app-fg-subtle"
          }`}
        >
          {countText}
        </span>
        <span
          aria-hidden
          className="flex-1 border-t border-dashed border-app-border"
        />
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label={`Clear ${label} filter`}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-app-danger bg-app-danger-soft px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-app-danger transition-colors hover:border-app-danger/55 hover:bg-app-danger-soft/80"
          >
            <span aria-hidden className="font-bold leading-none">×</span>
            Clear
          </button>
        )}
        {trailing}
      </div>
      {children}
    </div>
  );
}
