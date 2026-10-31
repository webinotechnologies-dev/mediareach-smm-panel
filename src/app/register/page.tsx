import type { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Register - Create Free SMM Panel Account",
  description:
    "Create your free MediaReach SMM panel account. Get instant access to 70+ social media growth services. Buy Instagram followers, YouTube views, Telegram members at India's lowest prices.",
  openGraph: {
    title: "Register | MediaReach SMM Panel - Free Account",
    description:
      "Create a free account on India's cheapest SMM panel. Instant access to Instagram, YouTube, Telegram services.",
    url: "https://mediareachdigital.com/register",
    type: "website",
  },
  alternates: {
    canonical: "https://mediareachdigital.com/register",
  },
  robots: {
    index: true,
    follow: false,
  },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
