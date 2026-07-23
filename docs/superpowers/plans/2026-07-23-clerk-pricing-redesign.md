# Clerk Pricing Component Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the custom pricing card grid from `app/pricing/page.tsx` and present only Clerk's `<PricingTable />` component styled according to `DESIGN.md`.

**Architecture:** Refactor `app/pricing/page.tsx` to eliminate hardcoded pricing cards, billing cycle state, and duplicate UI. Configure the Clerk `<PricingTable />` component with custom `appearance` properties matching Imagely's near-black canvas (`slate-950`), dark slate surface panels (`slate-900`), and warm coral (`#ff6b4a`) primary accents.

**Tech Stack:** Next.js 15+ App Router, `@clerk/nextjs` (PricingTable), Tailwind CSS v4, TypeScript.

## Global Constraints

- **Canvas Background:** `slate-950` (`#020617`)
- **Card Surface:** `slate-900` (`#0f172a`)
- **Low-contrast Border:** `slate-800` (`#1e293b`)
- **Primary Accent:** Warm Coral `#ff6b4a`
- **Typography:** Geist Sans font stack (`var(--font-geist-sans)`)
- **Strict single component rule:** Only Clerk's `<PricingTable />` is rendered for plan selection and checkout management; no secondary custom cards or manual billing toggles.

---

### Task 1: Refactor `app/pricing/page.tsx` to render single styled Clerk `<PricingTable />`

**Files:**
- Modify: `app/pricing/page.tsx`

**Interfaces:**
- Consumes: `@clerk/nextjs` (`PricingTable`)
- Produces: `/pricing` page component rendering Clerk `<PricingTable />` with custom dark slate/coral appearance.

- [ ] **Step 1: Replace custom pricing page content with Clerk `<PricingTable />` styled with `appearance` prop**

```tsx
"use client";

import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <main
      id="pricing-container"
      className="flex-1 min-h-[calc(100vh-64px)] bg-slate-950 p-6 md:p-12 max-w-6xl mx-auto w-full flex flex-col items-center justify-center space-y-10"
    >
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ff6b4a]/10 border border-[#ff6b4a]/25 text-[#ff6b4a] text-xs font-semibold uppercase tracking-wider">
          Simple & Transparent Billing
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight">
          Supercharge Your Workflow with{" "}
          <span className="text-[#ff6b4a]">
            Imagely Tiers
          </span>
        </h1>
        <p className="text-slate-400 text-base md:text-lg leading-relaxed">
          Select an entitlement plan to unlock advanced AI image transformations, video editing tools, and priority rendering. Powered securely by Clerk.
        </p>
      </div>

      {/* Clerk Native Pricing Table Container */}
      <div
        id="clerk-pricing-table-container"
        className="w-full bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-slate-800 shadow-2xl shadow-slate-950/50"
      >
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
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify `app/pricing/page.tsx` content**

Ensure no leftover imports (`useAuth`, `SignUpButton`, `useState`), hardcoded `plans` array, or custom card JSX remain in `app/pricing/page.tsx`.

- [ ] **Step 3: Commit changes**

```bash
git add app/pricing/page.tsx
git commit -m "refactor(pricing): replace custom cards with single styled Clerk PricingTable component"
```

---

### Task 2: Build & Verification

**Files:**
- Verify: `app/pricing/page.tsx`

- [ ] **Step 1: Run Next.js build / typecheck**

Run: `npm run build`
Expected: Build succeeds with 0 errors.

- [ ] **Step 2: Commit verification artifact**

```bash
git status
```
