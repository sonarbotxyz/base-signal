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
    icon: "/logo.jpg",
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
