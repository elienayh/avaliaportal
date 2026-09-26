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
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

import { useToast } from "@/components/ui/use-toast";
import AssessmentForm from "@/components/AssessmentForm";
import { Trash2 } from "lucide-react";

export default function AdminAssessmentDialog({
  open,
  onOpenChange,
  mode,
  assessment,
  date,
  teachers,
  subjects,
  classes,
  onChanged,
}) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initial = mode === "edit" ? assessment : { date };
  const resetKey = mode === "edit" ? assessment?.id : "new-" + date;

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      if (mode === "edit") {
        if (data.date !== assessment.date || data.class_name !== assessment.class_name) {
          const taken = await db.entities.Assessment.filter({
            date: data.date,
            class_name: data.class_name,
          });
          if (taken.some((t) => t.id !== assessment.id)) {
            setError(
              "Esta turma já possui uma avaliação nesta data. Escolha outra data ou turma."
            );
            setSubmitting(false);
            return;
          }
        }
        await db.entities.Assessment.update(assessment.id, data);
        toast({ title: "Avaliação atualizada" });
        onChanged?.();
        onOpenChange(false);
      } else {
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
        await db.entities.Assessment.create(data);
        toast({ title: "Avaliação marcada" });
        onChanged?.();
        onOpenChange(false);
      }
    } catch (e) {
      setError(e.message || "Erro ao salvar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await db.entities.Assessment.delete(assessment.id);
      toast({
        title: "Reserva excluída",
        description: "A data foi liberada.",
      });
      setConfirmOpen(false);
      onChanged?.();
      onOpenChange(false);
    } catch (e) {
      toast({
        title: "Erro ao excluir",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const content = (
    <>
      <AssessmentForm
        initial={initial}
        resetKey={resetKey}
        teachers={teachers}
        subjects={subjects}
        classes={classes}
        lockDate={false}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        submitLabel={mode === "edit" ? "Salvar Alterações" : "Confirmar Marcação"}
      />
      {mode === "edit" && (
        <div className="pt-4 border-t border-border mt-4">
          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive border-destructive/40 hover:bg-destructive/5"
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Excluir reserva / liberar data
          </Button>
        </div>
      )}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              A data voltará a ficar disponível para nova marcação. Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Excluindo..." : "Sim, excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>
              {mode === "edit" ? "Editar Avaliação" : "Marcar Avaliação"}
            </DrawerTitle>
            <DrawerDescription>
              {mode === "edit"
                ? "Altere os dados da reserva."
                : "Preencha os dados para reservar a data."}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar Avaliação" : "Marcar Avaliação"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Altere os dados da reserva."
              : "Preencha os dados para reservar a data."}
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}