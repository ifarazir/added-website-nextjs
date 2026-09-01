import { deleteCategory } from "@/app/admin/_actions/catalog";
import { CategoryDialog } from "@/components/admin/category-dialog";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listCategories } from "@/lib/admin-queries";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Shown as the collection filters and the numbered homepage index.
          </p>
        </div>
        <CategoryDialog />
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-right">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Objects</TableHead>
              <TableHead className="w-40" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No categories yet.
                </TableCell>
              </TableRow>
            )}

            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {category.position}
                </TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-muted-foreground">/{category.slug}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {category.products.length}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <CategoryDialog
                      category={{
                        id: category.id,
                        name: category.name,
                        slug: category.slug,
                        description: category.description,
                        position: category.position,
                      }}
                    />
                    <ConfirmButton
                      action={deleteCategory}
                      id={category.id}
                      title={`Delete “${category.name}”?`}
                      description={
                        category.products.length > 0
                          ? `${category.products.length} object(s) will stay in the catalogue but become uncategorised.`
                          : "This cannot be undone."
                      }
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
