import { Request, Response } from 'express';
import { updateSubscription, getSubscriptionByUserId } from '../db';
import crypto from 'crypto';

export async function handleAbacateWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers['x-abacate-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Verificar assinatura do webhook (se aplicável)
    if (signature && process.env.ABACATE_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.ABACATE_WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');

      if (signature !== `sha256=${expectedSignature}`) {
        console.error('Invalid webhook signature');
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }
    }

    const { event, data } = req.body;

    switch (event) {
      case 'billing.paid':
        await handleBillingPaid(data);
        break;
      
      case 'billing.cancelled':
        await handleBillingCancelled(data);
        break;
      
      case 'billing.failed':
        await handleBillingFailed(data);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleBillingPaid(data: any) {
  const customer_id = data?.customer_id ?? data?.customerId;
  const billing_id = data?.billing_id ?? data?.billingId ?? data?.id;
  const paid_at = data?.paid_at ?? data?.paidAt ?? data?.paidAtUtc;
  const status = data?.status;

  if (!customer_id) {
    console.error('Webhook billing.paid missing customer_id');
    return;
  }

  if (status && String(status).toUpperCase() !== 'PAID') {
    return;
  }

  console.log(`Payment received for customer ${customer_id}, billing ${billing_id}`);

  // Buscar assinatura atual
  const userId = parseInt(String(customer_id), 10);
  const subscription = await getSubscriptionByUserId(userId);
  
  if (!subscription) {
    console.error(`Subscription not found for user ${customer_id}`);
    return;
  }

  // Calcular próxima data de vencimento (30 dias a partir de hoje)
  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + 30);

  // Atualizar assinatura como ativa
  await updateSubscription(userId, {
    status: 'active',
    abacatePayBillingId: billing_id ? String(billing_id) : subscription.abacatePayBillingId,
    nextDueDate,
    lastPaymentDate: paid_at ? new Date(paid_at) : new Date(),
  });

  console.log(`Subscription activated for user ${customer_id}`);
}

async function handleBillingCancelled(data: any) {
  const { customer_id, billing_id } = data;

  console.log(`Billing cancelled for customer ${customer_id}, billing ${billing_id}`);

  await updateSubscription(parseInt(String(customer_id), 10), {
    status: 'cancelled',
    abacatePayBillingId: billing_id ? String(billing_id) : undefined,
  });
}

async function handleBillingFailed(data: any) {
  const { customer_id, billing_id } = data;

  console.log(`Billing failed for customer ${customer_id}, billing ${billing_id}`);

  await updateSubscription(parseInt(String(customer_id), 10), {
    status: 'pending',
    abacatePayBillingId: billing_id ? String(billing_id) : undefined,
  });
}
