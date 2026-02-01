import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ForgotPasswordModal({ open, onOpenChange }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const requestMutation = trpc.auth.requestPasswordReset.useMutation();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Informe seu email");
      return;
    }

    try {
      const res = await requestMutation.mutateAsync({ email });
      if (res.resetUrl) {
        toast.success("Link de redefinição gerado (modo dev)");
        window.prompt("Copie o link abaixo:", res.resetUrl);
      } else {
        toast.success("Se o email existir, enviaremos instruções.");
      }
      onOpenChange(false);
    } catch (e) {
      toast.success("Se o email existir, enviaremos instruções.");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Esqueci minha senha</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={requestMutation.isPending}
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={requestMutation.isPending}>
            {requestMutation.isPending ? "Enviando..." : "Gerar link"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
