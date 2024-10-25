import { Express } from "express";
import { User as PrismaUser } from "@prisma/client";

//type safe user(from the schema)
declare global {
  namespace Express {
    interface User extends Omit<PrismaUser, "hashedPassword" | "salt"> {}
  }
}
