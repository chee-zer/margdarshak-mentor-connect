import { Express, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { serializeBigInt } from "../util/serializeBigInt";
import passport from "passport";
const prisma = require("../db/prisma");

export const signupUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, phone, password, role } = req.body;

  // Basic validation
  if (!name || !email || !phone || !password || !role) {
    res.status(400).json({ error: "All fields are required" });
  }
  console.log("validated");

  const salt = crypto.randomBytes(16);
  console.log("salt created");

  try {
    const hashedPassword = await new Promise<Buffer>((resolve, reject) => {
      crypto.pbkdf2(
        password,
        salt,
        310000,
        32,
        "sha256",
        (err: any, derivedKey: Buffer) => {
          if (err) reject(err);
          console.log("no error, returned derivedKey");
          resolve(derivedKey);
        }
      );
    });
    console.log("here because.");

    let user = await prisma.user.create({
      data: {
        name,
        email,
        phone: BigInt(phone),
        hashedPassword: hashedPassword.toString("hex"),
        salt: salt.toString("hex"),
        verificationStatus: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        role,
      },
    });
    console.log("user created");

    const { hashedPassword: _, salt: __, ...userWithoutSensitiveInfo } = user;
    console.log("userwithoutsensitiveinfo also created");

    const serializedUser = serializeBigInt(userWithoutSensitiveInfo);

    res.status(201).json({
      message: "User created successfully",
      user: serializedUser,
    });
    console.log("Response sent successfully");

    //better error handling will be added later
  } catch (error: any) {
    console.log("atleast getting errors");
    if (error.code === "P2002") {
      res.status(409).json({ error: "Email or phone number already exists" });
    } else {
      res.status(500).json({
        error: "aAn unexpected error occured",
      });
    }
  }
};

export const loginUser = (req: Request, res: Response) => {
  console.log("logged in successfully, redirecting to home...");
  res.redirect("/home");
};

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({
    message: "You are not logged in. Please log in to access.",
  });
};
