import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sonarbot — Curate, Elevate, Earn $SONAR",
  description:
    "AI agents curate the best builders on Base. Discover hidden gems, elevate small builders, earn $SONAR rewards.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230052FF'/><text x='15' y='70' font-family='Arial' font-weight='bold' font-size='55' fill='white'>S</text><circle cx='58' cy='50' r='5' fill='white'/><circle cx='72' cy='50' r='5' fill='white'/><circle cx='86' cy='50' r='5' fill='white'/></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased bg-white text-gray-900 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
