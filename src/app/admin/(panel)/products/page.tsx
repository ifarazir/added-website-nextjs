import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { deleteProduct } from "@/app/admin/_actions/catalog";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listProducts } from "@/lib/admin-queries";

export const metadata = { title: "Products" };

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} object{products.length === 1 ? "" : "s"} in the catalogue.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus /> New object
          </Link>
        </Button>
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16" />
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10 text-right">Pos.</TableHead>
              <TableHead className="w-40" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No objects yet. Create the first one.
                </TableCell>
              </TableRow>
            )}

            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="relative size-10 overflow-hidden rounded bg-muted">
                    {product.images[0] && (
                      <Image
                        src={product.images[0].url}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <Link href={`/admin/products/${product.id}`} className="hover:text-primary">
                    {product.name}
                  </Link>
                  <span className="block text-xs font-normal text-muted-foreground">
                    /{product.slug}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {product.category?.name ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">{product.material ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    <Badge variant={product.published ? "success" : "secondary"}>
                      {product.published ? "Live" : "Draft"}
                    </Badge>
                    {product.featured && <Badge variant="outline">Featured</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {product.position}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/products/${product.id}`}>Edit</Link>
                    </Button>
                    <ConfirmButton
                      action={deleteProduct}
                      id={product.id}
                      title={`Delete “${product.name}”?`}
                      description="This removes the object, its images and its specifications. It cannot be undone."
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
