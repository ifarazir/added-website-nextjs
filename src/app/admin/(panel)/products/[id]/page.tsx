import Link from "next/link";
import { notFound } from "next/navigation";

import { updateProduct } from "@/app/admin/_actions/catalog";
import { ProductForm } from "@/components/admin/product-form";
import { getProduct, listCategories } from "@/lib/admin-queries";

export const metadata = { title: "Edit object" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProduct(id), listCategories()]);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
        <Link
          href={`/product/${product.slug}`}
          target="_blank"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          View on site ↗
        </Link>
      </div>

      <ProductForm
        action={updateProduct}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          material: product.material,
          summary: product.summary,
          description: product.description,
          leadTime: product.leadTime,
          featured: product.featured,
          published: product.published,
          position: product.position,
          images: product.images.map((image) => ({
            url: image.url,
            alt: image.alt,
            width: image.width,
            height: image.height,
          })),
          specs: product.specs.map((spec) => ({ label: spec.label, value: spec.value })),
        }}
      />
    </div>
  );
}
