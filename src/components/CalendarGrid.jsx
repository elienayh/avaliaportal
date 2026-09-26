import React from "react";
import {
  WEEKDAY_LABELS,
  isBookable,
  isBlockedDay,
  buildClassLevelMap,
  levelKey,
  LEVEL_STYLES,
} from "@/lib/calendar";
import { Plus, Ban } from "lucide-react";

function StatusBadge({ items, canBook, blocked, mode }) {
  if (items.length > 0)
    return (
      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-reserved text-reserved-foreground">
        Reservado
      </span>
    );
  if (blocked)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
        <Ban className="w-2.5 h-2.5" /> Bloqueado
      </span>
    );
  if (!canBook && mode === "public")
    return (
      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
        Indisponível
      </span>
    );
  return (
    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
      Disponível
    </span>
  );
}

function ItemChip({ a, levelMap, mode, onSelectDate, iso }) {
  const style = LEVEL_STYLES[levelKey(levelMap[a.class_name])];
  const inner = (
    <>
      <div className="font-semibold text-xs text-foreground leading-tight truncate">
        {a.subject}
      </div>
      <div className="text-[10px] text-muted-foreground truncate">
        {a.class_name} · {a.teacher_name}
      </div>
    </>
  );
  return mode === "admin" ? (
    <button
      type="button"
      onClick={() => onSelectDate?.(iso, a)}
      className={`text-left rounded-md border px-1.5 py-1 hover:ring-2 hover:ring-reserved/40 ${style.chip}`}
    >
      {inner}
    </button>
  ) : (
    <div className={`rounded-md border px-1.5 py-1 ${style.chip}`}>{inner}</div>
  );
}

function DayCell({ day, items, settings, mode, onSelectDate, levelMap }) {
  const canBook = isBookable(day.iso, settings, mode);
  const blocked = isBlockedDay(day.iso, settings);

  const cellClass = !canBook && mode === "public"
    ? "border-border/60 bg-muted/30"
    : items.length > 0
    ? "border-border bg-card"
    : blocked
    ? "border-destructive/30 bg-destructive/5"
    : "border-border bg-card hover:border-action/50 hover:bg-accent transition";

  return (
    <div className={`rounded-xl border p-2 flex flex-col gap-1 ${cellClass}`}>
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-foreground">{day.date.getDate()}</span>
        <StatusBadge items={items} canBook={canBook} blocked={blocked} mode={mode} />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        {items.map((a) => (
          <ItemChip
            key={a.id}
            a={a}
            levelMap={levelMap}
            mode={mode}
            onSelectDate={onSelectDate}
            iso={day.iso}
          />
        ))}
      </div>
      {canBook && (
        <button
          type="button"
          onClick={() => onSelectDate?.(day.iso, null)}
          className="mt-auto w-full inline-flex items-center justify-center gap-1 h-8 rounded-lg bg-action hover:bg-action/90 text-action-foreground text-xs font-semibold"
        >
          <Plus className="w-3 h-3" /> Marcar
        </button>
      )}
    </div>
  );
}

export default function CalendarGrid({
  weeks,
  assessmentsByDate = {},
  settings,
  mode = "public",
  onSelectDate,
  classes = [],
}) {
  const levelMap = buildClassLevelMap(classes);
  return (
    <div>
      <div className="grid grid-cols-6 gap-2 mb-2">
        {WEEKDAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide py-2"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-6 gap-2 items-start">
        {weeks.map((week) =>
          week.map((day) => {
            if (!day.inMonth)
              return (
                <div
                  key={day.iso}
                  className="rounded-xl border border-border/60 bg-muted/30 min-h-[124px]"
                />
              );
            return (
              <DayCell
                key={day.iso}
                day={day}
                items={assessmentsByDate[day.iso] || []}
                settings={settings}
                mode={mode}
                onSelectDate={onSelectDate}
                levelMap={levelMap}
              />
            );
          })
        )}
      </div>
    </div>
  );
}