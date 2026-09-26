const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  School,
  LogOut,
  Menu,
  ExternalLink,
  CalendarRange,
} from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/lib/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV = [
  { to: "/admin", label: "Painel", icon: LayoutDashboard, end: true },
  { to: "/admin/professores", label: "Professores", icon: Users },
  { to: "/admin/disciplinas", label: "Disciplinas", icon: BookOpen },
  { to: "/admin/turmas", label: "Turmas", icon: School },
  { to: "/admin/usuarios", label: "Usuários", icon: Users },
  { to: "/admin/periodo", label: "Período", icon: CalendarRange },
];

function NavLinks({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
            }`
          }
        >
          <item.icon className="w-4 h-4" /> {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const doLogout = () => {
    db.auth.logout("/");
  };

  if (user && user.role && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold font-display">Acesso restrito</h1>
          <p className="text-muted-foreground text-sm mt-1 mb-4">
            Esta área é exclusiva de administradores. Sua conta não tem
            permissão de acesso.
          </p>
          <Link to="/">
            <Button variant="outline">Voltar ao calendário</Button>
          </Link>
        </div>
      </div>
    );
  }

  const brand = (
    <div className="flex items-center gap-3 px-1 py-1">
      <Logo className="w-10 h-10" />
      <div className="min-w-0">
        <div className="font-display font-bold text-sm leading-tight text-foreground truncate">
          Colégio Portal do Saber
        </div>
        <div className="text-[11px] text-muted-foreground">Painel Administrativo</div>
      </div>
    </div>
  );

  const sidebarInner = (
    <div className="flex flex-col h-full">
      <div className="pl-3 pr-10 py-4">{brand}</div>
      <div className="px-3">
        <NavLinks onNavigate={() => setOpen(false)} />
      </div>
      <div className="mt-auto p-3 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ExternalLink className="w-4 h-4" /> Ver calendário público
        </Link>
        <div className="text-xs text-muted-foreground px-3 truncate">
          {user?.email}
        </div>
        <Button variant="outline" className="w-full" onClick={doLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 border-r border-border bg-card">
        {sidebarInner}
      </aside>

      <div className="md:hidden sticky top-0 z-30 bg-card border-b border-border px-4 h-14 flex items-center justify-between">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            {sidebarInner}
          </SheetContent>
        </Sheet>
        <div className="font-display font-bold text-sm">Painel Administrativo</div>
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ExternalLink className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      <main className="md:pl-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}