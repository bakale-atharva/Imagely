# Task 3 Brief: Studio Shell UI & Navigation Routes

## Objectives
1. Replace starter page in `app/page.tsx` with a high-design, vibe-coded Studio Shell.
2. Build reusable Navigation header (`components/Navigation.tsx`) with dynamic active states, logo, studio tabs (Gallery, Image Studio, Video Studio, Pricing, Account), theme styling, and Clerk `<UserButton />` / `<SignInButton />`.
3. Build route pages:
   - `app/gallery/page.tsx`: Paginated Gallery layout with filter tabs (All, Images, Videos), empty state, upload trigger button placeholder.
   - `app/editor/image/page.tsx`: Image Studio Shell page with canvas placeholder, tool panel placeholder, version timeline placeholder.
   - `app/editor/video/page.tsx`: Video Studio Shell page with preview placeholder, timeline placeholder, video tool controls placeholder.
   - `app/pricing/page.tsx`: Pricing page displaying plans (Free, Pro, Ultra) and Clerk `<PricingTable />` / upgrade UI.
   - `app/account/page.tsx`: User Account page displaying Clerk user details / subscription info.

## Design System Requirements
- Modern, dark-mode sleek glassmorphism aesthetic.
- Vibrant color accents (violet/indigo/pink gradient glows), dark slate/gray background slate-900/950.
- Clean typography and responsive design.

## Guidelines Compliance
- Ensure all interactive elements have unique, descriptive IDs.
- Protect components using Clerk `<SignedIn>` / `<SignedOut>` / `<Authenticated>` / `<Unauthenticated>` wrappers.
