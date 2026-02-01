import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export default function SubscriptionExpired() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: subscriptionStatus, refetch } = trpc.subscription.getStatus.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const createPaymentLink = trpc.subscription.createPaymentLink.useMutation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/");
    }
  }, [loading, isAuthenticated, setLocation]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (subscriptionStatus?.status === "active") {
      setLocation("/dashboard");
    }
  }, [subscriptionStatus?.status, setLocation]);

  const handlePayment = async () => {
    try {
      const result = await createPaymentLink.mutateAsync();
      if (result.success && result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }
      toast.error(result.message || "Erro ao gerar link de pagamento");
    } catch (e) {
      toast.error("Erro ao gerar link de pagamento");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Redirecionando...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-4">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-slate-900">Assinatura expirada</h1>
          <p className="text-slate-600 mt-2">
            Seu período de teste terminou. Para continuar usando o NormaIA, ative sua assinatura.
          </p>

          <div className="mt-6 space-y-2 text-sm text-slate-700">
            <div className="flex justify-between">
              <span>Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span className="font-medium">{subscriptionStatus?.status ?? "-"}</span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              onClick={handlePayment}
              disabled={createPaymentLink.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createPaymentLink.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando cobrança...
                </>
              ) : (
                "Ativar assinatura"
              )}
            </Button>

            <Button variant="outline" onClick={() => setLocation("/")}>Voltar</Button>
          </div>
        </Card>

        <p className="text-xs text-slate-500 text-center">
          Assim que o pagamento for confirmado, seu acesso será liberado automaticamente.
        </p>
      </div>
    </div>
  );
}
