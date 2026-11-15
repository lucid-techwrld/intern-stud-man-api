declare global {
  namespace Express {
    interface Request {
      validated?: unknown;
      admin?: { email: string };
    }
  }
}
export {};
