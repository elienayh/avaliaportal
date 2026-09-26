const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CalendarRange, Plus, X, Loader2, Save } from "lucide-react";
import { formatBR } from "@/lib/calendar";

function PeriodFields({ title, start, end, setStart, setEnd }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end">
      <div className="space-y-1.5 flex-1">
        <Label>{title} — data inicial</Label>
        <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
      </div>
      <div className="space-y-1.5 flex-1">
        <Label>{title} — data final</Label>
        <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
      </div>
    </div>
  );
}

export default function Period() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(null);
  const [medioStart, setMedioStart] = useState("");
  const [medioEnd, setMedioEnd] = useState("");
  const [fundStart, setFundStart] = useState("");
  const [fundEnd, setFundEnd] = useState("");
  const [blocked, setBlocked] = useState([]);
  const [newBlock, setNewBlock] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await db.entities.SchedulingSettings.list();
      const s = list[0] || null;
      setSettings(s);
      setMedioStart(s?.medio_start_date || "");
      setMedioEnd(s?.medio_end_date || "");
      setFundStart(s?.fundamental_start_date || "");
      setFundEnd(s?.fundamental_end_date || "");
      setBlocked(s?.blocked_dates || []);
    } catch (e) {
      toast({ title: "Erro ao carregar", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const addBlock = () => {
    if (!newBlock || blocked.includes(newBlock)) return;
    setBlocked((b) => [...b, newBlock].sort());
    setNewBlock("");
  };
  const removeBlock = (d) => setBlocked((b) => b.filter((x) => x !== d));

  const addWeekends = () => {
    const ranges = [];
    if (medioStart && medioEnd) ranges.push([medioStart, medioEnd]);
    if (fundStart && fundEnd) ranges.push([fundStart, fundEnd]);
    if (ranges.length === 0) {
      toast({
        title: "Defina um período",
        description: "Informe as datas inicial e final de ao menos um nível para bloquear os finais de semana.",
        variant: "destructive",
      });
      return;
    }
    const set = new Set(blocked);
    ranges.forEach(([s, e]) => {
      const start = new Date(s + "T00:00:00");
      const end = new Date(e + "T00:00:00");
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const day = d.getDay();
        if (day === 0 || day === 6) set.add(d.toISOString().slice(0, 10));
      }
    });
    setBlocked([...set].sort());
  };

  const save = async () => {
    if (medioStart && !medioEnd) {
      toast({ title: "Período incompleto", description: "Defina a data final do Ensino Médio.", variant: "destructive" });
      return;
    }
    if (fundStart && !fundEnd) {
      toast({ title: "Período incompleto", description: "Defina a data final do Ensino Fundamental.", variant: "destructive" });
      return;
    }
    if (medioStart && medioEnd && medioEnd < medioStart) {
      toast({ title: "Período inválido", description: "Ensino Médio: a data final deve ser após a inicial.", variant: "destructive" });
      return;
    }
    if (fundStart && fundEnd && fundEnd < fundStart) {
      toast({ title: "Período inválido", description: "Ensino Fundamental: a data final deve ser após a inicial.", variant: "destructive" });
      return;
    }
    if (!medioStart && !fundStart) {
      toast({ title: "Informe um período", description: "Defina ao menos um período (Médio ou Fundamental).", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        medio_start_date: medioStart,
        medio_end_date: medioEnd,
        fundamental_start_date: fundStart,
        fundamental_end_date: fundEnd,
        blocked_dates: blocked,
      };
      if (settings) {
        await db.entities.SchedulingSettings.update(settings.id, payload);
      } else {
        const created = await db.entities.SchedulingSettings.create(payload);
        setSettings(created);
      }
      toast({ title: "Configurações salvas", description: "Os períodos de agendamento foram atualizados." });
    } catch (e) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          <CalendarRange className="w-6 h-6 text-primary" /> Período de Avaliações
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Defina os períodos de marcação separadamente para o Ensino Médio e o
          Ensino Fundamental e bloqueie dias específicos (feriados, recessos).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Períodos por nível</CardTitle>
          <CardDescription>
            O professor só consegue marcar para o nível da turma selecionada
            dentro do período correspondente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <PeriodFields
                title="Ensino Médio"
                start={medioStart}
                end={medioEnd}
                setStart={setMedioStart}
                setEnd={setMedioEnd}
              />
              <PeriodFields
                title="Ensino Fundamental"
                start={fundStart}
                end={fundEnd}
                setStart={setFundStart}
                setEnd={setFundEnd}
              />
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar períodos
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dias bloqueados</CardTitle>
          <CardDescription>
            Datas que não estarão disponíveis para marcação, mesmo dentro dos
            períodos (aplicam-se aos dois níveis). Sábados e domingos dentro dos
            períodos são bloqueados automaticamente — você pode desmarcar os que
            quiser liberar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={addWeekends}>
            <CalendarRange className="w-4 h-4 mr-2" /> Bloquear sábados e domingos do período
          </Button>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="newblock">Adicionar data bloqueada</Label>
              <Input id="newblock" type="date" value={newBlock} onChange={(e) => setNewBlock(e.target.value)} />
            </div>
            <Button variant="outline" onClick={addBlock} disabled={!newBlock}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </div>
          {blocked.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum dia bloqueado.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {blocked.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/5 border border-destructive/30 text-sm"
                >
                  <span className="font-medium">{formatBR(d)}</span>
                  <button
                    type="button"
                    onClick={() => removeBlock(d)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <Button variant="secondary" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar dias bloqueados
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}