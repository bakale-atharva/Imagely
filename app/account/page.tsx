"use client";

import { useUser, useAuth, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function AccountPage() {
  const { isLoaded: isAuthLoaded, isSignedIn, has } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();

  if (!isAuthLoaded || !isUserLoaded) {
    return (
      <main className="flex-1 min-h-[calc(100vh-64px)] bg-slate-950 flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-[#ff6b4a] border-t-transparent animate-spin" />
          <span>Loading user profile & feature entitlements...</span>
        </div>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main id="account-container" className="flex-1 min-h-[calc(100vh-64px)] bg-slate-950 p-6 md:p-12 max-w-5xl mx-auto w-full space-y-8">
        <div
          id="account-signed-out-card"
          className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md text-center space-y-6 max-w-lg mx-auto"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#ff6b4a]/10 border border-[#ff6b4a]/20 flex items-center justify-center text-[#ff6b4a] mx-auto">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Sign In to Access Account Settings</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Please authenticate to view your profile details, active subscriptions, and feature entitlement status.
            </p>
          </div>
          <SignInButton mode="modal">
            <button
              id="account-signin-prompt-btn"
              className="px-6 py-2.5 rounded-xl font-bold bg-[#ff6b4a] hover:bg-[#ff856b] text-slate-950 text-xs shadow-lg shadow-[#ff6b4a]/25 transition-all cursor-pointer"
            >
              Sign In Now
            </button>
          </SignInButton>
        </div>
      </main>
    );
  }

  // Determine current active plan
  const isPro = has?.({ plan: "pro" });
  const isUltra = has?.({ plan: "ultra" });
  const currentPlan = isUltra ? "Ultra" : isPro ? "Pro" : "Free";

  // Feature entitlement list
  const featureList = [
    {
      slug: "basic_editor",
      title: "Basic Image & Video Editor",
      desc: "Standard resizing, cropping, quality, format conversion & trimming",
      enabled: has?.({ feature: "basic_editor" }) ?? true,
      tier: "Free+",
    },
    {
      slug: "image_ai",
      title: "AI Image Manipulation",
      desc: "AI background removal and transparent PNG generation",
      enabled: has?.({ feature: "image_ai" }) ?? false,
      tier: "Pro+",
    },
    {
      slug: "advanced_image",
      title: "Advanced Image Filters & Overlays",
      desc: "Text overlays, image watermarks, color tints, and Gaussian blur",
      enabled: has?.({ feature: "advanced_image" }) ?? false,
      tier: "Pro+",
    },
    {
      slug: "advanced_video",
      title: "Advanced Video Tools",
      desc: "Aspect ratio conversions, rotation transforms, & watermark overlays",
      enabled: has?.({ feature: "advanced_video" }) ?? false,
      tier: "Pro+",
    },
    {
      slug: "audio_extraction",
      title: "Audio Extraction",
      desc: "Extract high-quality MP3 audio tracks directly from video assets",
      enabled: has?.({ feature: "audio_extraction" }) ?? false,
      tier: "Ultra",
    },
    {
      slug: "subtitle_overlay",
      title: "Subtitle File Overlay",
      desc: "Burn custom subtitle tracks and captions into video output",
      enabled: has?.({ feature: "subtitle_overlay" }) ?? false,
      tier: "Ultra",
    },
  ];

  return (
    <main id="account-container" className="flex-1 min-h-[calc(100vh-64px)] bg-slate-950 p-6 md:p-12 max-w-5xl mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Account & Feature Entitlements</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your credentials, active subscription plan, and media studio feature gates.</p>
        </div>
        <Link
          href="/pricing"
          id="account-header-upgrade-btn"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#ff6b4a] hover:bg-[#ff856b] text-slate-950 transition-all shadow-md shadow-[#ff6b4a]/20 shrink-0 self-start md:self-auto cursor-pointer"
        >
          Manage / Upgrade Subscription
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Details Card */}
        <div
          id="account-profile-card"
          className="lg:col-span-1 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-6 flex flex-col justify-between"
        >
          <div className="space-y-4 text-center">
            {/* Avatar Preview */}
            <div className="relative inline-block">
              {user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt={user.fullName || "User Avatar"}
                  className="w-24 h-24 rounded-full mx-auto ring-4 ring-[#ff6b4a]/40 shadow-xl object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#ff6b4a]/20 border-2 border-[#ff6b4a]/50 flex items-center justify-center text-2xl font-bold text-[#ff6b4a] mx-auto">
                  {user?.firstName?.[0] || "U"}
                </div>
              )}
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#ff6b4a] border-2 border-slate-950" title="Online" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-100">
                {user?.fullName || user?.username || "Imagely User"}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {user?.primaryEmailAddress?.emailAddress || "user@example.com"}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ff6b4a]/10 border border-[#ff6b4a]/30 text-[#ff6b4a] text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#ff6b4a]" />
              {currentPlan} Subscription Tier
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>User ID:</span>
              <span className="font-mono text-slate-300 truncate max-w-[140px]">{user?.id || "usr_123"}</span>
            </div>
            <div className="flex justify-between">
              <span>Member Since:</span>
              <span className="text-slate-300">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Jul 2026"}
              </span>
            </div>
          </div>
        </div>

        {/* Feature Entitlements & Quick Actions Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Feature Entitlement Matrix */}
          <div id="account-entitlements-card" className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Active Feature Entitlements</h3>
                <p className="text-xs text-slate-400">Features unlocked by your current Clerk subscription plan.</p>
              </div>
              <span className="text-xs font-mono text-[#ff6b4a] font-bold">
                {featureList.filter((f) => f.enabled).length} / {featureList.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              {featureList.map((feature) => (
                <div
                  key={feature.slug}
                  id={`entitlement-item-${feature.slug}`}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                    feature.enabled
                      ? "bg-slate-900/80 border-slate-800"
                      : "bg-slate-950/60 border-slate-800/80 opacity-75"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                        feature.enabled
                          ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30"
                          : "bg-slate-800 text-slate-500 border border-slate-700"
                      }`}
                    >
                      {feature.enabled ? "✓" : "🔒"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">{feature.title}</span>
                        <span className="text-[10px] font-mono text-slate-500">(`{feature.slug}`)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">{feature.desc}</p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {feature.enabled ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Unlocked
                      </span>
                    ) : (
                      <Link
                        href="/pricing"
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff6b4a]/10 hover:bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30 transition-colors"
                      >
                        Upgrade ({feature.tier})
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/pricing"
              id="account-manage-sub-btn"
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-[#ff6b4a]/50 transition-all flex items-center gap-4 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#ff6b4a]/10 border border-[#ff6b4a]/20 flex items-center justify-center text-[#ff6b4a] group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-[#ff6b4a] transition-colors">
                  Manage Subscription
                </h4>
                <p className="text-xs text-slate-400">View plan tiers & billing history</p>
              </div>
            </Link>

            <button
              id="account-security-btn"
              onClick={() => alert("Security settings managed via Clerk Profile dialog.")}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-[#ff6b4a]/50 transition-all flex items-center gap-4 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-[#ff6b4a] group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-[#ff6b4a] transition-colors">
                  Security & Credentials
                </h4>
                <p className="text-xs text-slate-400">Password, 2FA, & sessions</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
