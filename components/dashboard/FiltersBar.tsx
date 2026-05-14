"use client";

import { Chip } from "@mantine/core";
import { COURSE_TOPIC_META, type CourseTopic } from "@/domain/topic";
import {
  DIFFICULTIES,
  DIFFICULTY_META,
  type Difficulty,
} from "@/domain/difficulty";
import { useSettings } from "@/state/useSettings";
import { FlameIcon, GaugeIcon, TagIcon } from "@/components/common/Icon";

const TOPIC_COUNT = Object.keys(COURSE_TOPIC_META).length;
const DIFFICULTY_COUNT = DIFFICULTIES.length;
const EXAM_YEARS = ["2023", "2024", "2025"] as const;

export function FiltersBar() {
  const { settings, setTopicFilter, setDifficultyFilter, setExamYearFilter } =
    useSettings();

  const topicSelected = settings.topicFilter.length;
  const difficultySelected = settings.difficultyFilter.length;
  const yearSelected = settings.examYearFilter.length;
  const totalSelected = topicSelected + difficultySelected + yearSelected;
  const hasAny = totalSelected > 0;

  const clearAll = () => {
    setTopicFilter([]);
    setDifficultyFilter([]);
    setExamYearFilter([]);
  };

  return (
    <section
      data-active={hasAny ? "true" : undefined}
      aria-label="Filters"
      className="relative isolate overflow-hidden rounded-2xl border border-app-border bg-app-surface transition-[border-color,box-shadow] duration-200 data-[active=true]:border-app-accent/40 data-[active=true]:shadow-[0_14px_32px_-28px_var(--app-accent)]"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-25 [background-image:radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--app-accent)_22%,transparent)_1px,transparent_0)] [background-size:16px_16px] [mask-image:linear-gradient(to_bottom_right,black,transparent_70%)] [-webkit-mask-image:linear-gradient(to_bottom_right,black,transparent_70%)]"
      />

      {hasAny ? (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute top-1.5 left-1.5 z-20 h-3 w-3 rounded-tl-sm border-t-2 border-l-2 border-app-accent/60"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute top-1.5 right-1.5 z-20 h-3 w-3 rounded-tr-sm border-t-2 border-r-2 border-app-accent/60"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-1.5 left-1.5 z-20 h-3 w-3 rounded-bl-sm border-b-2 border-l-2 border-app-accent/60"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-1.5 right-1.5 z-20 h-3 w-3 rounded-br-sm border-b-2 border-r-2 border-app-accent/60"
          />
        </>
      ) : null}

      <div className="relative z-10 flex flex-col gap-5 px-5 py-5">
        <FilterSection
          icon={<TagIcon size={14} />}
          label="Topic"
          selected={topicSelected}
          total={TOPIC_COUNT}
          onClear={topicSelected > 0 ? () => setTopicFilter([]) : undefined}
        >
          <Chip.Group
            multiple
            value={[...settings.topicFilter]}
            onChange={(v) => setTopicFilter(v as CourseTopic[])}
          >
            <div className="flex flex-wrap gap-2">
              {Object.values(COURSE_TOPIC_META).map((meta) => (
                <Chip
                  key={meta.id}
                  value={meta.id}
                  color={meta.color}
                  variant="light"
                  size="sm"
                  radius="sm"
                >
                  {meta.label}
                </Chip>
              ))}
            </div>
          </Chip.Group>
        </FilterSection>

        <FilterSection
          icon={<FlameIcon size={14} />}
          label="Exam year"
          selected={yearSelected}
          total={EXAM_YEARS.length}
          onClear={yearSelected > 0 ? () => setExamYearFilter([]) : undefined}
        >
          <Chip.Group
            multiple
            value={[...settings.examYearFilter]}
            onChange={(v) => setExamYearFilter(v)}
          >
            <div className="flex flex-wrap gap-2">
              {EXAM_YEARS.map((year) => (
                <Chip
                  key={year}
                  value={year}
                  color="red"
                  variant="light"
                  size="sm"
                  radius="sm"
                >
                  {year}
                </Chip>
              ))}
            </div>
          </Chip.Group>
        </FilterSection>
        <FilterSection
          icon={<GaugeIcon size={14} />}
          label="Difficulty"
          selected={difficultySelected}
          total={DIFFICULTY_COUNT}
          onClear={
            difficultySelected > 0 ? () => setDifficultyFilter([]) : undefined
          }
        >
          <Chip.Group
            multiple
            value={[...settings.difficultyFilter]}
            onChange={(v) => setDifficultyFilter(v as Difficulty[])}
          >
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map((d) => (
                <Chip
                  key={d}
                  value={d}
                  color={DIFFICULTY_META[d].color}
                  variant="light"
                  size="sm"
                  radius="sm"
                >
                  {DIFFICULTY_META[d].label}
                </Chip>
              ))}
            </div>
          </Chip.Group>
        </FilterSection>
        <div className="flex w-full items-center justify-end">
          <button
            type="button"
            onClick={clearAll}
            disabled={!hasAny}
            aria-label="Clear all filters"
            className={`group  inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.7rem] uppercase tracking-wider transition-colors  disabled:pointer-events-none disabled:opacity-50 ${hasAny ? "text-app-danger border-app-danger bg-app-danger-soft hover:border-app-danger/55 hover:bg-app-danger-soft/80 hover:text-app-danger" : "border-app-border bg-app-bg-elevated text-app-fg-muted "}`}
          >
            <span
              aria-hidden
              className="inline-flex h-4 w-4 items-center justify-center rounded-sm  text-xs leading-none font-bold transition-colors "
            >
              ×
            </span>
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}

interface FilterSectionProps {
  icon: React.ReactNode;
  label: string;
  selected: number;
  total: number;
  onClear?: () => void;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}

function FilterSection({
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
            className="inline-flex h-5 w-5 items-center justify-center rounded-md  text-app-blue"
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

        {trailing}
      </div>
      {children}
    </div>
  );
}
