"use client";

import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { fetchMedia, uploadMedia } from "@/app/admin/_actions/media";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MediaAsset } from "@/db/schema";
import { cn } from "@/lib/utils";

export type PickedImage = {
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
};

/**
 * Picks an image from the media library, or uploads a new one. Uploading goes
 * straight through a server action, which normalises and stores the file and
 * hands back the row — so the picker never needs its own API route.
 */
export function MediaPicker({
  value,
  onChange,
  onClear,
  label = "Choose image",
  className,
}: {
  value?: PickedImage | null;
  onChange: (image: PickedImage) => void;
  onClear?: () => void;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex items-start gap-4", className)}>
      <div className="relative size-24 shrink-0 overflow-hidden rounded-md border bg-muted">
        {value?.url ? (
          <Image src={value.url} alt={value.alt ?? ""} fill sizes="96px" className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-5" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          {label}
        </Button>
        {value?.url && onClear && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={onClear}
          >
            Remove
          </Button>
        )}
        {value?.url && (
          <p className="max-w-56 truncate text-xs text-muted-foreground">{value.url}</p>
        )}
      </div>

      <MediaDialog
        open={open}
        onOpenChange={setOpen}
        onPick={(image) => {
          onChange(image);
          setOpen(false);
        }}
      />
    </div>
  );
}

function MediaDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (image: PickedImage) => void;
}) {
  const [assets, setAssets] = useState<MediaAsset[] | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    startTransition(async () => {
      try {
        setAssets(await fetchMedia());
      } catch {
        toast.error("Could not load the media library.");
        setAssets([]);
      }
    });
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  async function handleUpload(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadMedia(formData);
    setUploading(false);

    if (result.status === "error") {
      toast.error(result.message);
      return;
    }
    toast.success("Uploaded.");
    setAssets((current) => [result.asset, ...(current ?? [])]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Media library</DialogTitle>
          <DialogDescription>
            Images are resized to 2400px and converted to WebP on upload.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleUpload(file);
              event.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
            Upload image
          </Button>
        </div>

        {pending && assets === null ? (
          <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading library…
          </div>
        ) : assets && assets.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() =>
                  onPick({
                    url: asset.url,
                    alt: asset.alt,
                    width: asset.width,
                    height: asset.height,
                  })
                }
                className="group relative aspect-square overflow-hidden rounded-md border transition-colors hover:border-primary"
              >
                <Image
                  src={asset.url}
                  alt={asset.alt ?? asset.filename}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
                <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1.5 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {asset.filename}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 text-sm text-muted-foreground">
            <X className="size-5" />
            Nothing in the library yet — upload an image to start.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
