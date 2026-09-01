import { cn } from "@/lib/utils";

/** Acid square + wide-tracked label — the section marker used site-wide. */
export function Eyebrow({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-2.5", className)} {...props}>
      <span className="inline-block size-[7px] shrink-0 bg-acid" />
      <span className="text-[10px] font-bold tracking-wider-brand text-ink-45 uppercase">
        {children}
      </span>
    </div>
  );
}
