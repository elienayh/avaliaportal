import { jsPDF } from 'jspdf';
import { Assessment, SchoolClass } from '../types';
import { formatBR, monthMatrix, MONTH_NAMES, toISO } from './calendar';

// Colégio Portal Brand Color Palette (matching official emblem)
const COLOR_CYAN = [0, 180, 216] as const;       // #00B4D8 - Celestial Cyan
const COLOR_SKY = [2, 132, 199] as const;         // #0284C7 - Rich Sky Blue
const COLOR_DEEP_NAVY = [11, 27, 54] as const;    // #0B1B36 - Deep Space Navy
const COLOR_DARK = [15, 23, 42] as const;         // #0F172A - Slate 900
const COLOR_MUTED = [100, 116, 139] as const;     // #64748B - Slate 500
const COLOR_BORDER = [226, 232, 240] as const;    // #E2E8F0 - Slate 200
const COLOR_BG_CELL = [255, 255, 255] as const;   // White
const COLOR_BG_OTHER = [248, 250, 252] as const;  // Slate 50
const COLOR_CARD_BG = [240, 249, 255] as const;   // Sky 50
const COLOR_CARD_BORDER = [186, 230, 253] as const; // Sky 200

export interface ExportPdfOptions {
  filterTitle?: string;
  scopeSubtitle?: string;
  mode?: 'calendar' | 'class' | 'subject';
}

/**
 * Draws the vector logo emblem of Colégio Portal
 * (Glowing celestial ring with central portal arch)
 */
function drawPortalLogo(doc: jsPDF, x: number, y: number, size: number) {
  const r = size / 2;
  const cx = x + r;
  const cy = y + r;

  // Outer glowing circle
  doc.setFillColor(0, 192, 243);
  doc.circle(cx, cy, r, 'F');

  // Inner deep circle
  doc.setFillColor(11, 27, 54);
  doc.circle(cx, cy, r * 0.88, 'F');

  // Inner celestial orb
  doc.setFillColor(14, 165, 233);
  doc.circle(cx, cy, r * 0.72, 'F');

  // Central Portal Arch (Left half)
  doc.setFillColor(11, 27, 54);
  doc.roundedRect(cx - r * 0.44, cy - r * 0.4, r * 0.4, r * 0.76, 2, 2, 'F');

  // Central Portal Arch (Right half)
  doc.roundedRect(cx + r * 0.04, cy - r * 0.4, r * 0.4, r * 0.76, 2, 2, 'F');

  // Subtle arch divider
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.8);
  doc.line(cx, cy - r * 0.4, cx, cy + r * 0.36);
}

/**
 * Tries to fetch /logo.png as data URL, falls back gracefully to vector crest
 */
async function loadLogoDataUrl(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 160;
          canvas.height = 160;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, 160, 160);
            resolve(canvas.toDataURL('image/png'));
            return;
          }
        } catch {
          // fallback
        }
        resolve(null);
      };
      img.onerror = () => resolve(null);
      img.src = '/logo.png';
    } catch {
      resolve(null);
    }
  });
}

/**
 * Exports assessment schedules in a high-fidelity Horizontal A4 (Landscape)
 * Monthly Calendar layout.
 * If assessments span across 2 or more months, it automatically creates
 * 1 horizontal page per month.
 */
export async function exportAssessmentsPdf(
  assessments: Assessment[],
  classes: SchoolClass[] = [],
  modeOrOptions: 'subject' | 'class' | ExportPdfOptions = 'class',
  optionsExtra?: ExportPdfOptions
) {
  const options: ExportPdfOptions =
    typeof modeOrOptions === 'string'
      ? { mode: modeOrOptions, ...optionsExtra }
      : modeOrOptions || {};

  const logoDataUrl = await loadLogoDataUrl();

  // Create A4 Landscape PDF (Width: 841.89 pt, Height: 595.28 pt)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();   // 841.89 pt
  const pageHeight = doc.internal.pageSize.getHeight(); // 595.28 pt

  // Identify all distinct Year-Months that have assessments
  const monthsSet = new Set<string>();
  assessments.forEach((a) => {
    if (a.date && a.date.length >= 7) {
      monthsSet.add(a.date.slice(0, 7)); // 'YYYY-MM'
    }
  });

  // If no assessments found, use current month
  let sortedMonths = Array.from(monthsSet).sort();
  if (sortedMonths.length === 0) {
    const today = new Date();
    sortedMonths = [`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`];
  }

  // Lookup map for class levels
  const classMap: Record<string, SchoolClass> = {};
  classes.forEach((c) => {
    if (c?.name) classMap[c.name] = c;
  });

  const totalPages = sortedMonths.length;

  sortedMonths.forEach((ymStr, pageIndex) => {
    if (pageIndex > 0) {
      doc.addPage('a4', 'landscape');
    }

    const [yearNum, monthNum] = ymStr.split('-').map(Number);
    const monthZeroBased = monthNum - 1;
    const monthName = MONTH_NAMES[monthZeroBased] || '';

    // Assessments belonging to this month
    const monthAssessments = assessments.filter((a) => a.date && a.date.startsWith(ymStr));
    const assessmentsByDay: Record<string, Assessment[]> = {};
    monthAssessments.forEach((a) => {
      (assessmentsByDay[a.date] ||= []).push(a);
    });

    // Page Margins
    const marginLeft = 28;
    const marginRight = 28;
    const contentWidth = pageWidth - marginLeft - marginRight; // ~785.89 pt

    // ----------------------------------------------------
    // 1. TOP INSTITUTIONAL HEADER
    // ----------------------------------------------------
    const headerY = 22;
    const logoSize = 44;

    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'PNG', marginLeft, headerY, logoSize, logoSize);
      } catch {
        drawPortalLogo(doc, marginLeft, headerY, logoSize);
      }
    } else {
      drawPortalLogo(doc, marginLeft, headerY, logoSize);
    }

    // School Titles
    const titleX = marginLeft + logoSize + 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...COLOR_DEEP_NAVY);
    doc.text('COLÉGIO PORTAL', titleX, headerY + 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...COLOR_SKY);
    doc.text(`CALENDÁRIO MENSAL DE AVALIAÇÕES · ${monthName.toUpperCase()} DE ${yearNum}`, titleX, headerY + 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR_MUTED);
    doc.text('AvaliaPortal · Sistema Oficial de Agendamento e Horários de Provas', titleX, headerY + 44);

    // Right-side Info Box (Scope, Stats, Generation Date)
    const infoBoxW = 210;
    const infoBoxH = 46;
    const infoBoxX = pageWidth - marginRight - infoBoxW;
    const infoBoxY = headerY - 2;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.75);
    doc.roundedRect(infoBoxX, infoBoxY, infoBoxW, infoBoxH, 6, 6, 'FD');

    // Decorative top accent border
    doc.setFillColor(...COLOR_CYAN);
    doc.rect(infoBoxX + 6, infoBoxY, infoBoxW - 12, 2.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR_DEEP_NAVY);
    const scopeLabel = options.filterTitle || (options.mode === 'class' ? 'Agrupado por Turma' : options.mode === 'subject' ? 'Agrupado por Disciplina' : 'Visão Geral das Turmas');
    doc.text(scopeLabel.slice(0, 36), infoBoxX + 10, infoBoxY + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(`Avaliações no Mês: ${monthAssessments.length} agendada(s)`, infoBoxX + 10, infoBoxY + 27);
    doc.text(`Emissão: ${formatBR(toISO(new Date()))} · Pág. ${pageIndex + 1}/${totalPages}`, infoBoxX + 10, infoBoxY + 39);

    // Horizontal Separator Line
    doc.setDrawColor(...COLOR_CYAN);
    doc.setLineWidth(1.2);
    doc.line(marginLeft, headerY + 54, pageWidth - marginRight, headerY + 54);

    // ----------------------------------------------------
    // 2. WEEKDAY HEADER ROW (Segunda a Sábado)
    // ----------------------------------------------------
    const gridTop = headerY + 62;
    const weekdayLabels = [
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado'
    ];
    const numCols = 6;
    const colWidth = contentWidth / numCols; // ~130.98 pt per column
    const weekdayHeaderH = 20;

    weekdayLabels.forEach((name, i) => {
      const colX = marginLeft + i * colWidth;
      // Header background
      doc.setFillColor(11, 27, 54);
      doc.rect(colX, gridTop, colWidth, weekdayHeaderH, 'F');

      // Thin separator
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.line(colX + colWidth, gridTop, colX + colWidth, gridTop + weekdayHeaderH);

      // Label text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text(name, colX + colWidth / 2, gridTop + 13, { align: 'center' });
    });

    // ----------------------------------------------------
    // 3. MONTHLY CALENDAR GRID
    // ----------------------------------------------------
    const weeks = monthMatrix(yearNum, monthZeroBased);
    const numWeeks = weeks.length;

    const footerHeight = 32;
    const bottomMargin = 16;
    const gridBodyY = gridTop + weekdayHeaderH;
    const availableGridH = pageHeight - gridBodyY - footerHeight - bottomMargin;
    const rowHeight = availableGridH / numWeeks;

    weeks.forEach((week, rowIndex) => {
      const rowY = gridBodyY + rowIndex * rowHeight;

      week.forEach((day, colIndex) => {
        const cellX = marginLeft + colIndex * colWidth;
        const cellY = rowY;

        // Cell background
        if (day.inMonth) {
          doc.setFillColor(...COLOR_BG_CELL);
        } else {
          doc.setFillColor(...COLOR_BG_OTHER);
        }
        doc.setDrawColor(...COLOR_BORDER);
        doc.setLineWidth(0.6);
        doc.rect(cellX, cellY, colWidth, rowHeight, 'FD');

        const dayAssessments = day.inMonth ? (assessmentsByDay[day.iso] || []) : [];
        const hasAssessments = dayAssessments.length > 0;

        // Day Number Header inside cell
        const dayNum = String(day.date.getDate());
        const dayHeaderH = 16;

        if (day.inMonth) {
          if (hasAssessments) {
            // Highlighted Day Badge (Cyan circle/pill)
            doc.setFillColor(...COLOR_CYAN);
            doc.roundedRect(cellX + 4, cellY + 3, 20, 12, 3, 3, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            doc.text(dayNum, cellX + 14, cellY + 11.5, { align: 'center' });

            // Count badge on right
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            doc.setTextColor(...COLOR_SKY);
            doc.text(`${dayAssessments.length} prova(s)`, cellX + colWidth - 5, cellY + 11.5, { align: 'right' });
          } else {
            // Normal in-month day
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(...COLOR_DARK);
            doc.text(dayNum, cellX + 6, cellY + 12);
          }
        } else {
          // Out of month day
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(180, 190, 205);
          doc.text(dayNum, cellX + 6, cellY + 12);
        }

        // Render Assessment Cards inside day cell
        if (hasAssessments) {
          let cardY = cellY + dayHeaderH + 1;
          const maxVisibleCards = rowHeight > 80 ? 3 : 2;
          const cardHeight = Math.min(22, (rowHeight - dayHeaderH - 4) / Math.min(dayAssessments.length, maxVisibleCards));

          dayAssessments.slice(0, maxVisibleCards).forEach((ass) => {
            const cardX = cellX + 3;
            const cardW = colWidth - 6;

            // Card background & border
            doc.setFillColor(...COLOR_CARD_BG);
            doc.setDrawColor(...COLOR_CARD_BORDER);
            doc.setLineWidth(0.5);
            doc.roundedRect(cardX, cardY, cardW, cardHeight, 3, 3, 'FD');

            // Left vertical color accent bar
            doc.setFillColor(...COLOR_SKY);
            doc.rect(cardX, cardY, 2.5, cardHeight, 'F');

            // Line 1: Turma & Disciplina (Bold)
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            doc.setTextColor(...COLOR_DEEP_NAVY);
            const line1 = `[${ass.class_name}] ${ass.subject}`;
            doc.text(line1.slice(0, 22), cardX + 5, cardY + 7.5);

            // Line 2: Horário / Professor / Tipo
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6);
            doc.setTextColor(...COLOR_MUTED);

            // Extract schedule/notes or professor
            let details = '';
            if (ass.notes) {
              details = ass.notes;
            } else if (ass.teacher_name) {
              details = `Prof. ${ass.teacher_name} · ${ass.type}`;
            } else {
              details = ass.type;
            }
            doc.text(details.slice(0, 26), cardX + 5, cardY + 15);

            cardY += cardHeight + 2;
          });

          // If more cards exist than fit
          if (dayAssessments.length > maxVisibleCards) {
            const remaining = dayAssessments.length - maxVisibleCards;
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(6.5);
            doc.setTextColor(...COLOR_SKY);
            doc.text(`+ ${remaining} outra(s) avaliação(ões)`, cellX + 6, cardY + 6);
          }
        }
      });
    });

    // ----------------------------------------------------
    // 4. FOOTER / LEGENDA & IDENTIFICAÇÃO INSTITUCIONAL
    // ----------------------------------------------------
    const footerY = pageHeight - footerHeight - 4;

    // Separator line
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.6);
    doc.line(marginLeft, footerY, pageWidth - marginRight, footerY);

    // Left Legend
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_DEEP_NAVY);
    doc.text('LEGENDA:', marginLeft, footerY + 14);

    // Legend item 1: Cyan dot
    doc.setFillColor(...COLOR_CYAN);
    doc.circle(marginLeft + 50, footerY + 11.5, 3.5, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_DARK);
    doc.text('Avaliação Bimestral / Mensal', marginLeft + 58, footerY + 14);

    // Legend item 2: Sky dot
    doc.setFillColor(...COLOR_SKY);
    doc.circle(marginLeft + 185, footerY + 11.5, 3.5, 'F');
    doc.text('Simulado / Trabalho Acadêmico', marginLeft + 193, footerY + 14);

    // Legend item 3: Rule reminder
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_MUTED);
    doc.text('Regra Pedagógica: Limite de 1 avaliação oficial diária por turma', marginLeft + 330, footerY + 14);

    // Right institutional branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_DEEP_NAVY);
    doc.text('COLÉGIO PORTAL · COORDENAÇÃO PEDAGÓGICA', pageWidth - marginRight, footerY + 14, { align: 'right' });
  });

  // Save the PDF with a friendly file name
  const safeScope = (options.filterTitle || 'geral')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const fileName = `calendario-avaliacoes-colegio-portal-${safeScope}.pdf`;

  doc.save(fileName);
}
