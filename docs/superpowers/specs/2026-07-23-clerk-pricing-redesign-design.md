# Design Specification: Clerk Pricing Component Redesign

**Date:** 2026-07-23  
**Status:** Approved  
**Topic:** Replace dual pricing UI with single Clerk Pricing Table styled to Imagely DESIGN.md

---

## 1. Context & Objectives

The current `app/pricing/page.tsx` renders two separate pricing UI sections:
1. A custom-built pricing cards grid with manual billing toggle and hardcoded plan metadata.
2. Below it, the native Clerk `<PricingTable />` component.

The goal of this redesign is to:
- Remove the custom-built pricing card grid completely.
- Keep ONLY the Clerk `<PricingTable />` component as the single pricing interface on `/pricing`.
- Style `<PricingTable />` and the surrounding page shell to match the visual design system established in `DESIGN.md` (near-black canvas `slate-950`, dark slate surface panels `slate-900`, low-contrast borders `slate-800`, and warm coral `#ff6b4a` primary accents).

---

## 2. Page Architecture & Layout

### `app/pricing/page.tsx` Structure

- **Canvas & Container**:
  - `bg-slate-950 min-h-[calc(100vh-64px)] p-6 md:p-12 max-w-6xl mx-auto flex-1 flex flex-col items-center justify-center space-y-10`
- **Header Section**:
  - Top Badge: `"Simple & Transparent Billing"` in warm coral (`text-[#ff6b4a]`, `bg-[#ff6b4a]/10`, `border-[#ff6b4a]/25`).
  - Page Heading: `<h1>` `"Supercharge Your Workflow with Imagely Tiers"` with warm coral accent highlight.
  - Subtitle: Clear explanation that plan selection, subscription upgrades, and billing management are handled securely via Clerk.
- **Clerk Pricing Table Wrapper**:
  - Container element: `<div id="clerk-pricing-table-container">` with `w-full bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-slate-800 shadow-2xl shadow-slate-950/50`.
  - Component: `<PricingTable />` configured with custom `appearance` styling.

---

## 3. Styling & Theme Tokens (`DESIGN.md`)

### Color Mapping

| Element | Design Token | Tailwind / Hex Value |
| :--- | :--- | :--- |
| Canvas Background | `slate-950` | `#020617` |
| Panel Background | `slate-900` | `#0f172a` / `rgba(15, 23, 42, 0.6)` |
| Card Border | `slate-800` | `#1e293b` |
| Primary Accent / CTAs | Warm Coral | `#ff6b4a` |
| Hover Primary CTA | Bright Coral | `#ff856b` |
| Primary Text | Slate 100 / White | `#f8fafc` |
| Muted Text | Slate 400 | `#94a3b8` |

### Clerk `appearance` Configuration

The `<PricingTable />` component will receive explicit `appearance` configuration:
```tsx
<PricingTable
  appearance={{
    variables: {
      colorPrimary: "#ff6b4a",
      colorBackground: "#0f172a",
      colorText: "#f8fafc",
      colorTextSecondary: "#94a3b8",
      colorBorder: "#1e293b",
      colorInputBackground: "#020617",
      colorInputText: "#f8fafc",
      borderRadius: "1rem",
      fontFamily: "var(--font-geist-sans), sans-serif",
    },
    elements: {
      card: "bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md",
      pricingTableCard: "bg-slate-900/80 border border-slate-800 rounded-2xl",
      button: "bg-[#ff6b4a] hover:bg-[#ff856b] text-slate-950 font-extrabold transition-all duration-200 cursor-pointer shadow-md shadow-[#ff6b4a]/20",
      badge: "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/40 font-bold",
    },
  }}
/>
```

---

## 4. Verification & Testing

1. **Visual Verification**: Navigate to `/pricing` to ensure:
   - Only the Clerk `<PricingTable />` is rendered.
   - No leftover custom plan card grid or manual monthly/yearly toggle state exists.
   - Visual styling matches dark slate chrome and warm coral accents.
2. **Build & Lint Verification**: Run `npm run build` or `npx eslint` to ensure clean TypeScript compilation with zero errors.
