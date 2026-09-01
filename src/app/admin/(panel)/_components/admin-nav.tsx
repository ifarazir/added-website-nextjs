"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { NAV } from "./nav-config";

export function AdminNav({ role }: { role: "admin" | "editor" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  // Accounts is admin-only; the page itself redirects editors away too.
  const links = NAV.filter((item) => !("adminOnly" in item && item.adminOnly) || role === "admin").map((item) => {
    const active =
      "exact" in item && item.exact ? pathname === item.href : pathname.startsWith(item.href);
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
      >
        <Icon className="size-4 shrink-0" />
        {item.label}
      </Link>
    );
  });

  return (
    <>
      {/* Mobile bar */}
      <div className="flex items-center justify-between border-b bg-background px-5 py-3 lg:hidden">
        <span className="flex items-center gap-2.5 text-sm font-semibold">
          <span className="flex w-4 flex-col gap-0.5">
            <span className="block h-2.5 bg-ink" />
            <span className="block h-3 bg-ink" />
          </span>
          Added Forms
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle navigation"
          className="rounded-md p-1.5 hover:bg-accent"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-b bg-background p-3 lg:hidden">{links}</nav>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 border-r bg-background p-5 lg:flex">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="flex w-5 flex-col gap-0.5">
            <span className="block h-3 bg-ink" />
            <span className="block h-3.5 bg-ink" />
          </span>
          <span className="text-sm leading-tight font-semibold">
            Added Forms
            <span className="block text-xs font-normal text-muted-foreground">Catalogue</span>
          </span>
        </Link>
        <nav className="flex flex-col gap-1">{links}</nav>
      </aside>
    </>
  );
}
