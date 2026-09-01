import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-start gap-4">
          <span className="flex w-9 flex-col gap-1">
            <span className="block h-6 bg-ink" />
            <span className="block h-6.5 bg-ink" />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Added Forms</h1>
            <p className="text-sm text-muted-foreground">Catalogue administration</p>
          </div>
        </div>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
