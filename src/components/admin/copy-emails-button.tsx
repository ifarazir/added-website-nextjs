"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CopyEmailsButton({ emails }: { emails: string[] }) {
  return (
    <Button
      variant="outline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(emails.join(", "));
          toast.success(`Copied ${emails.length} address(es).`);
        } catch {
          toast.error("Your browser blocked clipboard access.");
        }
      }}
    >
      <Copy /> Copy all
    </Button>
  );
}
