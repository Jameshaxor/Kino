import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";
import FilmGrain from "@/components/ui/FilmGrain";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

import { Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: "#060606",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "KINO — Premium Multi-Media Discovery",
  description: "Discover your next favorite film, TV show, or anime with AI-powered recommendations, curated collections, and a cinematic browsing experience.",
  keywords: ["movies", "TV shows", "anime", "series", "film", "recommendations", "AI", "TMDB"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KINO",
  },
  openGraph: {
    title: "KINO — Premium Multi-Media Discovery",
    description: "Discover your next favorite film, TV show, or anime with AI-powered recommendations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <FilmGrain />
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
