import { Request, Response, NextFunction } from "express";
import passport from "passport";
import crypto from "crypto";
import { Strategy } from "passport-local";
const prisma = require("../db/prisma");

passport.use(
  "what",
  new Strategy(
    { usernameField: "email", passReqToCallback: true },
    async function verify(
      req: Request,
      email: string,
      password: string,
      done: (error: any, user?: any, options?: { message: string }) => void
    ) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: email },
        });

        if (!user) {
          return done(null, false, { message: "Incorrect name or password" });
        }

        crypto.pbkdf2(
          password,
          Buffer.from(user.salt, "hex"),
          310000,
          32,
          "sha256",
          (err: Error | null, hashedPassword: Buffer) => {
            if (err) {
              return done(err);
            }
            if (
              !crypto.timingSafeEqual(
                Buffer.from(user.hashedPassword, "hex"),
                hashedPassword
              )
            ) {
              return done(null, false, {
                message: "Incorrect username or password.",
              });
            }
            return done(null, user);
          }
        );
      } catch (err) {
        return done(err);
      }
    }
  )
);

//serialize and deserialize
passport.serializeUser(
  (user: Express.User, done: (error: any, user: any) => void) => {
    process.nextTick(() => {
      done(null, { id: user.id, name: user.name, role: user.role });
    });
  }
);

passport.deserializeUser(
  (
    user: { id: string; name: string; role: string },
    done: (error: any, user: any) => void
  ) => {
    process.nextTick(() => {
      done(null, user);
    });
  }
);
