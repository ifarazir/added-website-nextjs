/**
 * The single acid band on the page. Duplicated once so the CSS translate can
 * loop seamlessly; the copy is hidden from screen readers.
 */
export function Marquee({ text }: { text: string }) {
  return (
    <div className="overflow-hidden bg-acid py-3">
      <div className="flex w-max animate-marquee text-[10px] font-bold tracking-wider-brand whitespace-nowrap uppercase motion-reduce:animate-none">
        <span className="pr-[3em]">{text}&nbsp;</span>
        <span aria-hidden className="pr-[3em]">
          {text}&nbsp;
        </span>
      </div>
    </div>
  );
}
