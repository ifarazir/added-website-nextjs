"use client";

import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { uploadMedia } from "@/app/admin/_actions/media";
import { Button } from "@/components/ui/button";

/** Upload straight into the library from the media page. */
export function MediaUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function upload(files: FileList) {
    setBusy(true);
    let failures = 0;

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadMedia(formData);
      if (result.status === "error") {
        failures += 1;
        toast.error(`${file.name}: ${result.message}`);
      }
    }

    setBusy(false);
    if (failures < files.length) {
      toast.success(`Uploaded ${files.length - failures} image(s).`);
      router.refresh();
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          if (event.target.files?.length) void upload(event.target.files);
          event.target.value = "";
        }}
      />
      <Button disabled={busy} onClick={() => inputRef.current?.click()}>
        {busy ? <Loader2 className="animate-spin" /> : <Upload />}
        Upload images
      </Button>
    </>
  );
}
