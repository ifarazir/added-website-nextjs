import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-8 bg-paper px-[6vw] text-center">
      <h1 className="font-display text-[clamp(40px,6vw,96px)] leading-none font-semibold tracking-[0.06em] uppercase">
        Not found
      </h1>
      <p className="max-w-[36ch] text-sm leading-[1.85] font-light text-ink-70">
        That object is not part of the collection — it may have been renamed or unpublished.
      </p>
      <Link
        href="/collection"
        className="inline-flex items-center gap-3 text-[11px] font-bold tracking-brand uppercase transition-opacity hover:opacity-60"
      >
        <span className="inline-block size-[7px] bg-acid" />
        Back to the collection
      </Link>
    </section>
  );
}
