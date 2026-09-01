import { createProduct } from "@/app/admin/_actions/catalog";
import { ProductForm } from "@/components/admin/product-form";
import { listCategories } from "@/lib/admin-queries";

export const metadata = { title: "New object" };

export default async function NewProductPage() {
  const categories = await listCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">New object</h1>
      <ProductForm
        action={createProduct}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
