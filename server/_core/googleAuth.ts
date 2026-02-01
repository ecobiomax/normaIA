import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { ENV } from "./env";
import * as db from "../db-sqlite";
import { nanoid } from "nanoid";

// Configure Google OAuth Strategy
export function configureGoogleAuth() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = `${ENV.baseUrl}/api/auth/google/callback`;

  if (!clientID || !clientSecret) {
    console.warn("[GoogleAuth] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || profile.name?.givenName || email;
          const googleId = profile.id;

          if (!email) {
            return done(new Error("No email found in Google profile"), false);
          }

          // Check if user exists by email
          let user = await db.getUserByOpenId(`google_${googleId}`);

          if (!user) {
            // Create new user
            const openId = `google_${googleId}`;
            await db.upsertUser({
              openId,
              email,
              name,
              loginMethod: "google",
              lastSignedIn: new Date(),
            });
            user = await db.getUserByOpenId(openId);

            // Create subscription for new user
            if (user) {
              const sub = await db.getSubscriptionByUserId(user.id);
              if (!sub) {
                await db.createSubscription(user.id);
              }
            }
          } else {
            // Update last signed in
            await db.upsertUser({
              openId: user.openId,
              lastSignedIn: new Date(),
            });
          }

          return done(null, user);
        } catch (error) {
          console.error("[GoogleAuth] Error:", error);
          return done(error, false);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.openId);
  });

  passport.deserializeUser(async (openId: string, done) => {
    try {
      const user = await db.getUserByOpenId(openId);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  console.log("[GoogleAuth] Configured successfully");
}

export { passport };
