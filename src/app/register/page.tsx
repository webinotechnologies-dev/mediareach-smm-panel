import type { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Register - Create Free MediaReach Digital Account",
  description:
    "Create your free MediaReach Digital account. Instant access to 70+ social media reach and growth services at enterprise wholesale rates.",
  openGraph: {
    title: "Register | MediaReach Digital - Free Account",
    description:
      "Create a free account on MediaReach Digital. Instant access to automated Instagram, YouTube, Telegram growth solutions.",
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
