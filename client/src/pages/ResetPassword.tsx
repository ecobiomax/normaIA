import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

function getTokenFromUrl(): string {
  const url = new URL(window.location.href);
  return url.searchParams.get("token") ?? "";
}

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const token = useMemo(() => getTokenFromUrl(), []);
  const [password, setPassword] = useState("");

  const resetMutation = trpc.auth.resetPassword.useMutation();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Token inválido");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      const res = await resetMutation.mutateAsync({ token, newPassword: password });
      if (!res.success) {
        toast.error(res.message ?? "Não foi possível redefinir a senha");
        return;
      }
      toast.success("Senha redefinida com sucesso. Faça login.");
      setLocation("/");
    } catch (e) {
      toast.error("Não foi possível redefinir a senha");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-slate-900">Redefinir senha</h1>
        <p className="text-slate-600 mt-2">Crie uma nova senha para sua conta.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              disabled={resetMutation.isPending}
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={resetMutation.isPending}>
            {resetMutation.isPending ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
