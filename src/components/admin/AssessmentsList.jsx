import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { formatBR, buildClassLevelMap, levelKey, LEVEL_STYLES } from "@/lib/calendar";

const typeTone = {
  "Avaliação": "bg-sky-100 text-sky-800",
  Simulado: "bg-indigo-100 text-indigo-800",
  Trabalho: "bg-violet-100 text-violet-800",
  Atividade: "bg-rose-100 text-rose-800",
};

export default function AssessmentsList({ items, onEdit, classes = [] }) {
  const levelMap = buildClassLevelMap(classes);
  if (items.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        Nenhuma reserva encontrada.
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Data</TableHead>
            <TableHead>Professor</TableHead>
            <TableHead>Disciplina</TableHead>
            <TableHead>Turma</TableHead>
            <TableHead>Nível</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((a) => {
            const lvl = LEVEL_STYLES[levelKey(levelMap[a.class_name])];
            return (
              <TableRow key={a.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {formatBR(a.date)}
                </TableCell>
                <TableCell className="whitespace-nowrap">{a.teacher_name}</TableCell>
                <TableCell>{a.subject}</TableCell>
                <TableCell>{a.class_name}</TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${lvl.chip}`}>
                    {lvl.label}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeTone[a.type] || "bg-muted text-muted-foreground"}`}>
                    {a.type}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(a)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}