import type { Metadata } from "next";
import "./globals.css";
import WhatsAppWidget from "@/components/WhatsAppWidget";

export const metadata: Metadata = {
  metadataBase: new URL("https://mediareachdigital.com"),
  title: {
    default: "MediaReach | India's #1 SMM Panel - Cheapest Social Media Services",
    template: "%s | MediaReach SMM Panel",
  },
  description:
    "India's cheapest & fastest SMM panel. Buy Instagram followers, YouTube views, Telegram members, Facebook likes at wholesale rates. Instant delivery, 24/7 support.",
  keywords: [
    "smm panel india",
    "buy instagram followers india",
    "cheap youtube views",
    "telegram members india",
    "facebook likes india",
    "smm panel",
    "social media marketing panel",
    "instagram followers cheap",
    "youtube views cheap india",
    "mediareach smm",
  ],
  authors: [{ name: "MediaReach Digital" }],
  creator: "MediaReach Digital",
  publisher: "MediaReach Digital",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://mediareachdigital.com",
    siteName: "MediaReach SMM Panel",
    title: "MediaReach | India's #1 SMM Panel - Cheapest Social Media Services",
    description:
      "India's cheapest & fastest SMM panel. Buy Instagram followers, YouTube views, Telegram members at wholesale rates. Instant delivery, 24/7 support.",
    images: [
      {
        url: "/brand-logo.jpg",
        width: 512,
        height: 512,
        alt: "MediaReach SMM Panel - India's #1 Social Media Marketing Panel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MediaReach | India's #1 SMM Panel",
    description:
      "India's cheapest & fastest SMM panel. Buy Instagram followers, YouTube views, Telegram members at wholesale rates.",
    images: ["/brand-logo.jpg"],
    creator: "@mediareachsmm",
  },
  icons: {
    icon: "/brand-logo.jpg",
    apple: "/brand-logo.jpg",
  },
  alternates: {
    canonical: "https://mediareachdigital.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-indigo-500 selection:text-white min-h-screen">
        {children}
        <WhatsAppWidget />
      </body>
    </html>
  );
}
