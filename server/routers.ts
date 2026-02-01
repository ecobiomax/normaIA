import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { chatRouter } from "./routers/chat";
import { subscriptionRouter } from "./routers/subscription";
import { documentsRouter } from "./routers/documents";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import * as db from "./db";
import { sdk } from "./_core/sdk";
import { ONE_YEAR_MS } from "@shared/const";
import {
  createLocalAuthUser,
  getLocalAuthUserByEmail,
} from "./_core/localAuthDb";
import {
  consumePasswordResetToken,
  createPasswordResetToken,
  updateLocalAuthPassword,
} from "./_core/localAuthDb";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    register: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
          name: z.string().min(1).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await getLocalAuthUserByEmail(input.email);
        if (existing) {
          return { success: false, message: "Email já cadastrado" } as const;
        }

        const passwordHash = await bcrypt.hash(input.password, 10);
        const openId = `local_${nanoid(24)}`;

        await createLocalAuthUser({
          email: input.email,
          passwordHash,
          openId,
          name: input.name ?? null,
        });

        await db.upsertUser({
          openId,
          email: input.email,
          name: input.name ?? null,
          loginMethod: "password",
          lastSignedIn: new Date(),
        });

        const user = await db.getUserByOpenId(openId);
        if (user) {
          const sub = await db.getSubscriptionByUserId(user.id);
          if (!sub) {
            await db.createSubscription(user.id);
          }
        }

        const sessionToken = await sdk.createSessionToken(openId, {
          name: input.name ?? input.email,
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        return { success: true } as const;
      }),

    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const localUser = await getLocalAuthUserByEmail(input.email);
        // Always return success to avoid user enumeration.
        if (!localUser) {
          return { success: true } as const;
        }

        const { token } = await createPasswordResetToken({ openId: localUser.openId });
        const baseUrl = process.env.BASE_URL || "http://localhost:3000";
        const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
        return { success: true, resetUrl } as const;
      }),

    resetPassword: publicProcedure
      .input(
        z.object({
          token: z.string().min(10),
          newPassword: z.string().min(6),
        })
      )
      .mutation(async ({ input }) => {
        const consumed = await consumePasswordResetToken({ token: input.token });
        if (!consumed) {
          return { success: false, message: "Token inválido ou expirado" } as const;
        }

        const passwordHash = await bcrypt.hash(input.newPassword, 10);
        await updateLocalAuthPassword({ openId: consumed.openId, passwordHash });
        return { success: true } as const;
      }),

    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const localUser = await getLocalAuthUserByEmail(input.email);
        if (!localUser) {
          return { success: false, message: "Credenciais inválidas" } as const;
        }

        const ok = await bcrypt.compare(input.password, localUser.passwordHash);
        if (!ok) {
          return { success: false, message: "Credenciais inválidas" } as const;
        }

        await db.upsertUser({
          openId: localUser.openId,
          email: localUser.email,
          name: localUser.name,
          loginMethod: "password",
          lastSignedIn: new Date(),
        });

        const user = await db.getUserByOpenId(localUser.openId);
        if (user) {
          const sub = await db.getSubscriptionByUserId(user.id);
          if (!sub) {
            await db.createSubscription(user.id);
          }
        }

        const sessionToken = await sdk.createSessionToken(localUser.openId, {
          name: localUser.name ?? localUser.email,
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        return { success: true } as const;
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  chat: chatRouter,
  subscription: subscriptionRouter,
  documents: documentsRouter,
});

export type AppRouter = typeof appRouter;
