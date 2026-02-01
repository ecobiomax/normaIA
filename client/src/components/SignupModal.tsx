import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";

interface SignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SignupModal({ open, onOpenChange }: SignupModalProps) {
  const handleGoogleSignIn = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crie sua conta NormaIA</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              ✓ <strong>7 dias grátis</strong> com acesso completo
            </p>
            <p className="text-sm text-blue-900 mt-1">
              ✓ Sem cartão de crédito necessário
            </p>
          </div>

          <Button 
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-3 h-12 border-slate-300 hover:bg-slate-50"
            onClick={handleGoogleSignIn}
          >
            <Chrome className="w-5 h-5 text-red-500" />
            <span>Continuar com Google</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Rápido e seguro</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 text-center">
            Ao se registrar, você concorda com nossos{" "}
            <a href="#" className="text-blue-600 hover:underline">Termos de Serviço</a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
