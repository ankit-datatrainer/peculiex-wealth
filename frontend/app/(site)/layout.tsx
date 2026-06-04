import ChromeShell from "@/components/ChromeShell";
import { AuthProvider } from "@/lib/auth-context";

export default function SiteLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ChromeShell>{children}</ChromeShell>
    </AuthProvider>
  );
}
