import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats, listProducts } from "@/lib/admin-queries";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [stats, products] = await Promise.all([getDashboardStats(), listProducts()]);
  const recent = [...products]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 6);

  const tiles = [
    { label: "Objects", value: stats.products, hint: `${stats.published} published`, href: "/admin/products" },
    { label: "Featured", value: stats.featured, hint: "on the homepage", href: "/admin/products" },
    { label: "Categories", value: stats.categories, hint: "in the index", href: "/admin/categories" },
    { label: "Subscribers", value: stats.subscribers, hint: "newsletter", href: "/admin/subscribers" },
    { label: "Media", value: stats.media, hint: "in the library", href: "/admin/media" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">The catalogue at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {tiles.map((tile) => (
          <Link key={tile.label} href={tile.href}>
            <Card className="h-full gap-2 py-5 transition-colors hover:border-primary/40">
              <CardHeader className="px-5">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {tile.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5">
                <div className="text-3xl font-semibold tabular-nums">{tile.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{tile.hint}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recently updated</CardTitle>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            All objects <ArrowUpRight className="size-3" />
          </Link>
        </CardHeader>
        <CardContent className="flex flex-col divide-y">
          {recent.length === 0 && (
            <p className="py-4 text-sm text-muted-foreground">Nothing yet.</p>
          )}
          {recent.map((product) => (
            <Link
              key={product.id}
              href={`/admin/products/${product.id}`}
              className="flex items-center justify-between gap-4 py-3 text-sm hover:text-primary"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="truncate font-medium">{product.name}</span>
                {!product.published && <Badge variant="secondary">Draft</Badge>}
                {product.featured && <Badge variant="outline">Featured</Badge>}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDate(product.updatedAt)}
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
