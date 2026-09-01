"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { deleteLookbookItem, saveLookbookItem } from "@/app/admin/_actions/content";
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

export type LookbookValues = {
  id: string;
  url: string;
  alt: string | null;
  width: number;
  height: number;
  size: "small" | "medium" | "large";
  position: number;
  active: boolean;
};

export function LookbookCard({ item }: { item?: LookbookValues }) {
  const { state, onSubmit, pending } = useFormAction(saveLookbookItem);
  const [image, setImage] = useState<PickedImage | null>(
    item ? { url: item.url, alt: item.alt, width: item.width, height: item.height } : null,
  );

  useEffect(() => {
    if (state.status === "ok") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  const key = item?.id ?? "new";

  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          {item && <input type="hidden" name="id" value={item.id} />}
          <input type="hidden" name="url" value={image?.url ?? ""} />
          {/* Intrinsic size keeps the strip's natural aspect ratios. */}
          <input type="hidden" name="width" value={image?.width ?? item?.width ?? 1200} />
          <input type="hidden" name="height" value={image?.height ?? item?.height ?? 1500} />

          <MediaPicker
            value={image}
            onChange={setImage}
            onClear={() => setImage(null)}
            label={image ? "Replace image" : "Choose image"}
          />
          {state.errors?.url && <p className="text-xs text-destructive">{state.errors.url}</p>}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="Alt text" htmlFor={`lb-alt-${key}`} className="md:col-span-2">
              <Input id={`lb-alt-${key}`} name="alt" defaultValue={item?.alt ?? ""} />
            </Field>

            <Field label="Height" htmlFor={`lb-size-${key}`} hint="Staggers the strip.">
              <Select name="size" defaultValue={item?.size ?? "medium"}>
                <SelectTrigger id={`lb-size-${key}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Position" htmlFor={`lb-position-${key}`}>
              <Input
                id={`lb-position-${key}`}
                name="position"
                type="number"
                min={0}
                defaultValue={item?.position ?? 0}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Switch id={`lb-active-${key}`} name="active" defaultChecked={item?.active ?? true} />
              <Label htmlFor={`lb-active-${key}`}>Active</Label>
            </div>

            <div className="flex items-center gap-2">
              {item && (
                <ConfirmButton
                  action={deleteLookbookItem}
                  id={item.id}
                  title="Remove this frame?"
                  description="It will no longer appear in the lookbook strip."
                  label="Remove"
                />
              )}
              <SubmitButton pending={pending}>{item ? "Save" : "Add frame"}</SubmitButton>
            </div>
          </div>

          <FormMessage state={state} />
        </form>
      </CardContent>
    </Card>
  );
}
