import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, CreditCard, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function SubscriptionPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: subscriptionStatus, refetch } = trpc.subscription.getStatus.useQuery();
  const createPaymentLink = trpc.subscription.createPaymentLink.useMutation();

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const result = await createPaymentLink.mutateAsync();
      
      if (result.success && result.paymentUrl) {
        toast.success("Redirecionando para pagamento...");
        window.location.href = result.paymentUrl;
      } else {
        toast.error(result.message || "Erro ao gerar link de pagamento");
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Erro ao processar pagamento");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Refetch subscription status when component mounts
    refetch();
  }, [refetch]);

  const isTrialActive = subscriptionStatus?.status === 'trial';
  const isActive = subscriptionStatus?.status === 'active';
  const trialDaysLeft = subscriptionStatus?.daysLeft || 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Minha Assinatura</h2>
        <p className="text-slate-600">Gerencie seu plano e pagamentos</p>
      </div>

      {/* Trial Status */}
      {isTrialActive && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Período de Teste Ativo</h3>
              <p className="text-sm text-blue-800 mb-4">
                Você tem <strong>{trialDaysLeft} dias</strong> restantes de acesso gratuito.
              </p>
              <Button
                onClick={handlePayment}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Ativar Assinatura Profissional"
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Current Plan */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Plano Atual
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Plano</span>
            <span className="font-semibold text-slate-900">Profissional</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Preço</span>
            <span className="font-semibold text-slate-900">R$ 89,00/mês</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Status</span>
            <span className={`flex items-center gap-2 font-semibold ${
              isActive ? 'text-green-600' : isTrialActive ? 'text-blue-600' : 'text-red-600'
            }`}>
              <CheckCircle className="w-4 h-4" />
              {isActive ? 'Ativo' : isTrialActive ? 'Trial' : 'Inativo'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Próximo Pagamento</span>
            <span className="font-semibold text-slate-900">
              {subscriptionStatus?.nextDueDate 
                ? new Date(subscriptionStatus.nextDueDate).toLocaleDateString('pt-BR')
                : 'N/A'
              }
            </span>
          </div>
        </div>
      </Card>

      {/* Payment History */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Histórico de Pagamentos
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <p className="font-semibold text-slate-900">Assinatura Profissional</p>
              <p className="text-sm text-slate-600">31 de janeiro de 2026</p>
            </div>
            <span className="font-semibold text-green-600">R$ 89,00</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <p className="font-semibold text-slate-900">Assinatura Profissional</p>
              <p className="text-sm text-slate-600">31 de dezembro de 2025</p>
            </div>
            <span className="font-semibold text-green-600">R$ 89,00</span>
          </div>
        </div>
      </Card>

      {/* Plan Features */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">O que está incluído</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-slate-700">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            Chat ilimitado com IA
          </li>
          <li className="flex items-center gap-2 text-slate-700">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            Upload ilimitado de normas
          </li>
          <li className="flex items-center gap-2 text-slate-700">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            Histórico completo de conversas
          </li>
          <li className="flex items-center gap-2 text-slate-700">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            Suporte prioritário
          </li>
          <li className="flex items-center gap-2 text-slate-700">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            Acesso mobile-first
          </li>
        </ul>
      </Card>

      {/* Cancel Subscription */}
      <Card className="p-6 border-red-200 bg-red-50">
        <h3 className="font-semibold text-red-900 mb-2">Cancelar Assinatura</h3>
        <p className="text-sm text-red-800 mb-4">
          Você pode cancelar sua assinatura a qualquer momento. Seu acesso continuará até o final do período de faturamento.
        </p>
        <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
          Cancelar Assinatura
        </Button>
      </Card>
    </div>
  );
}
