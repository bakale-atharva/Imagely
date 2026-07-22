# Task R1 Brief: Design System & 64px Navigation Bar Rebrand

## Objectives
Align global CSS design tokens and `components/Navigation.tsx` with the visual design specification in `DESIGN.md`.

## Specifications from `DESIGN.md`
1. **Color Palette & Theme**:
   - Near-black canvas: `bg-slate-950` / `#090d16`.
   - Panels & Tool Surfaces: Muted dark slate `bg-slate-900` / `bg-slate-900/80` with low-contrast borders `border-slate-800/80`.
   - **Primary Brand Accent**: Warm Coral / Orange (`#ff6b4a` / `text-orange-500` / `bg-orange-500` / `border-orange-500` / `coral`). Remove all indigo/purple brand accents; reserve indigo/purple strictly for timeline video/audio tracks.
   - Typography: Geist sans with crisp white primary text (`text-slate-100`) and muted secondary labels (`text-slate-400`).

2. **Global Shell Navigation Bar (`components/Navigation.tsx`)**:
   - Fixed 64px height (`h-16`).
   - Muted dark background (`bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80`).
   - Navigation links:
     - Imagely Brand Mark (Logo with coral dot/spark icon).
     - Links: **Gallery** (`/gallery`), **Uploads** (`/gallery?upload=true`), **Image Editor** (`/editor/image`), **Video Editor** (`/editor/video`), **Versions** (`/gallery`), **Export** (`/editor/image?action=export`), **Pricing** (`/pricing`), **Account** (`/account`).
     - Active link styling: **Coral text & icon** (`text-orange-500`) with a **thin coral underline** (`border-b-2 border-orange-500 pb-1`). Inactive links: muted grey (`text-slate-400 hover:text-slate-200`).
     - Right section: Plan badge ("Pro Plan" / "Free"), Clerk `<SignedIn>` with `<UserButton />`, and `<SignedOut>` with `<SignInButton />` & `<SignUpButton />` styled with coral primary button.

3. **Interactive `id` Attributes**:
   - Ensure all nav links and buttons retain unique `id` attributes (`id="nav-logo"`, `id="nav-link-gallery"`, `id="nav-link-uploads"`, `id="nav-link-image-editor"`, `id="nav-link-video-editor"`, `id="nav-link-versions"`, `id="nav-link-export"`, `id="nav-link-pricing"`, `id="nav-link-account"`, `id="nav-user-button"`).
