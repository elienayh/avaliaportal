import React from "react";
import {
  formatBR,
  isBookable,
  isBlockedDay,
  buildClassLevelMap,
  levelKey,
  LEVEL_STYLES,
} from "@/lib/calendar";
import { Plus, Ban } from "lucide-react";

export default function CalendarMobileList({
  weeks,
  assessmentsByDate = {},
  settings,
  mode = "public",
  onSelectDate,
  classes = [],
}) {
  const levelMap = buildClassLevelMap(classes);
  const days = weeks.flat().filter((d) => d.inMonth);
  return (
    <div className="space-y-3">
      {days.map((day) => {
        const items = assessmentsByDate[day.iso] || [];
        const canBook = isBookable(day.iso, settings, mode);
        const blocked = isBlockedDay(day.iso, settings);
        return (
          <div
            key={day.iso}
            className={`w-full rounded-xl border p-4 flex flex-col gap-2 ${
              !canBook && mode === "public"
                ? "border-border/60 bg-muted/30"
                : items.length > 0
                ? "border-border bg-card"
                : blocked
                ? "border-destructive/30 bg-destructive/5"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">
                {day.weekday}, {formatBR(day.iso)}
              </span>
              {items.length > 0 ? (
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-reserved text-reserved-foreground">
                  Reservado
                </span>
              ) : blocked ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                  <Ban className="w-2.5 h-2.5" /> Bloqueado
                </span>
              ) : !canBook && mode === "public" ? (
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  Indisponível
                </span>
              ) : (
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                  Disponível
                </span>
              )}
            </div>
            {items.length > 0 && (
              <div className="space-y-1">
                {items.map((a) => {
                  const style = LEVEL_STYLES[levelKey(levelMap[a.class_name])];
                  const inner = (
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-foreground truncate">
                          {a.subject} · {a.class_name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {a.teacher_name}
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${style.chip}`}>
                        {style.label}
                      </span>
                    </div>
                  );
                  return mode === "admin" ? (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => onSelectDate?.(day.iso, a)}
                      className="w-full text-left rounded-lg bg-card border border-border px-2 py-1.5 hover:ring-2 hover:ring-reserved/40"
                    >
                      {inner}
                    </button>
                  ) : (
                    <div
                      key={a.id}
                      className="rounded-lg bg-card/60 border border-border px-2 py-1.5"
                    >
                      {inner}
                    </div>
                  );
                })}
              </div>
            )}
            {canBook && (
              <button
                type="button"
                onClick={() => onSelectDate?.(day.iso, null)}
                className="inline-flex items-center justify-center gap-1 h-10 px-4 rounded-lg bg-action hover:bg-action/90 text-action-foreground text-sm font-semibold self-end"
              >
                <Plus className="w-4 h-4" /> Marcar
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}