import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { NotificationProvider } from "@/components/NotificationProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal"],
});

export const metadata: Metadata = {
  title: "WatchWhat · Que regarder ce soir",
  description: "Films et séries en tendance, bandes-annonces et watchlist, filtrés selon vos goûts",
  keywords: "séries, TV, recommandations, TMDB, streaming",
  authors: [{ name: "WatchWhat Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0e" },
    { media: "(prefers-color-scheme: light)", color: "#f6f6f7" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`dark ${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var isDark = false;
                  
                  if (theme === 'light') {
                    isDark = false;
                  } else if (theme === 'system') {
                    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  } else {
                    // 'dark' ou pas de préférence : la salle est sombre par défaut
                    isDark = true;
                  }
                  
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-canvas text-ink min-h-screen" suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <PreferencesProvider>
              <AuthProvider>
                <NotificationProvider>
                  <Navbar />
                  <a
                    href="#contenu"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
                  >
                    Aller au contenu
                  </a>
                  <main id="contenu" className="pt-16">
                    {children}
                  </main>
                </NotificationProvider>
              </AuthProvider>
            </PreferencesProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
