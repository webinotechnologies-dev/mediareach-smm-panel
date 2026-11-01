import type { Metadata } from "next";
import "./globals.css";
import WhatsAppWidget from "@/components/WhatsAppWidget";

export const metadata: Metadata = {
  metadataBase: new URL("https://mediareachdigital.com"),
  title: {
    default: "MediaReach Digital | India's #1 Automated Digital Reach & Social Growth Agency",
    template: "%s | MediaReach Digital",
  },
  description:
    "India's #1 Automated Digital Reach & Social Growth Agency. Scale your brand presence on Instagram, YouTube, Telegram, and Facebook with enterprise-grade automated delivery and wholesale pricing.",
  keywords: [
    "digital reach agency india",
    "social media growth agency",
    "instagram growth service india",
    "youtube reach expansion",
    "telegram channel marketing",
    "facebook engagement agency",
    "automated social growth platform",
    "media reach digital",
    "digital marketing wholesale agency",
    "mediareach digital",
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
    siteName: "MediaReach Digital Agency",
    title: "MediaReach Digital | India's #1 Automated Digital Reach & Social Growth Agency",
    description:
      "India's #1 Automated Digital Reach Agency. Scale your brand on Instagram, YouTube, Telegram, and Facebook with enterprise automation and wholesale rates.",
    images: [
      {
        url: "/brand-logo.jpg",
        width: 512,
        height: 512,
        alt: "MediaReach Digital - India's #1 Automated Digital Reach Agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MediaReach Digital | India's #1 Automated Growth Agency",
    description:
      "India's #1 Automated Digital Reach Agency. Scale your brand on Instagram, YouTube, Telegram, and Facebook.",
    images: ["/brand-logo.jpg"],
    creator: "@mediareachdigital",
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
