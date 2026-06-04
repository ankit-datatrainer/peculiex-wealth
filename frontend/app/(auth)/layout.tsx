import IconSprite from "@/components/IconSprite";
import { AuthProvider } from "@/lib/auth-context";

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
