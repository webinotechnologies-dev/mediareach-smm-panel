import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Login - Sign In to Your MediaReach Digital Account",
  description:
    "Sign in to MediaReach Digital. Access your agency dashboard, launch digital reach campaigns for Instagram, YouTube, Telegram, Facebook, and more.",
  openGraph: {
    title: "Login | MediaReach Digital",
    description: "Sign in to access India's #1 automated digital reach agency dashboard.",
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
