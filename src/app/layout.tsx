import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/language-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "LearnIslam — Hindi-Urdu mein Quran Seekhein",
  description:
    "Quran, Hadith, Arabic aur Islamic ilm seekhein. Lafz-ba-Lafz matlab, Hindi-Urdu tarjuma, Quiz aur Pragati tracking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" className={cn(inter.variable)} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#059669" />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-background text-foreground">
        <LanguageProvider>
          <TooltipProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </TooltipProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
