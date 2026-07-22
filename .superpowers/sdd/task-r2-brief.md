# Task R2 Brief: Rebrand Landing & Gallery Pages

## Objectives
Rebrand `app/page.tsx` and `app/gallery/page.tsx` strictly following `DESIGN.md`.

## Specifications from `DESIGN.md`

### 1. Landing Hero Page (`app/page.tsx`)
- Dark, compact, tool-first, and cinematic design.
- Warm coral/orange accent (`text-orange-500`, `bg-orange-500`, `border-orange-500`) for primary buttons and focus states.
- Dark slate panels (`bg-slate-900/80`, `border-slate-800`), near-black canvas (`bg-slate-950`).
- Feature cards showcasing Image Studio, Video Studio, and Version Browser with compact tool-first preview mocks.

### 2. Gallery Page (`app/gallery/page.tsx`)
- Dark masonry-like responsive grid with asset-family cards (not a white dashboard).
- Compact, left-aligned filter toolbar above grid:
  - All, Images, Videos filter tabs (`id="gallery-tab-all"`, `id="gallery-tab-images"`, `id="gallery-tab-videos"`).
  - Search input (`id="gallery-search-input"`).
  - Compact Upload button (`id="gallery-upload-btn"`) with warm coral primary styling.
- Asset Family Cards:
  - Responsive thumbnail preview using ImageKit URL structure.
  - Media-type icon (Image / Video).
  - Asset Title.
  - Version badge (`V1`, `V2`, `V3`) in coral/slate badge.
  - Subtle hover overlay action "Open in Editor" (`id="gallery-card-open-..."`).
- Skeleton tiles for loading states and dark empty state card with CTA.
