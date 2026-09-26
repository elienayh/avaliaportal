// Utilitários de calendário para o agendamento de simulados.
// Domingos são omitidos da grade (segunda a sábado).

export const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const WEEKDAY_LABELS_FULL = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function pad(n) {
  return String(n).padStart(2, "0");
}

// Converte um Date local para string ISO YYYY-MM-DD (sem timezone).
export function toISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Formato brasileiro dd/mm/YYYY.
export function formatBR(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${pad(d)}/${pad(m)}/${y}`;
}

// Segunda-feira mais próxima em ou antes da data informada.
function mondayOnOrBefore(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

// Gera a matriz de semanas do mês (cada semana = 6 dias, Seg a Sáb).
export function monthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const start = mondayOnOrBefore(first);
  const endMonday = mondayOnOrBefore(last);

  const weeks = [];
  let ws = new Date(start);
  while (ws <= endMonday) {
    const days = [];
    for (let d = 0; d < 6; d++) {
      const dt = new Date(ws);
      dt.setDate(ws.getDate() + d);
      days.push({
        date: dt,
        iso: toISO(dt),
        inMonth: dt.getMonth() === month,
        dow: d + 1,
        weekday: WEEKDAY_LABELS_FULL[d]
      });
    }
    weeks.push(days);
    const next = new Date(ws);
    next.setDate(ws.getDate() + 7);
    ws = next;
  }
  return weeks;
}

export function monthTitle(year, month) {
  return `${MONTH_NAMES[month]} ${year}`;
}

// Verifica se uma data é passada (antes de hoje).
export function isPast(iso) {
  const today = new Date();
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return parseISO(iso) < t0;
}

// Verifica se um dia está disponível para marcação pública, considerando
// o período configurado pelo administrador e os dias bloqueados.
export function isBookableForLevel(iso, settings, level) {
  if (!settings) return false;
  const start =
    level === "Ensino Médio" ? settings.medio_start_date : settings.fundamental_start_date;
  const end =
    level === "Ensino Médio" ? settings.medio_end_date : settings.fundamental_end_date;
  if (!start || !end) return false;
  if (iso < start || iso > end) return false;
  if ((settings.blocked_dates || []).includes(iso)) return false;
  if (isPast(iso)) return false;
  return true;
}

export function isBookable(iso, settings, mode = "public") {
  if (mode === "admin") return true;
  return (
    isBookableForLevel(iso, settings, "Ensino Médio") ||
    isBookableForLevel(iso, settings, "Ensino Fundamental")
  );
}

export function isBlockedDay(iso, settings) {
  return Boolean((settings?.blocked_dates || []).includes(iso));
}

export function earliestSettingsStart(settings) {
  if (!settings) return null;
  const dates = [
    settings.medio_start_date,
    settings.fundamental_start_date,
  ].filter(Boolean);
  if (dates.length === 0) return null;
  return dates.sort()[0];
}

export function buildClassLevelMap(classes) {
  const m = {};
  (classes || []).forEach((c) => {
    if (c?.name) m[c.name] = c.level;
  });
  return m;
}

export function levelKey(level) {
  if (level === "Ensino Médio") return "medio";
  if (level === "Ensino Fundamental") return "fundamental";
  return "none";
}

export const LEVEL_STYLES = {
  medio: {
    chip: "bg-emerald-100 text-emerald-800 border-emerald-300",
    dot: "bg-emerald-500",
    label: "Ensino Médio",
  },
  fundamental: {
    chip: "bg-amber-100 text-amber-800 border-amber-300",
    dot: "bg-amber-500",
    label: "Ensino Fundamental",
  },
  none: {
    chip: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
    label: "Sem nível",
  },
};