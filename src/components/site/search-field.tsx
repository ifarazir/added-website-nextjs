"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * The search box. Submitting navigates rather than fetching, so a result page
 * can be linked, shared and reloaded.
 */
export function SearchField({ initialValue = "" }: { initialValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Arriving from the header's SEARCH link should put the caret in the box.
  useEffect(() => {
    if (!initialValue) inputRef.current?.focus();
  }, [initialValue]);

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const term = value.trim();
        router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
      }}
      className="flex items-end gap-4"
    >
      <label htmlFor="search-term" className="sr-only">
        Search the catalogue
      </label>
      <input
        id="search-term"
        ref={inputRef}
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search objects"
        autoComplete="off"
        className="w-full min-w-0 flex-1 bg-transparent font-display text-[clamp(28px,4vw,64px)] leading-[1.1] font-light tracking-[0.05em] uppercase outline-none placeholder:text-ink/25 [&::-webkit-search-cancel-button]:appearance-none"
      />
      <button
        type="submit"
        className="mb-3 shrink-0 cursor-pointer text-[11px] font-bold tracking-brand uppercase transition-opacity hover:opacity-60"
      >
        Search
      </button>
    </form>
  );
}
