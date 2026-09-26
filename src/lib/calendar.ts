import { SchoolClass, SchedulingSettings } from '../types';

export const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const WEEKDAY_LABELS_FULL = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatBR(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${pad(d)}/${pad(m)}/${y}`;
}

function mondayOnOrBefore(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export interface CalendarDay {
  date: Date;
  iso: string;
  inMonth: boolean;
  dayOfWeek: number; // 0=Seg, 5=Sáb
}

// Generates week matrix (Segunda a Sábado, domingo omitido)
export function monthMatrix(year: number, month: number): CalendarDay[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const start = mondayOnOrBefore(first);
  const endMonday = mondayOnOrBefore(last);
  const weeks: CalendarDay[][] = [];

  const ws = new Date(start);
  while (ws <= endMonday) {
    const days: CalendarDay[] = [];
    for (let d = 0; d < 6; d++) {
      const cur = new Date(ws);
      cur.setDate(ws.getDate() + d);
      days.push({
        date: cur,
        iso: toISO(cur),
        inMonth: cur.getMonth() === month,
        dayOfWeek: d
      });
    }
    weeks.push(days);
    ws.setDate(ws.getDate() + 7);
  }
  return weeks;
}

export function monthTitle(year: number, month: number): string {
  return `${MONTH_NAMES[month]} de ${year}`;
}

export function isBlockedDay(iso: string, settings?: SchedulingSettings | null): boolean {
  if (!settings || !settings.blocked_dates) return false;
  return settings.blocked_dates.includes(iso);
}

export function isBookable(
  iso: string,
  settings?: SchedulingSettings | null,
  mode: 'public' | 'admin' = 'public'
): boolean {
  if (isBlockedDay(iso, settings)) return false;
  if (mode === 'admin') return true;
  if (!settings) return true;

  const inMedio =
    (!settings.medio_start_date || iso >= settings.medio_start_date) &&
    (!settings.medio_end_date || iso <= settings.medio_end_date);

  const inFund =
    (!settings.fundamental_start_date || iso >= settings.fundamental_start_date) &&
    (!settings.fundamental_end_date || iso <= settings.fundamental_end_date);

  return inMedio || inFund;
}

export function buildClassLevelMap(classes: SchoolClass[]): Record<string, string> {
  const map: Record<string, string> = {};
  classes.forEach((c) => {
    map[c.name] = c.level;
  });
  return map;
}

export function levelKey(level?: string): 'medio' | 'fund' | 'default' {
  if (level === 'Ensino Médio') return 'medio';
  if (level === 'Ensino Fundamental') return 'fund';
  return 'default';
}

export const LEVEL_STYLES = {
  medio: {
    chip: 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  fund: {
    chip: 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100',
    badge: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  default: {
    chip: 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100',
    badge: 'bg-slate-100 text-slate-800 border-slate-200'
  }
};
