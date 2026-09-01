import { cn } from "@/lib/utils";

/**
 * The ADDED wordmark, traced from the brand SVG in the handoff bundle.
 * `fill-current` keeps it in step with whatever the header colour is.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 51.26 9.96"
      role="img"
      aria-label="Added Forms"
      className={cn("block fill-current", className)}
    >
      <path d="M4,0h2.78s4,9.96,4,9.96h-2.68s-.64-1.76-.64-1.76H3.3s-.64,1.76-.64,1.76H0S4,0,4,0ZM6.72,6.18l-1.32-3.67-1.35,3.67h2.68Z" />
      <path d="M12.58,0h3.42c3.69,0,5.12,2.23,5.12,4.98,0,2.75-1.44,4.98-5.12,4.98h-3.42s0-9.96,0-9.96ZM15.87,7.81c1.82,0,2.69-1.24,2.69-2.83,0-1.59-.87-2.83-2.69-2.83h-.81v5.66h.81Z" />
      <path d="M23.34,0h3.42c3.69,0,5.12,2.23,5.12,4.98s-1.44,4.98-5.12,4.98h-3.42s0-9.96,0-9.96ZM26.62,7.81c1.82,0,2.69-1.24,2.69-2.83,0-1.59-.87-2.83-2.69-2.83h-.81v5.66h.81Z" />
      <path d="M40.5,0h-6.4v2.15h3.93s0,1.68,0,1.68h-3.37s.39,2.15.39,2.15h2.98s0,1.84,0,1.84h-3.93v2.15h6.4V0Z" />
      <path d="M42.72,0h3.42c3.69,0,5.12,2.23,5.12,4.98,0,2.75-1.44,4.98-5.12,4.98h-3.42s0-9.96,0-9.96ZM46,7.81c1.82,0,2.69-1.24,2.69-2.83,0-1.59-.87-2.83-2.69-2.83h-.81v5.66h.81Z" />
    </svg>
  );
}

/** The two stacked blocks used as the corner mark in the header. */
export function LogoBlocks({ className }: { className?: string }) {
  return (
    <span className={cn("flex w-[13vw] flex-col gap-1.5 md:w-[4.4vw]", className)}>
      <span className="block h-[5vh] bg-current md:h-[7vh]" />
      <span className="block h-[5.4vh] bg-current md:h-[7.6vh]" />
    </span>
  );
}
