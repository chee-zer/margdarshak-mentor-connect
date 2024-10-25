import express, { Request, Response } from "express";
const dotenv = require("dotenv").config();
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
const prisma = require("./db/prisma");
const authRouter = require("./routes/auth");
const passport = require("passport");

import session from "express-session";
const app = express();

app.use(express.json());

app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
    secret: process.env.SESSION_SECRET || "dotenvdoesntfuckingworkplsfix",
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, //2 days
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("hi");
});

app.listen(3000, () => console.log("server listening at port: 3000..."));
