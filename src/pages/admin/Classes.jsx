const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Check, X, School } from "lucide-react";

const LEVELS = ["Ensino Fundamental", "Ensino Médio"];

const levelBadge = (level) =>
  level === "Ensino Médio"
    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
    : level === "Ensino Fundamental"
    ? "bg-amber-100 text-amber-800 border-amber-300"
    : "bg-muted text-muted-foreground border-border";

export default function Classes() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState("Ensino Médio");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editLevel, setEditLevel] = useState("Ensino Médio");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await db.entities.SchoolClass.list("name", 500);
      setItems(list);
    } catch (e) {
      toast({
        title: "Erro ao carregar",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    try {
      await db.entities.SchoolClass.create({ name, level: newLevel });
      setNewName("");
      toast({ title: "Turma cadastrada" });
      load();
    } catch (e) {
      const msg = (e.message || "").toLowerCase();
      toast({
        title:
          msg.includes("unique") || msg.includes("duplicate")
            ? "Já existe uma turma com esse nome"
            : "Erro ao cadastrar",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditLevel(item.level || "Ensino Médio");
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };
  const saveEdit = async (id) => {
    const name = editName.trim();
    if (!name) return;
    try {
      await db.entities.SchoolClass.update(id, { name, level: editLevel });
      cancelEdit();
      toast({ title: "Turma atualizada" });
      load();
    } catch (e) {
      toast({
        title: "Erro ao atualizar",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const remove = async (id) => {
    try {
      await db.entities.SchoolClass.delete(id);
      toast({ title: "Turma excluída" });
      load();
    } catch (e) {
      toast({
        title: "Erro ao excluir",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          <School className="w-6 h-6 text-primary" /> Turmas
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Cadastre as turmas e informe o nível de ensino. O nível define quais
          datas ficam disponíveis para cada professor.
        </p>
      </div>

      <Card className="p-4 space-y-3">
        <form onSubmit={add} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="new-name">Nome da turma</Label>
            <Input
              id="new-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex.: 8º Ano A, 1º Ano EM B"
            />
          </div>
          <div className="space-y-1.5 sm:w-56">
            <Label htmlFor="new-level">Nível</Label>
            <Select value={newLevel} onValueChange={setNewLevel}>
              <SelectTrigger id="new-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            className="bg-action hover:bg-action/90 text-action-foreground shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" /> Adicionar
          </Button>
        </form>
      </Card>

      <Card className="divide-y divide-border">
        {loading ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            Carregando...
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            Nenhuma turma cadastrada.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-3 flex items-center gap-2">
              {editingId === item.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                    className="flex-1"
                  />
                  <Select value={editLevel} onValueChange={setEditLevel}>
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="icon"
                    onClick={() => saveEdit(item.id)}
                    className="bg-action hover:bg-action/90 text-action-foreground"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={cancelEdit}>
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium">{item.name}</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${levelBadge(item.level)}`}
                  >
                    {item.level || "—"}
                  </span>
                  <Button size="icon" variant="ghost" onClick={() => startEdit(item)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          ))
        )}
      </Card>
    </div>
  );
}