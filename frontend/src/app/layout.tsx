import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChatbotLayout } from "@/components/ChatbotLayout";
import GlobalNavbar from "@/components/GlobalNavbar";
import SiteFooter from "@/components/SiteFooter";
import { AppPreviewChrome } from "@/components/AppPreviewChrome";
import { BMP_THEME_BOOT_SCRIPT } from "@/lib/theme-storage";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BMP.tn – Construction Digitale",
  description: "La plateforme intelligente qui connecte, automatise et optimise la chaîne de valeur du secteur de la construction.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          // Évite le flash blanc: applique le thème avant le rendu.
          dangerouslySetInnerHTML={{
            __html: BMP_THEME_BOOT_SCRIPT,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground scrollbar-bmp`}
      >
        <AppPreviewChrome>
          <GlobalNavbar />
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          <SiteFooter />
          {/* Chatbot intégré - affiché sur toutes les pages */}
          <ChatbotLayout />
        </AppPreviewChrome>
      </body>
    </html>
  );
}
