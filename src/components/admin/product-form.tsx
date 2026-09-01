"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { ActionState } from "@/app/admin/_actions/types";
import { Field, FormMessage, SubmitButton } from "@/components/admin/form-parts";
import { useFormAction } from "@/components/admin/use-form-action";
import { MediaPicker, type PickedImage } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  categoryId: string | null;
  material: string | null;
  summary: string | null;
  description: string | null;
  leadTime: string | null;
  featured: boolean;
  published: boolean;
  position: number;
  images: PickedImage[];
  specs: { label: string; value: string }[];
};

const EMPTY: ProductFormValues = {
  name: "",
  slug: "",
  categoryId: null,
  material: "",
  summary: "",
  description: "",
  leadTime: "Made to order in small batches. Lead time 2–3 weeks.",
  featured: false,
  published: true,
  position: 0,
  images: [],
  specs: [],
};

const UNCATEGORISED = "__none__";

export function ProductForm({
  action,
  categories,
  product,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  categories: { id: string; name: string }[];
  product?: ProductFormValues;
}) {
  const initial = product ?? EMPTY;
  const router = useRouter();
  const { state, pending, formProps } = useFormAction(action);

  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  // Only a brand-new product tracks the name; renaming a live object would
  // otherwise silently break its URL.
  const [slugLocked, setSlugLocked] = useState(Boolean(product));
  const [images, setImages] = useState<PickedImage[]>(initial.images);
  const [specs, setSpecs] = useState(initial.specs);

  useEffect(() => {
    if (state.status === "ok") {
      toast.success(state.message);
      // A new object has no page of its own to stay on.
      if (!product) router.push("/admin/products");
    }
    if (state.status === "error" && !state.errors) toast.error(state.message);
  }, [state, product, router]);

  function moveImage(index: number, delta: number) {
    setImages((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <form {...formProps} className="flex flex-col gap-6">
      {product?.id && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="specs" value={JSON.stringify(specs)} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Object</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <Field label="Name" htmlFor="name" error={state.errors?.name}>
                <Input
                  id="name"
                  name="name"
                  required
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (!slugLocked) setSlug(slugify(event.target.value));
                  }}
                />
              </Field>

              <Field
                label="Slug"
                htmlFor="slug"
                hint={`The object will live at /product/${slug || "…"}`}
                error={state.errors?.slug}
              >
                <Input
                  id="slug"
                  name="slug"
                  required
                  value={slug}
                  onChange={(event) => {
                    setSlugLocked(true);
                    setSlug(event.target.value);
                  }}
                />
              </Field>

              <Field label="Material" htmlFor="material" hint="Shown under the name on cards.">
                <Input
                  id="material"
                  name="material"
                  defaultValue={initial.material ?? ""}
                  placeholder="Stainless steel"
                />
              </Field>

              <Field label="Summary" htmlFor="summary" hint="One line, used for search and previews.">
                <Input id="summary" name="summary" defaultValue={initial.summary ?? ""} />
              </Field>

              <Field label="Description" htmlFor="description">
                <Textarea
                  id="description"
                  name="description"
                  rows={5}
                  defaultValue={initial.description ?? ""}
                />
              </Field>

              <Field label="Lead time" htmlFor="leadTime">
                <Input id="leadTime" name="leadTime" defaultValue={initial.leadTime ?? ""} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {images.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No images yet — the object will show a striped placeholder tile.
                </p>
              )}

              {images.map((image, index) => (
                <div key={`${image.url}-${index}`} className="flex items-start gap-3 rounded-md border p-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded bg-muted">
                    <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Input
                      value={image.alt ?? ""}
                      placeholder="Alt text — describe the shot"
                      onChange={(event) =>
                        setImages((current) =>
                          current.map((item, i) =>
                            i === index ? { ...item, alt: event.target.value } : item,
                          ),
                        )
                      }
                    />
                    <p className="truncate text-xs text-muted-foreground">
                      {index === 0 ? "Card & hero shot · " : ""}
                      {image.url}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => moveImage(index, -1)}
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Move down"
                      disabled={index === images.length - 1}
                      onClick={() => moveImage(index, 1)}
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove image"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}

              <MediaPicker
                label="Add image"
                onChange={(image) => setImages((current) => [...current, image])}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {specs.map((spec, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    aria-label="Spec label"
                    placeholder="Material"
                    value={spec.label}
                    className="max-w-52"
                    onChange={(event) =>
                      setSpecs((current) =>
                        current.map((item, i) =>
                          i === index ? { ...item, label: event.target.value } : item,
                        ),
                      )
                    }
                  />
                  <Input
                    aria-label="Spec value"
                    placeholder="Brushed stainless steel"
                    value={spec.value}
                    onChange={(event) =>
                      setSpecs((current) =>
                        current.map((item, i) =>
                          i === index ? { ...item, value: event.target.value } : item,
                        ),
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove spec"
                    className="shrink-0 text-destructive hover:bg-destructive/10"
                    onClick={() => setSpecs((current) => current.filter((_, i) => i !== index))}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => setSpecs((current) => [...current, { label: "", value: "" }])}
              >
                <Plus /> Add specification
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="published">Published</Label>
                <Switch id="published" name="published" defaultChecked={initial.published} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="featured">Featured</Label>
                  <span className="text-xs text-muted-foreground">
                    Shows in Selected objects on the homepage.
                  </span>
                </div>
                <Switch id="featured" name="featured" defaultChecked={initial.featured} />
              </div>

              <Field label="Category" htmlFor="categoryId">
                <Select
                  name="categoryId"
                  defaultValue={initial.categoryId ?? UNCATEGORISED}
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNCATEGORISED}>Uncategorised</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Position" htmlFor="position" hint="Lower numbers come first.">
                <Input
                  id="position"
                  name="position"
                  type="number"
                  min={0}
                  defaultValue={initial.position}
                />
              </Field>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <FormMessage state={state} />
            <div className="flex gap-2">
              <SubmitButton pending={pending}>{product ? "Save changes" : "Create object"}</SubmitButton>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/products">Cancel</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
