import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

const TYPES = ["Avaliação", "Simulado", "Trabalho", "Atividade"];

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

export default function FiltersBar({
  filters,
  setFilters,
  teachers = [],
  subjects = [],
  classes = [],
}) {
  const set = (k, v) => setFilters((s) => ({ ...s, [k]: v }));
  const clear = () =>
    setFilters({ from: "", to: "", teacher: "", subject: "", class_name: "", type: "" });
  const any = Object.values(filters).some(Boolean);

  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4 flex flex-wrap items-end gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mr-2">
        <Filter className="w-4 h-4" /> Filtros
      </div>
      <Field label="De">
        <Input
          type="date"
          value={filters.from}
          onChange={(e) => set("from", e.target.value)}
          className="h-9 w-[150px]"
        />
      </Field>
      <Field label="Até">
        <Input
          type="date"
          value={filters.to}
          onChange={(e) => set("to", e.target.value)}
          className="h-9 w-[150px]"
        />
      </Field>
      <Field label="Professor">
        <Select
          value={filters.teacher || "__all"}
          onValueChange={(v) => set("teacher", v === "__all" ? "" : v)}
        >
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">Todos</SelectItem>
            {teachers.map((t) => (
              <SelectItem key={t.id} value={t.name}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Disciplina">
        <Select
          value={filters.subject || "__all"}
          onValueChange={(v) => set("subject", v === "__all" ? "" : v)}
        >
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">Todas</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.name}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Turma">
        <Select
          value={filters.class_name || "__all"}
          onValueChange={(v) => set("class_name", v === "__all" ? "" : v)}
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">Todas</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Tipo">
        <Select
          value={filters.type || "__all"}
          onValueChange={(v) => set("type", v === "__all" ? "" : v)}
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">Todos</SelectItem>
            {TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      {any && (
        <Button variant="ghost" size="sm" onClick={clear} className="h-9">
          <X className="w-4 h-4 mr-1" /> Limpar
        </Button>
      )}
    </div>
  );
}