import { AuthProvider } from "@/lib/auth-context";
import IconSprite from "@/components/IconSprite";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin · Peculiex"
};

export default function AdminLayoutRoot({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <IconSprite />
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
