import React, { useState } from 'react';
import { Assessment, SchoolClass, SchedulingSettings } from '../types';
import {
  buildClassLevelMap,
  formatBR,
  isBlockedDay,
  isBookable,
  LEVEL_STYLES,
  levelKey,
  monthMatrix,
  monthTitle,
  WEEKDAY_LABELS,
} from '../lib/calendar';
import {
  Ban,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  List,
  Plus,
  School,
} from 'lucide-react';

interface CalendarViewProps {
  assessments: Assessment[];
  classes: SchoolClass[];
  settings: SchedulingSettings;
  onBookDate: (date: string) => void;
  onEditAssessment: (a: Assessment) => void;
  isAdmin: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  assessments,
  classes,
  settings,
  onBookDate,
  onEditAssessment,
  isAdmin,
}) => {
  // Anchored to October 2026 where initial semester evaluations live
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1));
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Selected day for mobile drill-down
  const [mobileSelectedDate, setMobileSelectedDate] = useState<string | null>('2026-10-06');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleOct2026 = () => {
    setCurrentDate(new Date(2026, 9, 1));
  };

  const levelMap = buildClassLevelMap(classes);

  // Filter assessments
  const filteredAssessments = assessments.filter((a) => {
    const classLevel = levelMap[a.class_name];
    if (selectedLevel !== 'all' && classLevel !== selectedLevel) return false;
    if (selectedClass !== 'all' && a.class_name !== selectedClass) return false;
    return true;
  });

  // Group by ISO date
  const assessmentsByDate: Record<string, Assessment[]> = {};
  filteredAssessments.forEach((a) => {
    (assessmentsByDate[a.date] ||= []).push(a);
  });

  const weeks = monthMatrix(year, month);

  // Mobile selected day items
  const selectedDayItems = mobileSelectedDate ? assessmentsByDate[mobileSelectedDate] || [] : [];
  const selectedDayBlocked = mobileSelectedDate ? isBlockedDay(mobileSelectedDate, settings) : false;
  const selectedDayCanBook = mobileSelectedDate
    ? isBookable(mobileSelectedDate, settings, isAdmin ? 'admin' : 'public')
    : false;

  return (
    <div className="space-y-4 w-full max-w-full overflow-x-hidden">
      {/* Clean Institutional Header: NO BALLOONS, NO BUBBLES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Calendário Acadêmico de Avaliações
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            {settings.notice_message ||
              'Consulte a programação letiva ou agende sua avaliação. Para garantir a qualidade pedagógica, o sistema assegura automaticamente o limite de 1 avaliação por turma ao dia.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onBookDate('2026-10-08')}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition transform active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Marcar Avaliação</span>
        </button>
      </div>

      {/* Control Navigation & Filter Bar - 100% Fluid & Mobile-Friendly */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 sm:p-4 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
        {/* Month Navigation */}
        <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 w-full md:w-auto">
          <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 sm:p-1.5 rounded-xl text-slate-700 hover:bg-white hover:shadow-xs transition"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <span className="px-2 sm:px-3 text-xs sm:text-sm font-bold text-slate-900 min-w-[100px] sm:min-w-[130px] text-center">
              {monthTitle(year, month)}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 sm:p-1.5 rounded-xl text-slate-700 hover:bg-white hover:shadow-xs transition"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleOct2026}
            className="px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl border border-sky-200/70 transition shrink-0"
          >
            Out/2026
          </button>

          {/* View switcher on mobile */}
          <div className="flex md:hidden bg-slate-100/80 p-0.5 rounded-xl border border-slate-200/80 ml-auto shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-sky-700' : 'text-slate-500'
              }`}
              title="Grade"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'list' ? 'bg-white shadow-xs text-sky-700' : 'text-slate-500'
              }`}
              title="Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters and View Switcher (Desktop) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
          {/* Level Filter */}
          <div className="flex-1 sm:flex-initial min-w-[130px] flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1.5 rounded-xl border border-slate-200/80 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-hidden text-xs cursor-pointer w-full"
            >
              <option value="all">Todos os Níveis</option>
              <option value="Ensino Médio">Ensino Médio</option>
              <option value="Ensino Fundamental">Ensino Fundamental</option>
            </select>
          </div>

          {/* Class Filter */}
          <div className="flex-1 sm:flex-initial min-w-[130px] flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1.5 rounded-xl border border-slate-200/80 text-xs">
            <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-hidden text-xs cursor-pointer w-full truncate"
            >
              <option value="all">Todas as Turmas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle (Desktop) */}
          <div className="hidden md:flex bg-slate-100/80 p-0.5 rounded-xl border border-slate-200/80 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'grid'
                  ? 'bg-white shadow-xs text-sky-700'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grade"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'list'
                  ? 'bg-white shadow-xs text-sky-700'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 px-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-semibold text-slate-700">Legenda:</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Médio
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Fundamental
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Bloqueado
          </span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Máximo de 1 prova por turma ao dia
        </span>
      </div>

      {/* View Rendering */}
      {viewMode === 'grid' ? (
        <div className="space-y-3 w-full">
          {/* Fluid Calendar Matrix (Zero Horizontal Overflow on Mobile) */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-1.5 sm:p-4 shadow-xs border border-slate-200/80 w-full overflow-hidden">
            {/* Weekday headers: 6 columns Seg-Sáb fitting 100% width */}
            <div className="grid grid-cols-6 gap-1 sm:gap-2 mb-1.5 w-full">
              {WEEKDAY_LABELS.map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider py-1 sm:py-1.5 bg-slate-50/90 rounded-lg sm:rounded-xl border border-slate-100"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid - 100% fluid, zero min-width overflow */}
            <div className="grid grid-cols-6 gap-1 sm:gap-2 w-full">
              {weeks.map((week) =>
                week.map((day) => {
                  if (!day.inMonth) {
                    return (
                      <div
                        key={day.iso}
                        className="rounded-xl border border-slate-100 bg-slate-50/30 min-h-[48px] sm:min-h-[110px] p-1 opacity-25"
                      >
                        <span className="text-[10px] sm:text-xs text-slate-400">{day.date.getDate()}</span>
                      </div>
                    );
                  }

                  const dayItems = assessmentsByDate[day.iso] || [];
                  const blocked = isBlockedDay(day.iso, settings);
                  const canBook = isBookable(day.iso, settings, isAdmin ? 'admin' : 'public');
                  const isSelected = mobileSelectedDate === day.iso;

                  return (
                    <div
                      key={day.iso}
                      onClick={() => {
                        setMobileSelectedDate(day.iso);
                        if (!blocked && canBook && window.innerWidth >= 768) {
                          onBookDate(day.iso);
                        }
                      }}
                      className={`rounded-xl border p-1 sm:p-2 flex flex-col justify-between min-h-[50px] sm:min-h-[115px] transition-all cursor-pointer ${
                        blocked
                          ? 'border-rose-200/70 bg-rose-50/40'
                          : isSelected
                          ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/40'
                          : dayItems.length > 0
                          ? 'border-sky-200 bg-sky-50/20 hover:border-sky-300'
                          : canBook
                          ? 'border-slate-200/80 bg-white hover:border-sky-300 hover:bg-sky-50/10'
                          : 'border-slate-100 bg-slate-50/60'
                      }`}
                    >
                      {/* Day number & indicators */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                          {day.date.getDate()}
                        </span>

                        {blocked ? (
                          <Ban className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-500 shrink-0" />
                        ) : dayItems.length > 0 ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-sky-100 text-sky-800 shrink-0">
                            {dayItems.length}
                          </span>
                        ) : null}
                      </div>

                      {/* Desktop Cards Preview (Visible on sm/md and larger) */}
                      <div className="hidden sm:flex flex-col gap-1 my-1">
                        {dayItems.map((a) => {
                          const lvl = levelMap[a.class_name];
                          const style = LEVEL_STYLES[levelKey(lvl)];
                          return (
                            <div
                              key={a.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditAssessment(a);
                              }}
                              className={`rounded-lg border p-1 text-left cursor-pointer transition shadow-2xs hover:scale-[1.02] ${style.chip}`}
                              title={`${a.subject} · ${a.class_name}`}
                            >
                              <div className="font-bold text-[11px] truncate leading-tight text-slate-900">
                                {a.subject}
                              </div>
                              <div className="text-[9px] text-slate-600 truncate">
                                {a.class_name}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Mobile Colored Dot Indicator (Smartphone only) */}
                      <div className="flex sm:hidden items-center justify-center gap-1 py-1">
                        {dayItems.map((a, idx) => {
                          const lvl = levelMap[a.class_name];
                          const isMedio = lvl === 'Ensino Médio';
                          return (
                            <span
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full ${
                                isMedio ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                          );
                        })}
                      </div>

                      {/* Tap to Mark prompt (Desktop) */}
                      {!blocked && canBook && dayItems.length === 0 && (
                        <div className="hidden sm:block text-[9px] text-slate-400 group-hover:text-sky-600 transition">
                          Livre
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Smartphone Day Detail Card (Drilldown on Mobile) */}
          {mobileSelectedDate && (
            <div className="block sm:hidden bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="font-bold text-xs text-slate-900">
                    {formatBR(mobileSelectedDate)}
                  </span>
                  {selectedDayBlocked && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                      Bloqueado
                    </span>
                  )}
                </div>

                {!selectedDayBlocked && selectedDayCanBook && (
                  <button
                    type="button"
                    onClick={() => onBookDate(mobileSelectedDate)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Marcar</span>
                  </button>
                )}
              </div>

              {selectedDayItems.length === 0 ? (
                <p className="text-xs text-slate-500">
                  {selectedDayBlocked
                    ? 'Data bloqueada no calendário escolar (recesso ou feriado).'
                    : 'Nenhuma avaliação agendada nesta data. Dia disponível para agendamento.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDayItems.map((a) => {
                    const lvl = levelMap[a.class_name];
                    const style = LEVEL_STYLES[levelKey(lvl)];
                    return (
                      <div
                        key={a.id}
                        onClick={() => onEditAssessment(a)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${style.chip}`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 truncate">{a.subject}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-white/90 shrink-0">
                              {a.type}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5 truncate">
                            {a.class_name} · Professor(a): <strong>{a.teacher_name}</strong>
                          </div>
                        </div>
                        <span className="text-xs text-sky-600 font-bold shrink-0">Ver →</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* List Mode - 100% Fluid Vertical View, Zero Horizontal Scroll */
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 sm:p-5 shadow-xs border border-slate-200/80 divide-y divide-slate-100 w-full overflow-hidden">
          {Object.keys(assessmentsByDate).length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs sm:text-sm">
              Nenhuma avaliação cadastrada para este mês com os filtros selecionados.
            </div>
          ) : (
            Object.keys(assessmentsByDate)
              .sort()
              .map((isoDate) => {
                const items = assessmentsByDate[isoDate];
                return (
                  <div key={isoDate} className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-4 w-full">
                    <div className="shrink-0">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-sky-800 rounded-xl text-xs font-bold border border-sky-200/70">
                        <CalendarIcon className="w-3.5 h-3.5 text-sky-600" />
                        {formatBR(isoDate)}
                      </div>
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      {items.map((a) => {
                        const lvl = levelMap[a.class_name];
                        const style = LEVEL_STYLES[levelKey(lvl)];
                        return (
                          <div
                            key={a.id}
                            onClick={() => onEditAssessment(a)}
                            className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer hover:shadow-md transition w-full ${style.chip}`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                                  {a.subject}
                                </span>
                                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-slate-700 shrink-0">
                                  {a.type}
                                </span>
                              </div>
                              <div className="text-[11px] sm:text-xs text-slate-600 mt-0.5 truncate">
                                Turma: <strong>{a.class_name}</strong> · Professor(a): <strong>{a.teacher_name}</strong>
                              </div>
                              {a.notes && (
                                <p className="text-[11px] text-slate-500 mt-0.5 italic truncate">
                                  {a.notes}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              className="text-xs text-sky-600 font-bold hover:underline self-end sm:self-center shrink-0"
                            >
                              Ver Detalhes →
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}
    </div>
  );
};
