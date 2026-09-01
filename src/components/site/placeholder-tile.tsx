import { cn } from "@/lib/utils";

/** Diagonal-stripe stand-in for an object with no photography yet. */
export function PlaceholderTile({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex size-full items-center justify-center bg-[repeating-linear-gradient(45deg,#f3f3f0_0_14px,#e9e9e4_14px_28px)] px-5 text-center",
        className,
      )}
    >
      <span className="font-mono text-[11px] text-ink-45">product shot — {label}</span>
    </div>
  );
}
