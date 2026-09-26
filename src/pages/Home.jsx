const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useMemo, useCallback } from "react";

import SiteHeader from "@/components/SiteHeader";
import CalendarGrid from "@/components/CalendarGrid";
import CalendarMobileList from "@/components/CalendarMobileList";
import BookingDialog from "@/components/BookingDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { monthMatrix, monthTitle, formatBR, earliestSettingsStart } from "@/lib/calendar";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

export default function Home() {
  const isMobile = useIsMobile();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [assessments, setAssessments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [a, t, s, c, st] = await Promise.all([
        db.entities.Assessment.list("-date", 500),
        db.entities.Teacher.list("name", 500),
        db.entities.Subject.list("name", 500),
        db.entities.SchoolClass.list("name", 500),
        db.entities.SchedulingSettings.list(),
      ]);
      setAssessments(a);
      setTeachers(t);
      setSubjects(s);
      setClasses(c);
      setSettings(st[0] || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Carrega o calendário no mês do primeiro dia de marcação liberado.
  useEffect(() => {
    if (!settings) return;
    const start = earliestSettingsStart(settings);
    if (!start) return;
    const [y, m] = start.split("-").map(Number);
    setYear(y);
    setMonth(m - 1);
  }, [settings]);

  const weeks = useMemo(() => monthMatrix(year, month), [year, month]);
  const assessmentsByDate = useMemo(() => {
    const m = {};
    assessments.forEach((a) => {
      if (!m[a.date]) m[a.date] = [];
      m[a.date].push(a);
    });
    return m;
  }, [assessments]);

  const prevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  };
  const nextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  };
  const goToday = () => {
    const t = new Date();
    setYear(t.getFullYear());
    setMonth(t.getMonth());
  };

  const openBooking = (iso) => {
    setSelectedDate(iso);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="bg-gradient-to-b from-primary to-primary/95 text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center">
          <h2 className="font-display font-bold text-2xl sm:text-4xl">
            Agendamento de Simulados e Avaliações
          </h2>
          <p className="text-white/85 mt-2 text-sm sm:text-base">
            Selecione uma data disponível no calendário para registrar sua prova.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {settings && (settings.medio_start_date || settings.fundamental_start_date) ? (
          <div className="mb-4 rounded-xl border border-action/30 bg-accent px-4 py-3 text-sm text-accent-foreground space-y-1">
            {settings.medio_start_date && settings.medio_end_date && (
              <div>
                <strong>Ensino Médio:</strong> {formatBR(settings.medio_start_date)} a{" "}
                {formatBR(settings.medio_end_date)}
              </div>
            )}
            {settings.fundamental_start_date && settings.fundamental_end_date && (
              <div>
                <strong>Ensino Fundamental:</strong>{" "}
                {formatBR(settings.fundamental_start_date)} a{" "}
                {formatBR(settings.fundamental_end_date)}
              </div>
            )}
            {(settings.blocked_dates || []).length > 0 && (
              <div>{settings.blocked_dates.length} dia(s) bloqueado(s) para marcação.</div>
            )}
          </div>
        ) : (
          <div className="mb-4 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            O período de avaliações ainda não foi definido pelo administrador. Aguarde a
            abertura das marcações.
          </div>
        )}
        <div className="flex items-center justify-between gap-2 mb-5">
          <button
            onClick={prevMonth}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card hover:bg-accent"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="font-display font-bold text-lg sm:text-2xl text-foreground">
              {monthTitle(year, month)}
            </div>
            <button
              onClick={goToday}
              className="text-xs text-action hover:underline inline-flex items-center gap-1 mt-0.5"
            >
              <CalendarDays className="w-3 h-3" /> Hoje
            </button>
          </div>
          <button
            onClick={nextMonth}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card hover:bg-accent"
            aria-label="Próximo mês"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-16">
            Carregando calendário...
          </div>
        ) : isMobile ? (
          <CalendarMobileList
            weeks={weeks}
            assessmentsByDate={assessmentsByDate}
            settings={settings}
            mode="public"
            onSelectDate={openBooking}
            classes={classes}
          />
        ) : (
          <CalendarGrid
            weeks={weeks}
            assessmentsByDate={assessmentsByDate}
            settings={settings}
            mode="public"
            onSelectDate={openBooking}
            classes={classes}
          />
        )}

        <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-accent border border-action/30" />{" "}
            Disponível
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-400" />{" "}
            Ensino Médio
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-200 border border-amber-400" />{" "}
            Ensino Fundamental
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-muted/40 border border-border/60" />{" "}
            Indisponível
          </span>
          <span>Domingos não aparecem no calendário.</span>
        </div>
      </div>

      <BookingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        date={selectedDate}
        teachers={teachers}
        subjects={subjects}
        classes={classes}
        settings={settings}
        onBooked={loadAll}
      />
    </div>
  );
}