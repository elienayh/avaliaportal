const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Users as UsersIcon, UserPlus, Shield, Loader2 } from "lucide-react";
import { formatBR } from "@/lib/calendar";

export default function Users() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const data = await db.entities.User.list();
      setUsers(data);
    } catch (e) {
      toast({
        title: "Erro ao carregar usuários",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await db.users.inviteUser(email.trim(), role);
      toast({
        title: "Convite enviado",
        description: `${email.trim()} foi convidado como ${
          role === "admin" ? "administrador" : "usuário"
        }.`,
      });
      setEmail("");
      load();
    } catch (err) {
      const msg = (err.message || "").toLowerCase();
      let description = err.message;
      if (
        msg.includes("403") ||
        msg.includes("permission") ||
        msg.includes("insufficient") ||
        msg.includes("forbidden")
      ) {
        description =
          "Sem permissão para convidar. Esta operação exige privilégios de administrador principal do workspace.";
      } else if (msg.includes("already") || msg.includes("exists")) {
        description = "Este e-mail já possui convite ou cadastro ativo.";
      }
      toast({
        title: "Erro ao convidar",
        description,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabel = (r) => (r === "admin" ? "Administrador" : "Usuário");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          <UsersIcon className="w-6 h-6 text-primary" /> Usuários e Administradores
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Convide novos administradores ou usuários para acessar o painel.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Convidar novo usuário</CardTitle>
          <CardDescription>
            O convidado receberá um link de acesso por e-mail.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleInvite}
            className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end"
          >
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="invite-email">E-mail</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5 sm:w-48">
              <Label htmlFor="invite-role">Papel</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={submitting} className="sm:w-auto">
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Convidar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usuários cadastrados</CardTitle>
          <CardDescription>
            {users.length} usuário(s) com acesso ao painel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Desde</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.full_name || "—"}
                        {u.id === currentUser?.id && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (você)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.role === "admin"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {u.role === "admin" && <Shield className="w-3 h-3" />}
                          {roleLabel(u.role)}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {u.created_date
                          ? new Date(u.created_date).toLocaleDateString("pt-BR")
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}