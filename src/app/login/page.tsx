import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Login - Sign In to Your SMM Panel Account",
  description:
    "Sign in to MediaReach SMM panel. Access your dashboard, place orders for Instagram followers, YouTube views, Telegram members and more. Fast login with Google or email.",
  openGraph: {
    title: "Login | MediaReach SMM Panel",
    description: "Sign in to access India's cheapest SMM panel dashboard.",
    url: "https://mediareachdigital.com/login",
    type: "website",
  },
  alternates: {
    canonical: "https://mediareachdigital.com/login",
  },
  robots: {
    index: true,
    follow: false,
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
