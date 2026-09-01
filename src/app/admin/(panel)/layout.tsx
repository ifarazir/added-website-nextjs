import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

import { AdminNav } from "./_components/admin-nav";
import { UserMenu } from "./_components/user-menu";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // The middleware has already verified the cookie; this loads the record and
  // catches the edge case of a session whose user has since been deleted.
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row">
        <AdminNav />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/95 px-5 backdrop-blur">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              View site ↗
            </Link>
            <UserMenu name={user.name} email={user.email} role={user.role} />
          </header>

          <main className="min-w-0 flex-1 p-5 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
