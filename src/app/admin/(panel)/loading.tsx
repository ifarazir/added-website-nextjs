import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" /> Loading…
    </div>
  );
}
