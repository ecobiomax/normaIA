import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Lock, Loader2, Mail } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [, setLocation] = useLocation();

  const utils = trpc.useUtils();
  const loginMutation = trpc.auth.login.useMutation();

  const isLoading = loginMutation.isPending;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    try {
      const res = await loginMutation.mutateAsync({ email, password });
      if (!res.success) {
        toast.error(res.message ?? "Email ou senha inválidos");
        return;
      }
      await utils.auth.me.invalidate();
      toast.success("Login realizado com sucesso!");
      onOpenChange(false);
      setLocation("/dashboard");
    } catch (error) {
      toast.error("Email ou senha inválidos");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Entrar</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>

          <button
            type="button"
            className="text-sm text-blue-600 hover:underline w-full text-center"
            onClick={() => setForgotOpen(true)}
            disabled={isLoading}
          >
            Esqueci minha senha
          </button>
          </form>
        </DialogContent>
      </Dialog>

      <ForgotPasswordModal open={forgotOpen} onOpenChange={setForgotOpen} />
    </>
  );
}
