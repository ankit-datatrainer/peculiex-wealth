import { AuthProvider } from "@/lib/auth-context";
import IconSprite from "@/components/IconSprite";
import AdminShell from "@/components/admin/AdminShell";
import AdminMobileNav from "@/components/admin/AdminMobileNav";

export const metadata = {
  title: "Admin · Finvoq"
};

export default function AdminLayoutRoot({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <IconSprite />
      {/* Phone/tablet only: top bar + drawer control for the sidebar.
          Renders nothing at >=1024px, so desktop is unchanged. */}
      <AdminMobileNav />
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
