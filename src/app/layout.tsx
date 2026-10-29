import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediaReach | India's #1 Automated Digital Growth Engine",
  description: "India's Cheapest & Fastest automated SMM services for Instagram, YouTube, Telegram, and Facebook. Wholesale pricing & instant delivery.",
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
      </body>
    </html>
  );
}
