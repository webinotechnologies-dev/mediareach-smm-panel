import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mediareachdigital.com";

  if (error || !code) {
    return NextResponse.redirect(new URL("/login?error=Google+Sign-In+cancelled", baseUrl));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=Google+OAuth+credentials+missing", baseUrl));
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Google token exchange error:", errText);
      return NextResponse.redirect(new URL("/login?error=Google+Authentication+failed", baseUrl));
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch user profile from Google
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      return NextResponse.redirect(new URL("/login?error=Failed+to+fetch+profile", baseUrl));
    }

    const profile = await profileRes.json();
    const email = profile.email?.toLowerCase().trim();

    if (!email) {
      return NextResponse.redirect(new URL("/login?error=Email+not+provided+by+Google", baseUrl));
    }

    // 3. Find or Create User
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Generate clean unique username
      let baseUsername = (profile.name || email.split("@")[0])
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 15);
      if (!baseUsername) baseUsername = "user";

      let username = baseUsername;
      let counter = 1;
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      const randomPassword = Math.random().toString(36).slice(-12) + "A1!";
      const passwordHash = hashPassword(randomPassword);

      // Create new user with ₹0.0 balance (No bonus)
      user = await prisma.user.create({
        data: {
          email,
          username,
          passwordHash,
          role: "USER",
          balance: 0.0,
          apiKey: "smm_usr_" + Math.random().toString(36).substring(2, 15),
        },
      });
    }

    // 4. Create Session JWT
    const token = signToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role as "USER" | "ADMIN",
    });

    // 5. Redirect to /new-order with authenticated session cookie
    const response = NextResponse.redirect(new URL("/new-order", baseUrl));
    response.cookies.set("smm_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (e: any) {
    console.error("Google OAuth error:", e);
    return NextResponse.redirect(new URL("/login?error=" + encodeURIComponent(e.message || "OAuth error"), baseUrl));
  }
}
