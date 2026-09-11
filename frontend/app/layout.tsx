import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./dashboard.css";
// Last, so the responsive layer overrides the two above at equal specificity
// without needing !important. See app/responsive/_tokens.css.
import "./responsive/index.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://finvoq.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Finvoq: India's Investment Marketplace",
    template: "%s · Finvoq"
  },
  description:
    "Finvoq offers listed shares, unlisted opportunities, mutual funds, PMS, AIF, bonds, and insurance in a single premium platform.",
  openGraph: {
    type: "website",
    title: "Finvoq: India's Investment Marketplace",
    description:
      "Listed and unlisted shares, mutual funds, PMS, AIF, bonds, and insurance. Curated by experts and executed in seconds.",
    siteName: "Finvoq",
    locale: "en_IN",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Finvoq" }]
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
    title: "Finvoq: India's Investment Marketplace",
    description:
      "Listed, unlisted, mutual funds, PMS, AIF, bonds, insurance, curated by experts, executed in seconds."
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=2", sizes: "any" },
      { url: "/favicon-48x48.png?v=2", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96x96.png?v=2", sizes: "96x96", type: "image/png" },
      { url: "/icon.png?v=2", sizes: "512x512", type: "image/png" }
    ],
    shortcut: "/favicon.ico?v=2",
    apple: [
      { url: "/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" }
    ]
  },
  manifest: "/site.webmanifest",
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  // Stated explicitly rather than relying on the framework default: this is
  // the switch that makes every media query in the app apply on a phone at
  // all. maximumScale/userScalable are deliberately NOT set — blocking pinch
  // zoom fails WCAG 1.4.4 and is the usual reason a mobile site is unusable
  // for anyone who needs to magnify it.
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // lets the safe-area-inset-* vars report real values
  themeColor: "#13735d",
  colorScheme: "light"
};

import { ThemeProvider } from "next-themes";
import SmoothScroll from "@/components/SmoothScroll";

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" href="/favicon-48x48.png?v=2" type="image/png" sizes="48x48" />
        <link rel="icon" href="/favicon-96x96.png?v=2" type="image/png" sizes="96x96" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
