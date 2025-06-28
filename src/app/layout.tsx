import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { NotificationProvider } from "@/components/NotificationProvider";
import { AuthProvider } from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WatchWhat - Recommandations de séries personnalisées",
  description: "Découvrez de nouvelles séries TV basées sur vos goûts et votre historique de visionnage",
  keywords: "séries, TV, recommandations, TMDB, streaming",
  authors: [{ name: "WatchWhat Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bodyClassName = [
    geistSans.variable,
    geistMono.variable,
    "antialiased",
    "bg-gray-50",
    "dark:bg-gray-900",
    "min-h-screen"
  ].join(" ");

  return (
    <html lang="fr" className="dark">
      <body className={bodyClassName}>
        <AuthProvider>
          <NotificationProvider>
            <Navbar />
            <main className="pt-16">
              {children}
            </main>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
