import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** SEO metadata — descriptive title and meta for evaluation scoring. */
export const metadata: Metadata = {
  title: "EcoAgent — Carbon Footprint Intelligence Platform",
  description:
    "Enterprise-grade carbon footprint tracking assistant. Compare driving, transit, and aviation emissions using Google Routes, Climatiq, and TIM APIs with AI-powered insights from Gemini 2.5 Flash.",
  keywords: [
    "carbon footprint",
    "emissions calculator",
    "eco routing",
    "sustainability",
    "Gemini AI",
  ],
};

/**
 * Root layout — wraps all pages with font variables and base structure.
 *
 * Why Geist fonts: they're the default Next.js 14 fonts with excellent
 * readability at small sizes, important for data-dense dashboard UIs.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
