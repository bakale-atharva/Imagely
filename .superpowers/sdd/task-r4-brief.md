# Task R4 Brief: Rebrand Pricing, Account Pages & Update Documentation

## Objectives
1. Rebrand `app/pricing/page.tsx` and `app/account/page.tsx` to match `DESIGN.md`.
2. Update `.agents/docs/WhatGeminiDid.md` with complete documentation of the visual design rebranding and implementation.
3. Run full verification suite (`npx tsc --noEmit` and validation script).

## Detailed Requirements

### 1. `app/pricing/page.tsx`
- Dark slate chrome (`bg-slate-950`, `bg-slate-900/80`, `border-slate-800`).
- Warm coral badges and primary CTA buttons (`bg-[#ff6b4a]`, `text-[#ff6b4a]`).
- Tier cards (Starter Free, Creator Pro, Studio Ultra), monthly/yearly toggle, Clerk `<PricingTable />` container.
- Preserve interactive IDs (`pricing-billing-toggle`, `clerk-pricing-table-container`, etc.).

### 2. `app/account/page.tsx`
- User profile card with Clerk avatar & user details.
- Storage usage progress meter with coral indicator.
- Settings grid with action buttons.
- Preserve interactive IDs (`account-profile-card`, `account-storage-card`, `account-manage-sub-btn`, etc.).

### 3. `.agents/docs/WhatGeminiDid.md`
- Document the visual design rebranding:
  - Design tokens (`#ff6b4a` warm coral accent, near-black slate canvas `#090d16`).
  - 64px global shell navigation bar.
  - Dark masonry asset gallery grid.
  - 3-region image and video studio composition with left tool inspector, central stage, and bottom version/multi-track timeline.
  - Verification results (TSC 0 errors, validation script pass).

## Guidelines Compliance
- Ensure markdown formatting uses clickable file links.
