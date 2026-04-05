import type { Metadata } from "next";
import { Space_Grotesk, Cinzel, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";
import FilmGrain from "@/components/ui/FilmGrain";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KINO — Premium Movie Discovery",
  description: "Discover your next favorite film with AI-powered recommendations, curated collections, and a cinematic browsing experience.",
  keywords: ["movies", "film", "recommendations", "AI", "cinema", "TMDB"],
  openGraph: {
    title: "KINO — Premium Movie Discovery",
    description: "Discover your next favorite film with AI-powered recommendations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${cinzel.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen flex flex-col">
        <FilmGrain />
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
