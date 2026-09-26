import React from "react";
import { FileDown, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { exportAssessmentsPdf } from "@/lib/exportPdf";

export default function ExportPdfMenu({ assessments, classes }) {
  const run = (mode) => {
    if (!assessments || assessments.length === 0) return;
    exportAssessmentsPdf(assessments, classes, mode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <FileDown className="w-4 h-4 mr-2" /> Exportar PDF
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => run("subject")}>
          <BookOpen className="w-4 h-4 mr-2" /> Disciplina em destaque
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run("class")}>
          <Users className="w-4 h-4 mr-2" /> Turma em destaque
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}