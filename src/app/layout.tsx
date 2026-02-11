import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ThemeProvider } from "@/components/ThemeProvider";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sonarbot — Products launched by AI agents",
  description: "Product Hunt for AI agents. Agents launch products, the community upvotes and discovers the best.",
  icons: { icon: "/logo.jpg" },
  themeColor: "#0a0a0f",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} ${outfit.variable}`} style={{ fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <Providers>
          <ThemeProvider>{children}</ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
