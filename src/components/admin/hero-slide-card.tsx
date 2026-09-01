"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { deleteHeroSlide, saveHeroSlide } from "@/app/admin/_actions/content";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Field, FormMessage, SubmitButton } from "@/components/admin/form-parts";
import { useFormAction } from "@/components/admin/use-form-action";
import { MediaPicker, type PickedImage } from "@/components/admin/media-picker";
import { Card, CardContent } from "@/components/ui/card";
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

export type HeroSlideValues = {
  id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  productId: string | null;
  position: number;
  active: boolean;
};

const NO_PRODUCT = "__none__";

export function HeroSlideCard({
  slide,
  products,
}: {
  slide?: HeroSlideValues;
  products: { id: string; name: string }[];
}) {
  const { state, onSubmit, pending } = useFormAction(saveHeroSlide);
  const [image, setImage] = useState<PickedImage | null>(
    slide ? { url: slide.url, alt: slide.alt, width: null, height: null } : null,
  );

  useEffect(() => {
    if (state.status === "ok") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          {slide && <input type="hidden" name="id" value={slide.id} />}
          <input type="hidden" name="url" value={image?.url ?? ""} />

          <MediaPicker
            value={image}
            onChange={setImage}
            onClear={() => setImage(null)}
            label={image ? "Replace image" : "Choose image"}
          />
          {state.errors?.url && <p className="text-xs text-destructive">{state.errors.url}</p>}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Caption" htmlFor={`caption-${slide?.id ?? "new"}`} hint="Overlaid bottom-left on the hero.">
              <Input
                id={`caption-${slide?.id ?? "new"}`}
                name="caption"
                defaultValue={slide?.caption ?? ""}
                placeholder="Donut — mirror-polished stainless steel"
              />
            </Field>

            <Field label="Alt text" htmlFor={`alt-${slide?.id ?? "new"}`}>
              <Input id={`alt-${slide?.id ?? "new"}`} name="alt" defaultValue={slide?.alt ?? ""} />
            </Field>

            <Field label="Links to" htmlFor={`product-${slide?.id ?? "new"}`}>
              <Select name="productId" defaultValue={slide?.productId ?? NO_PRODUCT}>
                <SelectTrigger id={`product-${slide?.id ?? "new"}`}>
                  <SelectValue placeholder="No link" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PRODUCT}>No link</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Position" htmlFor={`position-${slide?.id ?? "new"}`}>
              <Input
                id={`position-${slide?.id ?? "new"}`}
                name="position"
                type="number"
                min={0}
                defaultValue={slide?.position ?? 0}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Switch
                id={`active-${slide?.id ?? "new"}`}
                name="active"
                defaultChecked={slide?.active ?? true}
              />
              <Label htmlFor={`active-${slide?.id ?? "new"}`}>Active</Label>
            </div>

            <div className="flex items-center gap-2">
              {slide && (
                <ConfirmButton
                  action={deleteHeroSlide}
                  id={slide.id}
                  title="Remove this slide?"
                  description="It will no longer appear in the homepage hero."
                  label="Remove"
                />
              )}
              <SubmitButton pending={pending}>{slide ? "Save" : "Add slide"}</SubmitButton>
            </div>
          </div>

          <FormMessage state={state} />
        </form>
      </CardContent>
    </Card>
  );
}
