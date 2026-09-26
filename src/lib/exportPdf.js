import { jsPDF } from "jspdf";
import { formatBR } from "@/lib/calendar";

const PRIMARY = [8, 61, 122];
const INK = [30, 41, 59];
const MUTED = [107, 114, 128];

// Gera um PDF das marcações em dois layouts:
// mode = "subject"  -> disciplina em destaque, turma em baixo
// mode = "class"    -> turma em destaque, disciplina/professor em baixo
export function exportAssessmentsPdf(assessments, classes, mode) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  const indent = 16;
  let y = margin;

  const title =
    mode === "subject"
      ? "Marcações de Avaliações — por Disciplina"
      : "Marcações de Avaliações — por Turma";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text(title, margin, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(
    `Colégio Portal do Saber · ${assessments.length} marcação(ões) · gerado em ${formatBR(
      todayISO()
    )}`,
    margin,
    y
  );
  y += 24;

  const levelMap = {};
  (classes || []).forEach((c) => {
    if (c?.name) levelMap[c.name] = c.level;
  });

  const sorted = [...assessments].sort((a, b) => a.date.localeCompare(b.date));
  const byDate = {};
  sorted.forEach((a) => {
    (byDate[a.date] ||= []).push(a);
  });
  const dates = Object.keys(byDate).sort();

  for (const date of dates) {
    if (y > pageH - margin - 70) {
      doc.addPage();
      y = margin;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...PRIMARY);
    doc.text(formatBR(date), margin, y);
    y += 16;

    for (const a of byDate[date]) {
      if (y > pageH - margin - 60) {
        doc.addPage();
        y = margin;
      }
      const level = levelMap[a.class_name];

      // Linha em destaque
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...INK);
      const main = mode === "subject" ? a.subject : a.class_name;
      doc.text(String(main || "—"), margin + indent, y);
      y += 16;

      // Linha secundária
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      const sub =
        mode === "subject"
          ? a.class_name
          : `${a.subject} · ${a.teacher_name}`;
      doc.text(String(sub || "—"), margin + indent, y);
      y += 13;

      // Linha auxiliar
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      const extra =
        mode === "subject"
          ? [a.teacher_name, a.type, level].filter(Boolean).join(" · ")
          : [a.type, level].filter(Boolean).join(" · ");
      doc.text(extra, margin + indent, y);
      y += 18;
    }
    y += 8;
  }

  doc.save(
    mode === "subject" ? "marcacoes-por-disciplina.pdf" : "marcacoes-por-turma.pdf"
  );
}

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}