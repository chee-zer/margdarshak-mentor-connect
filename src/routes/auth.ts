import { Router } from "express";

const passport = require("passport");
const LocalStrategy = require("passport-local");
const crypto = require("crypto");

//import the prisma client
const prisma = require("../db/prisma");
import { User as PrismaUser } from "@prisma/client";

const authRouter = Router();

//options object here is to replace the username with preferred thing
passport.use(
  new LocalStrategy({ usernameField: "email" }, async function verify(
    username: string,
    password: string,
    done: (error: any, user?: any, options?: { message: string }) => void
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: username },
      });

      if (!user) {
        return done(null, false, { message: "Incorrect name or password" });
      }

      crypto.pbkdf2(
        password,
        user.salt,
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
  })
);

//type safe user(from the schema)
declare global {
  namespace Express {
    interface User extends Omit<PrismaUser, "hashedPassword" | "salt"> {}
  }
}

passport.serializeUser(
  (user: Express.User, done: (error: any, user: any) => void) => {
    process.nextTick(() => {
      done(null, { id: user.id, email: user.email });
    });
  }
);

passport.deserializeUser(
  (
    user: { id: string; email: string },
    done: (error: any, user: any) => void
  ) => {
    process.nextTick(() => {
      done(null, user);
    });
  }
);

authRouter.post("/login");

authRouter.post(
  "/login/password",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

module.exports = authRouter;
