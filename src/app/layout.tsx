import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0C0C0E",
};

export const metadata: Metadata = {
  title: "Base Signal — Intelligence feed for the Base ecosystem",
  description: "Discover projects building on Base. Watch the ones you care about. Get notified when milestones happen.",
  icons: { icon: "/logo.jpg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}
    >
      <body className="flex flex-col min-h-dvh">
        <Providers>
          <ThemeProvider>
            <Header />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
