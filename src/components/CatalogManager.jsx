const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

// Gerenciador genérico de catálogo (entidades com um único campo "name").
export default function CatalogManager({
  entityName,
  title,
  description,
  placeholder,
}) {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await db.entities[entityName].list("name", 500);
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
  }, [entityName, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    try {
      await db.entities[entityName].create({ name });
      setNewName("");
      toast({ title: "Cadastrado com sucesso" });
      load();
    } catch (e) {
      const msg = (e.message || "").toLowerCase();
      toast({
        title:
          msg.includes("unique") || msg.includes("duplicate")
            ? "Já existe um registro com esse nome"
            : "Erro ao cadastrar",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };
  const saveEdit = async (id) => {
    const name = editName.trim();
    if (!name) return;
    try {
      await db.entities[entityName].update(id, { name });
      cancelEdit();
      toast({ title: "Atualizado" });
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
      await db.entities[entityName].delete(id);
      toast({ title: "Excluído" });
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
        <h1 className="text-2xl font-bold font-display">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <Card className="p-4">
        <form onSubmit={add} className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={placeholder}
          />
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
            Nenhum registro cadastrado.
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
                    onKeyDown={(e) =>
                      e.key === "Enter" && saveEdit(item.id)
                    }
                  />
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
                  <span className="flex-1 text-sm font-medium">
                    {item.name}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEdit(item)}
                  >
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