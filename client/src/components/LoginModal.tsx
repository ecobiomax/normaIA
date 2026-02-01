import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const handleGoogleSignIn = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Entrar</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <Button 
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-3 h-12 border-slate-300 hover:bg-slate-50"
            onClick={handleGoogleSignIn}
          >
            <Chrome className="w-5 h-5 text-red-500" />
            <span>Entrar com Google</span>
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
            Não tem conta?{" "}
            <a href="#" className="text-blue-600 hover:underline">Cadastre-se</a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
