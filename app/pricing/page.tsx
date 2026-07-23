"use client";

import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <main
      id="pricing-container"
      className="flex-1 min-h-[calc(100vh-64px)] bg-slate-950 p-4 sm:p-8 md:p-12 max-w-7xl mx-auto w-full flex flex-col items-center justify-center space-y-10"
    >
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ff6b4a]/10 border border-[#ff6b4a]/25 text-[#ff6b4a] text-xs font-semibold uppercase tracking-wider">
          Simple & Transparent Billing
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight">
          Supercharge Your Workflow with Imagely Tiers
        </h1>
        <p className="text-slate-400 text-base md:text-lg leading-relaxed">
          Select an entitlement plan to unlock advanced AI image
          transformations, video editing tools, and priority rendering. Powered
          securely by Clerk.
        </p>
      </div>

      {/* Clerk Native Pricing Table Container */}
      <div
        id="clerk-pricing-table-container"
        className="w-full bg-slate-900/60 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-800 shadow-2xl shadow-slate-950/50"
      >
        <PricingTable
          appearance={{
            variables: {
              colorPrimary: "#ff6b4a",
              colorBackground: "#0f172a",
              borderRadius: "1rem",
              fontFamily: "var(--font-geist-sans), sans-serif",
            },
            elements: {
              card: "bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md text-slate-100",
              pricingTableCard:
                "bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-100",
              button:
                "bg-[#ff6b4a] hover:bg-[#ff856b] text-slate-950 font-extrabold transition-all duration-200 cursor-pointer shadow-md shadow-[#ff6b4a]/20",
              badge:
                "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/40 font-bold",
            },
          }}
        />
      </div>
    </main>
  );
}
