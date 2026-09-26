import { jsPDF } from 'jspdf';
import { Assessment, SchoolClass } from '../types';
import { formatBR, toISO } from './calendar';

const PRIMARY = [8, 61, 122] as const;
const INK = [30, 41, 59] as const;
const MUTED = [107, 114, 128] as const;

export function exportAssessmentsPdf(
  assessments: Assessment[],
  classes: SchoolClass[],
  mode: 'subject' | 'class'
) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  const indent = 16;
  let y = margin;

  const title =
    mode === 'subject'
      ? 'Marcações de Avaliações — Agrupadas por Disciplina'
      : 'Marcações de Avaliações — Agrupadas por Turma';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text(title, margin, y);
  y += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(
    `Colégio Portal do Saber (SRE Carangola) · ${assessments.length} marcação(ões) · Gerado em ${formatBR(
      toISO(new Date())
    )}`,
    margin,
    y
  );
  y += 24;

  const levelMap: Record<string, string> = {};
  classes.forEach((c) => {
    if (c?.name) levelMap[c.name] = c.level;
  });

  const sorted = [...assessments].sort((a, b) => a.date.localeCompare(b.date));
  const byDate: Record<string, Assessment[]> = {};
  sorted.forEach((a) => {
    (byDate[a.date] ||= []).push(a);
  });

  const dates = Object.keys(byDate).sort();

  if (dates.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(...MUTED);
    doc.text('Nenhuma avaliação encontrada com os filtros selecionados.', margin, y + 20);
    doc.save(mode === 'subject' ? 'marcacoes-por-disciplina.pdf' : 'marcacoes-por-turma.pdf');
    return;
  }

  for (const date of dates) {
    if (y > pageH - margin - 70) {
      doc.addPage();
      y = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...PRIMARY);
    doc.text(formatBR(date), margin, y);
    y += 16;

    for (const a of byDate[date]) {
      if (y > pageH - margin - 60) {
        doc.addPage();
        y = margin;
      }

      const level = levelMap[a.class_name] || '';

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...INK);
      const main = mode === 'subject' ? a.subject : a.class_name;
      doc.text(String(main || '—'), margin + indent, y);
      y += 15;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      const sub =
        mode === 'subject'
          ? a.class_name
          : `${a.subject} · Professor(a): ${a.teacher_name}`;
      doc.text(String(sub || '—'), margin + indent, y);
      y += 13;

      doc.setFontSize(8.5);
      doc.setTextColor(...MUTED);
      const extraParts =
        mode === 'subject'
          ? [a.teacher_name ? `Prof: ${a.teacher_name}` : '', a.type, level, a.notes ? `Obs: ${a.notes}` : '']
          : [a.type, level, a.notes ? `Obs: ${a.notes}` : ''];
      const extra = extraParts.filter(Boolean).join(' · ');
      doc.text(extra, margin + indent, y);
      y += 18;
    }
    y += 8;
  }

  doc.save(mode === 'subject' ? 'marcacoes-por-disciplina.pdf' : 'marcacoes-por-turma.pdf');
}
