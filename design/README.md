# Design reference

The source material this site was built from — a handoff bundle exported from
Claude Design. Nothing here is compiled or imported by the app; it is kept so
the next person can check an implementation decision against the original.

- `prototypes/` — the three HTML/CSS/JS prototypes (`Home`, `Collection`,
  `Product`) as the designer left them. They are static mock-ups: the layout,
  type scale, colours and GSAP timings are authoritative, the markup is not.
- `chats/` — the conversation between the client and the design assistant.
  This is where the intent lives, including the late direction changes:
  80%+ white, acid yellow under 10%, no Materials section, masonry grid,
  a light minimal footer, and the scattered header.
- `reference/` — the brand's own pages: the header closed and open, and the
  typography guidelines (Titillium Web for display, Manrope for everything
  else).

## Decisions worth knowing

- **The header floats.** No bar, no background — corner mark and PRODUCTS at
  the left, acid-yellow bars at the right, white over the hero and ink once the
  white sections scroll under it. Page content carries a right gutter and extra
  top padding so it never sits under the bars.
- **The reversed E in the wordmark is correct.** It is part of the brand mark.
- **The home page stops after the manifesto.** Selected objects, the index,
  collaborations, the lookbook and the newsletter sign-up were taken off it at
  the client's request, to keep the site short. The catalogue is reached through
  the PRODUCTS menu and `/collection`; collaborations is now an email enquiry.
  The admin panel still manages all of it, and the lookbook rows are kept.
- **`reference/` outranks `prototypes/` where they disagree.** The prototypes
  set the header's type an optical step apart from the brand's own page — a
  deeper acid bar, uneven corner blocks, and menu lines spaced as far apart
  inside a category as between two of them. The header follows the reference
  PNGs on all three.
- **Four hero photos came out of a PDF** at roughly 1000px and will look soft
  on large screens. Replacing them with the originals is a media upload, not a
  code change.
