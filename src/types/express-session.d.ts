import "express-session";

declare module "express-session" {
  interface SessionData {
    messages?: string[];
    passport?: {
      user?: {
        id: string;
        name: string;
        role: string;
      };
    };
  }
}
