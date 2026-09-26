import React from "react";
import CatalogManager from "@/components/CatalogManager";

export default function Subjects() {
  return (
    <CatalogManager
      entityName="Subject"
      title="Disciplinas"
      description="Cadastre as disciplinas disponíveis para as avaliações."
      placeholder="Nome da disciplina"
    />
  );
}