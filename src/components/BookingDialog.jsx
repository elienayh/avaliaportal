const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

import { useToast } from "@/components/ui/use-toast";
import AssessmentForm from "@/components/AssessmentForm";
import { formatBR, isBookableForLevel } from "@/lib/calendar";

export default function BookingDialog({
  open,
  onOpenChange,
  date,
  teachers,
  subjects,
  classes,
  settings,
  onBooked,
}) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      // Regra: uma avaliação por turma por dia.
      const taken = await db.entities.Assessment.filter({
        date: data.date,
        class_name: data.class_name,
      });
      if (taken.length > 0) {
        setError(
          "Esta turma já possui uma avaliação nesta data. Escolha outra data ou turma."
        );
        setSubmitting(false);
        return;
      }
      // Valida o nível da turma contra o período liberado para aquele nível.
      const cls = classes.find((c) => c.name === data.class_name);
      const level = cls?.level;
      if (level && !isBookableForLevel(data.date, settings, level)) {
        setError(
          `Esta data não está liberada para ${level}. Verifique o período de marcação aberto para o nível da turma.`
        );
        setSubmitting(false);
        return;
      }
      await db.entities.Assessment.create(data);
      toast({
        title: "Avaliação marcada!",
        description: `${formatBR(data.date)} reservada com sucesso.`,
      });
      onBooked?.();
      onOpenChange(false);
    } catch (e) {
      setError(e.message || "Erro ao marcar avaliação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const form = (
    <AssessmentForm
      initial={{ date }}
      resetKey={date}
      teachers={teachers}
      subjects={subjects}
      classes={classes}
      lockDate
      onSubmit={handleSubmit}
      submitting={submitting}
      error={error}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Marcar Avaliação</DrawerTitle>
            <DrawerDescription>
              Preencha os dados para reservar a data.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">{form}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Marcar Avaliação</DialogTitle>
          <DialogDescription>
            Preencha os dados para reservar a data.
          </DialogDescription>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  );
}