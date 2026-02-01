import { Router } from "express";
import { passport } from "../_core/googleAuth";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { sdk } from "../_core/sdk";
import { ONE_YEAR_MS } from "@shared/const";
import * as db from "../db-sqlite";

const router = Router();

// Google OAuth login endpoint
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
  prompt: "select_account",
}));

// Google OAuth callback endpoint
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/?error=google_auth_failed" }),
  async (req, res) => {
    try {
      const user = req.user as any;
      if (!user) {
        return res.redirect("/?error=no_user");
      }

      // Create session token
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || user.email,
        expiresInMs: ONE_YEAR_MS,
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      // Redirect to dashboard
      res.redirect("/dashboard");
    } catch (error) {
      console.error("[Auth] Error in Google callback:", error);
      res.redirect("/?error=auth_error");
    }
  }
);

// Logout endpoint
router.post("/logout", (req, res) => {
  const cookieOptions = getSessionCookieOptions(req);
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
  res.json({ success: true });
});

export default router;
