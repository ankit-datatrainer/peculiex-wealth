import type { Metadata } from "next";
import IconSprite from "@/components/IconSprite";
import { AuthProvider } from "@/lib/auth-context";

/**
 * Auth screens are kept out of the index.
 *
 * Set here rather than on each page because login/signup/forgot-password are
 * client components and cannot export metadata themselves.
 *
 * noindex, not a robots.txt Disallow: these pages ARE linked from the nav, and
 * a URL that is merely disallowed can still be indexed as a bare link — Google
 * never fetches it, so it never sees a directive telling it not to. Letting it
 * crawl and read `noindex` is the only reliable way to keep them out.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true }
};

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <IconSprite />
      {children}
    </AuthProvider>
  );
}
