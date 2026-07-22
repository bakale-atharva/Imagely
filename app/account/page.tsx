"use client";

import { useUser, useAuth, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function AccountPage() {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();

  if (!isAuthLoaded || !isUserLoaded) {
    return (
      <main className="flex-1 min-h-[calc(100vh-64px)] bg-slate-950 flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-[#ff6b4a] border-t-transparent animate-spin" />
          <span>Loading user profile...</span>
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
              Please authenticate to view your profile details, active subscriptions, and studio preferences.
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

  return (
    <main id="account-container" className="flex-1 min-h-[calc(100vh-64px)] bg-slate-950 p-6 md:p-12 max-w-5xl mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Account & Studio Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your credentials, subscription plan, and API access keys.</p>
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

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b4a]/10 border border-[#ff6b4a]/30 text-[#ff6b4a] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#ff6b4a]" />
              Active Creator Plan
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

        {/* Quick Settings & Entitlements Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Storage Usage Card */}
          <div
            id="account-storage-card"
            className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff6b4a]/10 border border-[#ff6b4a]/20 flex items-center justify-center text-[#ff6b4a]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Cloud Media Storage</h3>
                  <p className="text-xs text-slate-400">12.4 MB of 5.0 GB used</p>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-[#ff6b4a]">0.2%</span>
            </div>

            {/* Progress Bar with Coral Indicator */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#ff6b4a] to-[#ff856b] w-[0.2%]" />
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

            <button
              id="account-api-keys-btn"
              onClick={() => alert("API keys feature placeholder.")}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-[#ff6b4a]/50 transition-all flex items-center gap-4 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-[#ff6b4a] group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-[#ff6b4a] transition-colors">
                  API Secret Keys
                </h4>
                <p className="text-xs text-slate-400">Developer tokens & webhooks</p>
              </div>
            </button>

            <button
              id="account-preferences-btn"
              onClick={() => alert("Preferences saved.")}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-[#ff6b4a]/50 transition-all flex items-center gap-4 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-[#ff6b4a] group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-[#ff6b4a] transition-colors">
                  Studio Preferences
                </h4>
                <p className="text-xs text-slate-400">Default canvas & export settings</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

