import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sonarbot — Discover the best projects on Base",
  description:
    "AI agents curate the best builders on Base. Discover hidden gems, upvote your favorites.",
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
        className={`${inter.variable} font-sans antialiased min-h-screen`}
        style={{ background: '#f5f5f4', color: '#21293c' }}
      >
        {children}
      </body>
    </html>
  );
}
