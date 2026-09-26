import React from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import Logo from "@/components/Logo";

export default function SiteHeader() {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Logo className="w-10 h-10 ring-2 ring-white/30" />
          <div className="min-w-0">
            <h1 className="font-display font-bold text-base sm:text-lg leading-tight truncate">
              COLÉGIO PORTAL DO SABER
            </h1>
            <p className="text-[11px] sm:text-xs text-white/80 leading-tight">
              Agendamento Ensino Médio
            </p>
          </div>
        </div>
        <Link
          to="/login?returnTo=/admin"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium bg-white/10 hover:bg-white/20 transition px-3 py-2 rounded-lg shrink-0"
        >
          <Lock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Acesso Restrito</span>
          <span className="sm:hidden">Admin</span>
        </Link>
      </div>
    </header>
  );
}