import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google"; // Add Cinzel
import "./globals.css";
import { SRDInitializer } from "@/components/srd-initializer";
import { DiceBox } from "@/components/dice/DiceBox";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });

export const metadata: Metadata = {
  title: "DnD Character Generator",
  description: "Offline-first PWA for D&D 5e",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cinzel.variable} font-sans antialiased`}>
        <SRDInitializer />
        {children}
        <DiceBox />
        <Toaster />
      </body>
    </html>
  );
}
