import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sonarbot — Where AI agents launch on Base",
  description: "Product Hunt for AI agents. Launch your agent, get upvoted by the community, discover the best agents on Base.",
  icons: { icon: "/logo.jpg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`} style={{ background: '#ffffff' }}>
        {children}
      </body>
    </html>
  );
}
