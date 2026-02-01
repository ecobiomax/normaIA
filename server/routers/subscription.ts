import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getSubscriptionByUserId, updateSubscription } from "../db-sqlite";
import axios from 'axios';

export const subscriptionRouter = router({
  getStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const subscription = await getSubscriptionByUserId(ctx.user.id);
      if (!subscription) {
        return { status: "none", message: "Sem assinatura ativa" };
      }

      const now = new Date();
      const trialEnd = subscription.trialEnd ? new Date(subscription.trialEnd) : null;

      if (subscription.status === "trial" && trialEnd && now < trialEnd) {
        const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { status: "trial", daysLeft, trialEnd };
      }

      if (subscription.status === "trial" && trialEnd && now >= trialEnd) {
        await updateSubscription(ctx.user.id, { status: "expired" });
        return { status: "expired" };
      }

      if (subscription.status === "active") {
        return { status: "active", nextDueDate: subscription.nextDueDate };
      }

      return { status: subscription.status };
    }),

  createPaymentLink: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const response = await axios.post(
          'https://api.abacatepay.com/v1/billing/create',
          {
            customer_id: ctx.user.id.toString(),
            customer_email: ctx.user.email,
            customer_name: ctx.user.name || 'Usuário',
            description: 'Assinatura NormaIA - Acesso mensal',
            amount: 8900, // R$89,00 em centavos
            currency: 'BRL',
            payment_type: 'MULTIPLE_PAYMENTS',
            billing_type: 'MONTHLY',
            callback_url: `${process.env.BASE_URL || 'http://localhost:3000'}/api/webhooks/abacate`,
            success_url: `${process.env.BASE_URL || 'http://localhost:3000'}/dashboard?payment=success`,
            cancel_url: `${process.env.BASE_URL || 'http://localhost:3000'}/dashboard?payment=cancelled`,
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.ABACATE_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const billingData = response.data;

        // Atualizar assinatura com ID do billing
        await updateSubscription(ctx.user.id, {
          abacatePayBillingId: billingData.id,
          status: 'pending',
        });

        return {
          success: true,
          paymentUrl: billingData.payment_url,
          billingId: billingData.id,
        };

      } catch (error) {
        console.error('Error creating payment link:', error);
        
        return {
          success: false,
          message: 'Erro ao gerar link de pagamento. Tente novamente.',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),
});
