"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { saveCategory } from "@/app/admin/_actions/catalog";
import { Field, FormMessage, SubmitButton } from "@/components/admin/form-parts";
import { useFormAction } from "@/components/admin/use-form-action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";

export type CategoryValues = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
};

export function CategoryDialog({ category }: { category?: CategoryValues }) {
  const [open, setOpen] = useState(false);
  const { state, pending, formProps } = useFormAction(saveCategory);
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugLocked, setSlugLocked] = useState(Boolean(category));

  useEffect(() => {
    if (state.status === "ok") {
      toast.success(state.message);
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {category ? (
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        ) : (
          <Button>
            <Plus /> New category
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? `Edit ${category.name}` : "New category"}</DialogTitle>
          <DialogDescription>
            Categories drive the collection filters and the homepage index.
          </DialogDescription>
        </DialogHeader>

        <form {...formProps} className="flex flex-col gap-5">
          {category && <input type="hidden" name="id" value={category.id} />}

          <Field label="Name" htmlFor="category-name" error={state.errors?.name}>
            <Input
              id="category-name"
              name="name"
              required
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (!slugLocked) setSlug(slugify(event.target.value));
              }}
            />
          </Field>

          <Field label="Slug" htmlFor="category-slug" error={state.errors?.slug}>
            <Input
              id="category-slug"
              name="slug"
              required
              value={slug}
              onChange={(event) => {
                setSlugLocked(true);
                setSlug(event.target.value);
              }}
            />
          </Field>

          <Field label="Description" htmlFor="category-description" hint="Optional, shown on the filtered collection page.">
            <Textarea
              id="category-description"
              name="description"
              rows={3}
              defaultValue={category?.description ?? ""}
            />
          </Field>

          <Field label="Position" htmlFor="category-position" hint="Lower numbers come first.">
            <Input
              id="category-position"
              name="position"
              type="number"
              min={0}
              defaultValue={category?.position ?? 0}
            />
          </Field>

          <FormMessage state={state} />
          <SubmitButton pending={pending}>{category ? "Save" : "Create"}</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
