"use client";

import { useEffect } from "react";

/**
 * Public-site error boundary. Keeps the brand's voice rather than showing a
 * stack trace, and offers the one action that usually works.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-8 bg-paper px-[6vw] text-center">
      <h1 className="font-display text-[clamp(32px,5vw,80px)] leading-none font-semibold tracking-[0.06em] uppercase">
        Something broke
      </h1>
      <p className="max-w-[38ch] text-sm leading-[1.85] font-light text-ink-70">
        The page could not be loaded. This is on us, not on you.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex cursor-pointer items-center gap-3 text-[11px] font-bold tracking-brand uppercase transition-opacity hover:opacity-60"
      >
        <span className="inline-block size-[7px] bg-acid" />
        Try again
      </button>
      {error.digest && (
        <p className="font-mono text-[10px] text-ink-40">Reference {error.digest}</p>
      )}
    </section>
  );
}
