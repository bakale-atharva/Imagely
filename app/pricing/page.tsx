"use client";

import { PricingTable, useAuth, SignUpButton } from "@clerk/nextjs";
import { useState } from "react";

export default function PricingPage() {
  const { isSignedIn, has } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const isPro = has?.({ plan: "pro" });
  const isUltra = has?.({ plan: "ultra" });
  const isFree = !isPro && !isUltra;

  const plans = [
    {
      id: "free",
      name: "Starter Free",
      priceMonthly: "$0",
      priceYearly: "$0",
      badge: isFree ? "Active Plan" : "Basic",
      badgeColor: isFree
        ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border-[#ff6b4a]/40 font-bold"
        : "bg-slate-800 text-slate-300 border-slate-700",
      description: "Essential tools for personal image editing & asset storing.",
      features: [
        "Up to 50 Image Asset Uploads",
        "Standard Image & Video Editing Canvas",
        "Original Version Lineage & History",
        "Community Support",
      ],
      current: isFree,
      cta: isFree ? "Current Free Plan" : "Downgrade to Free",
      ctaStyle: isFree
        ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-default"
        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
    },
    {
      id: "pro",
      name: "Creator Pro",
      priceMonthly: "$15",
      priceYearly: "$12",
      badge: isPro ? "Active Plan" : "Most Popular",
      badgeColor: "bg-[#ff6b4a] text-slate-950 font-bold border-[#ff6b4a] shadow-md shadow-[#ff6b4a]/20",
      description: "Unlocks AI background removal, advanced image filters & video editing.",
      features: [
        "Unlimited Private Asset Uploads",
        "AI Background Removal (`image_ai`)",
        "Advanced Overlays & Filters (`advanced_image`)",
        "Aspect Ratio & Video Transforms (`advanced_video`)",
        "Unlimited Version Lineage & Timeline",
      ],
      current: isPro,
      cta: isPro ? "Current Active Plan" : "Upgrade to Pro",
      ctaStyle: isPro
        ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/40 font-bold cursor-default"
        : "bg-[#ff6b4a] hover:bg-[#ff856b] text-slate-950 font-extrabold shadow-lg shadow-[#ff6b4a]/25",
      highlight: !isUltra,
    },
    {
      id: "ultra",
      name: "Studio Ultra",
      priceMonthly: "$30",
      priceYearly: "$24",
      badge: isUltra ? "Active Plan" : "Ultimate AI",
      badgeColor: isUltra
        ? "bg-[#ff6b4a] text-slate-950 font-bold border-[#ff6b4a]"
        : "bg-[#ff6b4a]/20 text-[#ff6b4a] border-[#ff6b4a]/40",
      description: "Full studio access including MP3 audio extraction & subtitle overlays.",
      features: [
        "Everything in Creator Pro",
        "MP3 Audio Extraction (`audio_extraction`)",
        "Custom Subtitle File Overlays (`subtitle_overlay`)",
        "High-Resolution Export Queue",
        "Priority 24/7 Support",
      ],
      current: isUltra,
      cta: isUltra ? "Current Active Plan" : "Get Studio Ultra",
      ctaStyle: isUltra
        ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/40 font-bold cursor-default"
        : "bg-slate-800 hover:bg-slate-700 text-[#ff6b4a] border border-[#ff6b4a]/50 shadow-md",
    },
  ];

  const scrollToPricingTable = () => {
    const el = document.getElementById("clerk-pricing-table-container");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main id="pricing-container" className="flex-1 min-h-[calc(100vh-64px)] bg-slate-950 p-6 md:p-12 max-w-7xl mx-auto w-full space-y-12">
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
          Choose the entitlement plan that fits your studio needs. Powered securely by Clerk Billing.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`text-xs font-medium ${billingCycle === "monthly" ? "text-slate-100" : "text-slate-400"}`}>
            Monthly Billing
          </span>
          <button
            id="pricing-billing-toggle"
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
            className="w-12 h-6 rounded-full bg-slate-900 border border-slate-800 p-1 flex items-center transition-colors cursor-pointer"
          >
            <div
              className={`w-4 h-4 rounded-full bg-[#ff6b4a] transition-transform ${
                billingCycle === "yearly" ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-xs font-medium flex items-center gap-1.5 ${billingCycle === "yearly" ? "text-slate-100" : "text-slate-400"}`}>
            Yearly Billing
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.id}
            id={`plan-card-${plan.id}`}
            className={`rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-300 backdrop-blur-xl ${
              plan.highlight
                ? "bg-slate-900/90 border-2 border-[#ff6b4a]/70 shadow-2xl shadow-[#ff6b4a]/10 scale-105"
                : "bg-slate-900/50 border border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="space-y-6">
              {/* Badge & Title */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-100">{plan.name}</h3>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border ${plan.badgeColor}`}>
                  {plan.badge}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-100">
                  {billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly}
                </span>
                <span className="text-sm text-slate-400">/ month</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{plan.description}</p>

              {/* Feature Checklist */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Feature Entitlements:</span>
                <ul className="space-y-2.5">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <svg className="w-4 h-4 text-[#ff6b4a] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="pt-8">
              {!isSignedIn ? (
                <SignUpButton mode="modal">
                  <button
                    id={`plan-select-${plan.id}`}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${plan.ctaStyle}`}
                  >
                    {plan.cta}
                  </button>
                </SignUpButton>
              ) : (
                <button
                  id={`plan-select-${plan.id}`}
                  onClick={plan.current ? undefined : scrollToPricingTable}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Clerk Native Pricing Table Integration */}
      <div id="clerk-pricing-table-container" className="pt-8 border-t border-slate-800 space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Native Clerk Subscription Checkout & Management
          </h2>
          <p className="text-xs text-slate-500">
            Select a plan below to upgrade, downgrade, or update payment credentials securely via Clerk.
          </p>
        </div>
        <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-800">
          <PricingTable />
        </div>
      </div>
    </main>
  );
}
