// Google OAuth configuration using Passport.js
// Purpose: Configure Google OAuth 2.0 strategy for user authentication

import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { prisma } from '@gatekeeper/database';
import { getJWTService } from '@gatekeeper/jwt-core';

const jwtService = getJWTService();

export function initializePassport() {
  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          avatarUrl: true,
          googleId: true,
        },
      });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy (only register if credentials are configured)
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('Google OAuth credentials not configured - Google login will be unavailable');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile: Profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await prisma.user.findUnique({
            where: { googleId: profile.id },
          });

          if (user) {
            // User exists, return user
            return done(null, user);
          }

          // Check if user exists with the same email (for account linking)
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email provided by Google'), undefined);
          }

          user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            // Link Google account to existing user
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId: profile.id,
                avatarUrl: profile.photos?.[0]?.value,
              },
            });
            return done(null, user);
          }

          // Create new user
          user = await prisma.user.create({
            data: {
              email,
              googleId: profile.id,
              fullName: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value,
              role: 'ATTENDEE',
            },
          });

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}
