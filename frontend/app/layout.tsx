import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./dashboard.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://peculiex.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Peculiex — India's Investment Marketplace",
    template: "%s · Peculiex"
  },
  description:
    "Peculiex offers listed shares, unlisted opportunities, mutual funds, PMS, AIF, bonds, and insurance in a single premium platform.",
  openGraph: {
    type: "website",
    title: "Peculiex — India's Investment Marketplace",
    description:
      "Listed and unlisted shares, mutual funds, PMS, AIF, bonds, and insurance. Curated by experts and executed in seconds.",
    siteName: "Peculiex",
    locale: "en_IN"
  },
  twitter: {
    card: "summary_large_image",
    title: "Peculiex — India's Investment Marketplace",
    description:
      "Listed, unlisted, mutual funds, PMS, AIF, bonds, insurance — curated by experts, executed in seconds."
  },
  icons: {
    icon: {
      url:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpolygon points='50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5' fill='%2301696f'/%3E%3Ctext x='50' y='66' text-anchor='middle' font-size='52' font-family='Georgia,serif' font-weight='600' fill='white'%3EP%3C/text%3E%3C/svg%3E",
      type: "image/svg+xml"
    },
    apple:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%2301696f'/%3E%3Ctext x='50' y='66' text-anchor='middle' font-size='52' font-family='Georgia,serif' font-weight='600' fill='white'%3EP%3C/text%3E%3C/svg%3E"
  },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  themeColor: "#01696f",
  colorScheme: "light"
};

import { ThemeProvider } from "next-themes";

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
