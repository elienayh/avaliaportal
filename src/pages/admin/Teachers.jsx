import React from "react";
import CatalogManager from "@/components/CatalogManager";

export default function Teachers() {
  return (
    <CatalogManager
      entityName="Teacher"
      title="Professores"
      description="Cadastre os professores para agilizar as marcações no calendário."
      placeholder="Nome do professor"
    />
  );
}