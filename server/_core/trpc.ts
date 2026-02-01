import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { SUBSCRIPTION_EXPIRED_ERR_MSG } from "@shared/const";
import { createSubscription, getSubscriptionByUserId, updateSubscription } from "../db-sqlite";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

const requireSubscriptionAccess = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  const now = Date.now();
  let subscription = await getSubscriptionByUserId(ctx.user.id);

  if (!subscription) {
    await createSubscription(ctx.user.id);
    subscription = await getSubscriptionByUserId(ctx.user.id);
  }

  if (!subscription) {
    throw new TRPCError({ code: "FORBIDDEN", message: SUBSCRIPTION_EXPIRED_ERR_MSG });
  }

  if (subscription.status === "active") {
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }

  const trialEndMs = subscription.trialEnd
    ? new Date(subscription.trialEnd).getTime()
    : ctx.user.createdAt
      ? new Date(ctx.user.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000
      : 0;

  const isTrialValid = subscription.status === "trial" && trialEndMs > 0 && now < trialEndMs;

  if (isTrialValid) {
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }

  if (subscription.status !== "expired") {
    await updateSubscription(ctx.user.id, { status: "expired" });
  }

  throw new TRPCError({ code: "FORBIDDEN", message: SUBSCRIPTION_EXPIRED_ERR_MSG });
});

export const subscriberProcedure = t.procedure.use(requireUser).use(requireSubscriptionAccess);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
