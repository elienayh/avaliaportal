import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SmartField from "@/components/SmartField";
import { formatBR } from "@/lib/calendar";

const TYPES = ["Avaliação", "Simulado", "Trabalho", "Atividade"];

function seed(initial) {
  return {
    date: initial?.date || "",
    teacher_name: initial?.teacher_name || "",
    teacher_id: initial?.teacher_id || "",
    subject: initial?.subject || "",
    class_name: initial?.class_name || "",
    type: initial?.type || "Avaliação",
    notes: initial?.notes || "",
  };
}

export default function AssessmentForm({
  initial,
  resetKey,
  teachers = [],
  subjects = [],
  classes = [],
  lockDate = false,
  onSubmit,
  submitting,
  submitLabel = "Confirmar Marcação",
  error,
}) {
  const [f, setF] = useState(() => seed(initial));

  useEffect(() => {
    setF(seed(initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const set = (patch) => setF((s) => ({ ...s, ...patch }));

  const teacherNames = teachers.map((t) => t.name);
  const subjectNames = subjects.map((s) => s.name);
  const classNames = classes.map((c) => c.name);

  const submit = (e) => {
    e.preventDefault();
    if (!f.date || !f.teacher_name || !f.subject || !f.class_name) return;
    onSubmit(f);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Data</Label>
        {lockDate ? (
          <div className="h-11 flex items-center px-3 rounded-lg bg-accent text-accent-foreground font-semibold border border-border">
            {formatBR(f.date)}
          </div>
        ) : (
          <Input
            type="date"
            value={f.date}
            onChange={(e) => set({ date: e.target.value })}
            required
          />
        )}
      </div>

      <SmartField
        id="teacher"
        label="Professor"
        options={teacherNames}
        value={f.teacher_name}
        onChange={(v) =>
          set({
            teacher_name: v,
            teacher_id: teachers.find((t) => t.name === v)?.id || "",
          })
        }
        placeholder="Selecione o professor"
        required
      />
      <SmartField
        id="subject"
        label="Disciplina"
        options={subjectNames}
        value={f.subject}
        onChange={(v) => set({ subject: v })}
        placeholder="Selecione a disciplina"
        required
      />
      <SmartField
        id="class"
        label="Turma"
        options={classNames}
        value={f.class_name}
        onChange={(v) => set({ class_name: v })}
        placeholder="Selecione a turma"
        required
      />

      <div className="space-y-1.5">
        <Label htmlFor="type">Tipo de avaliação</Label>
        <Select value={f.type} onValueChange={(v) => set({ type: v })}>
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Observação</Label>
        <Textarea
          id="notes"
          value={f.notes}
          onChange={(e) => set({ notes: e.target.value })}
          rows={2}
          placeholder="Opcional"
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-12 bg-action hover:bg-action/90 text-action-foreground font-semibold"
        disabled={submitting}
      >
        {submitting ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}