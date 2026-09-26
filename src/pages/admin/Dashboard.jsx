const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useMemo, useCallback } from "react";

import StatCard from "@/components/StatCard";
import FiltersBar from "@/components/admin/FiltersBar";
import AssessmentsList from "@/components/admin/AssessmentsList";
import AdminAssessmentDialog from "@/components/admin/AdminAssessmentDialog";
import ExportPdfMenu from "@/components/admin/ExportPdfMenu";
import CalendarGrid from "@/components/CalendarGrid";
import CalendarMobileList from "@/components/CalendarMobileList";
import { useIsMobile } from "@/hooks/use-mobile";
import { monthMatrix, monthTitle, formatBR, toISO, isBookable, earliestSettingsStart } from "@/lib/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  CalendarCheck,
  CalendarOff,
  CalendarClock,
  History,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

function Panel({ title, children }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="font-semibold text-sm mb-3">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Empty() {
  return <div className="text-sm text-muted-foreground">Nenhum registro.</div>;
}
function Row({ a }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm py-1.5 border-b border-border/60 last:border-0">
      <div className="min-w-0">
        <div className="font-medium truncate">
          {a.subject} · {a.class_name}
        </div>
        <div className="text-xs text-muted-foreground">
          {a.teacher_name}
        </div>
      </div>
      <div className="text-xs font-medium whitespace-nowrap">
        {formatBR(a.date)}
      </div>
    </div>
  );
}

export default function Dashboard() {
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
  const [view, setView] = useState("calendar");
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    teacher: "",
    subject: "",
    class_name: "",
    type: "",
  });
  const [dialog, setDialog] = useState({
    open: false,
    mode: "create",
    assessment: null,
    date: null,
  });

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

  const todayISO = toISO(new Date());
  const reservedCount = assessments.length;
  const monthDays = weeks.flat().filter((d) => d.inMonth);
  const availableCount = monthDays.filter((d) => isBookable(d.iso, settings, "public")).length;
  const upcoming = useMemo(
    () =>
      [...assessments]
        .filter((a) => a.date >= todayISO)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5),
    [assessments, todayISO]
  );
  const recent = useMemo(
    () =>
      [...assessments]
        .sort((a, b) =>
          (b.created_date || "").localeCompare(a.created_date || "")
        )
        .slice(0, 5),
    [assessments]
  );

  const bookedTeacherNames = useMemo(
    () => new Set(assessments.map((a) => a.teacher_name)),
    [assessments]
  );
  const unbookedTeachers = useMemo(
    () => teachers.filter((t) => !bookedTeacherNames.has(t.name)),
    [teachers, bookedTeacherNames]
  );

  const filtered = useMemo(() => {
    return assessments
      .filter((a) => {
        if (filters.from && a.date < filters.from) return false;
        if (filters.to && a.date > filters.to) return false;
        if (filters.teacher && a.teacher_name !== filters.teacher) return false;
        if (filters.subject && a.subject !== filters.subject) return false;
        if (filters.class_name && a.class_name !== filters.class_name) return false;
        if (filters.type && a.type !== filters.type) return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [assessments, filters]);

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

  const openCreate = (iso) =>
    setDialog({ open: true, mode: "create", assessment: null, date: iso });
  const openEdit = (assessment) =>
    setDialog({
      open: true,
      mode: "edit",
      assessment,
      date: assessment.date,
    });
  const openNew = () =>
    setDialog({ open: true, mode: "create", assessment: null, date: todayISO });

  const onSelectDate = (iso, a) => (a ? openEdit(a) : openCreate(iso));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display">Painel do Administrador</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie reservas, professores, disciplinas e turmas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportPdfMenu assessments={assessments} classes={classes} />
          <Button
            onClick={openNew}
            className="bg-action hover:bg-action/90 text-action-foreground"
          >
            <Plus className="w-4 h-4 mr-1" /> Nova reserva
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={CalendarCheck}
          label="Dias reservados"
          value={reservedCount}
          tone="reserved"
        />
        <StatCard
          icon={CalendarOff}
          label="Dias disponíveis (mês)"
          value={availableCount}
          tone="action"
        />
        <StatCard
          icon={CalendarClock}
          label="Próximas avaliações"
          value={upcoming.length}
          tone="default"
        />
        <StatCard
          icon={History}
          label="Total de registros"
          value={assessments.length}
          tone="default"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Panel title="Próximas avaliações">
          {upcoming.length === 0 ? <Empty /> : upcoming.map((a) => <Row key={a.id} a={a} />)}
        </Panel>
        <Panel title="Últimas marcações">
          {recent.length === 0 ? <Empty /> : recent.map((a) => <Row key={a.id} a={a} />)}
        </Panel>
        <Panel title={`Professores sem marcação (${unbookedTeachers.length})`}>
          {unbookedTeachers.length === 0 ? (
            <Empty />
          ) : (
            unbookedTeachers.map((t) => (
              <div
                key={t.id}
                className="text-sm py-1.5 border-b border-border/60 last:border-0"
              >
                {t.name}
              </div>
            ))
          )}
        </Panel>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold font-display">Reservas</h2>
          <Tabs value={view} onValueChange={setView}>
            <TabsList>
              <TabsTrigger value="calendar">Calendário</TabsTrigger>
              <TabsTrigger value="list">Lista</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <FiltersBar
          filters={filters}
          setFilters={setFilters}
          teachers={teachers}
          subjects={subjects}
          classes={classes}
        />

        {view === "calendar" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={prevMonth}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card hover:bg-accent"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="font-display font-bold text-lg">
                {monthTitle(year, month)}
              </div>
              <button
                onClick={nextMonth}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card hover:bg-accent"
                aria-label="Próximo mês"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            {loading ? (
              <div className="text-center text-muted-foreground py-10">
                Carregando...
              </div>
            ) : isMobile ? (
              <CalendarMobileList
                weeks={weeks}
                assessmentsByDate={assessmentsByDate}
                settings={settings}
                mode="admin"
                onSelectDate={onSelectDate}
                classes={classes}
              />
            ) : (
              <CalendarGrid
                weeks={weeks}
                assessmentsByDate={assessmentsByDate}
                settings={settings}
                mode="admin"
                onSelectDate={onSelectDate}
                classes={classes}
              />
            )}
          </div>
        ) : loading ? (
          <div className="text-center text-muted-foreground py-10">
            Carregando...
          </div>
        ) : (
          <AssessmentsList items={filtered} onEdit={openEdit} classes={classes} />
        )}
      </div>

      <AdminAssessmentDialog
        open={dialog.open}
        onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))}
        mode={dialog.mode}
        assessment={dialog.assessment}
        date={dialog.date}
        teachers={teachers}
        subjects={subjects}
        classes={classes}
        onChanged={loadAll}
      />
    </div>
  );
}