import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "smm-panel-ultra-secure-jwt-secret-key-2026-bhati";

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  role: "USER" | "ADMIN";
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<(SessionUser & { balance: number; isBanned: boolean; apiKey?: string | null; customDiscountPercent: number }) | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("smm_session")?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true as any,
        balance: true,
        isBanned: true,
        apiKey: true,
        customDiscountPercent: true,
      },
    });

    if (!user || user.isBanned) return null;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role as "USER" | "ADMIN",
      balance: user.balance,
      isBanned: user.isBanned,
      apiKey: user.apiKey,
      customDiscountPercent: user.customDiscountPercent || 0,
    };
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}
