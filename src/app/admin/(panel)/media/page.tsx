import Image from "next/image";

import { deleteMedia } from "@/app/admin/_actions/media";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { MediaUploader } from "@/components/admin/media-uploader";
import { Card, CardContent } from "@/components/ui/card";
import { listMedia } from "@/lib/admin-queries";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Media" };

export default async function MediaPage() {
  const assets = await listMedia();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Media</h1>
          <p className="text-sm text-muted-foreground">
            {assets.length} image{assets.length === 1 ? "" : "s"}. Uploads are auto-rotated, capped
            at 2400px and stored as WebP.
          </p>
        </div>
        <MediaUploader />
      </div>

      {assets.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nothing uploaded yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {assets.map((asset) => (
            <Card key={asset.id} className="gap-3 overflow-hidden py-0">
              <div className="relative aspect-square bg-muted">
                <Image
                  src={asset.url}
                  alt={asset.alt ?? asset.filename}
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-cover"
                />
              </div>
              <CardContent className="flex flex-col gap-1 px-3 pb-3">
                <p className="truncate text-xs font-medium">{asset.filename}</p>
                <p className="text-[11px] text-muted-foreground">
                  {asset.width}×{asset.height} · {Math.round((asset.bytes ?? 0) / 1024)} KB
                </p>
                <p className="text-[11px] text-muted-foreground">{formatDate(asset.createdAt)}</p>
                <div className="mt-1 flex justify-end">
                  <ConfirmButton
                    action={deleteMedia}
                    id={asset.id}
                    label="Remove"
                    title="Remove from the library?"
                    description="The file itself is kept — only the library entry is removed, so anything already using it keeps working."
                    confirmLabel="Remove"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
