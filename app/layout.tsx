import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EcoRoute | State Logistics & Waste Management",
  description: "Real-time, AI-optimized rural logistics platform for Chhattisgarh Extended Producer Responsibility (EPR).",
  manifest: "/manifest.json",
  openGraph: {
    title: "EcoRoute | State Logistics & Waste Management",
    description: "Real-time, AI-optimized rural logistics platform for Chhattisgarh Extended Producer Responsibility (EPR).",
    url: "https://ecoroute.cg.gov.in",
    siteName: "EcoRoute Pilot",
    images: [
      {
        url: "https://ecoroute.cg.gov.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "EcoRoute | State Logistics & Waste Management Chhattisgarh",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EcoRoute | State Logistics & Waste Management",
    description: "Real-time, AI-optimized rural logistics platform for Chhattisgarh Extended Producer Responsibility (EPR).",
    images: ["https://ecoroute.cg.gov.in/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-mono scroll-smooth", jetbrainsMono.variable)} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
