import { Request, Response, NextFunction, Router } from "express";
import crypto from "crypto";
import passport from "passport";
import { Strategy } from "passport-local";

import { isAuth, signupUser, loginUser } from "../controllers/authController";

import { serializeBigInt } from "../util/serializeBigInt";

//import the prisma client
const prisma = require("../db/prisma");

const authRouter = Router();

authRouter.post(
  "/login",
  passport.authenticate("what", {
    failureMessage: true,
    //failureRedirect: "/login",
  }),
  loginUser
);

authRouter.post("/signup", signupUser);

authRouter.get("/login", (req: Request, res: Response) => {
  const user = req.user;
  res.status(401).json({
    message: req.session.messages,
  });
});

authRouter.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

module.exports = authRouter;
