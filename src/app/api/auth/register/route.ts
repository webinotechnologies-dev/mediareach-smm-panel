import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, username, password } = body;

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "Email, username, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check existing
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase().trim() }, { username: username.trim() }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email or username already exists" },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);
    const apiKey = "smm_live_usr_" + Math.random().toString(36).substring(2, 15);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        username: username.trim(),
        passwordHash,
        role: "USER",
        balance: 0.0, // Standard 0.0 balance (No bonus)
        apiKey,
      },
    });

    // Create session token
    const token = signToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role as "USER" | "ADMIN",
    });

    const cookieStore = cookies();
    cookieStore.set("smm_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        balance: user.balance,
      },
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}
