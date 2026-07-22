"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";

function NavigationContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isSignedIn, isLoaded } = useAuth();

  const isUploadParam = searchParams?.get("upload") === "true";
  const actionParam = searchParams?.get("action");
  const tabParam = searchParams?.get("tab");

  const navItems = [
    {
      key: "gallery",
      name: "Gallery",
      href: "/gallery",
      id: "nav-link-gallery",
      isActive: pathname === "/gallery" && !isUploadParam && tabParam !== "versions",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      key: "uploads",
      name: "Uploads",
      href: "/gallery?upload=true",
      id: "nav-link-uploads",
      isActive: pathname === "/gallery" && isUploadParam,
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
    },
    {
      key: "image-editor",
      name: "Image editor",
      href: "/editor/image",
      id: "nav-link-image-editor",
      isActive: pathname === "/editor/image" && actionParam !== "export",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: "video-editor",
      name: "Video editor",
      href: "/editor/video",
      id: "nav-link-video-editor",
      isActive: pathname === "/editor/video",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: "versions",
      name: "Versions",
      href: "/gallery",
      id: "nav-link-versions",
      isActive: pathname === "/versions" || tabParam === "versions",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: "export",
      name: "Export",
      href: "/editor/image?action=export",
      id: "nav-link-export",
      isActive: actionParam === "export",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
    },
    {
      key: "pricing",
      name: "Pricing",
      href: "/pricing",
      id: "nav-link-pricing",
      isActive: pathname === "/pricing",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      key: "account",
      name: "Account",
      href: "/account",
      id: "nav-link-account",
      isActive: pathname === "/account",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <header
      id="main-navigation"
      className="sticky top-0 z-50 w-full h-16 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link
            href="/"
            id="nav-logo"
            className="flex items-center gap-2.5 group transition-transform active:scale-95 shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shadow-sm group-hover:border-[#ff6b4a]/50 transition-colors">
              <div className="relative flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#ff6b4a] transition-transform duration-300 group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2z" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-wider text-slate-100 flex items-center gap-1">
                IMAGELY
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b4a]" />
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                id={item.id}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold transition-all relative border-b-2 ${
                  item.isActive
                    ? "text-[#ff6b4a] border-[#ff6b4a]"
                    : "text-slate-400 hover:text-slate-200 border-transparent"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Section: Plan Badge & Auth */}
        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            id="nav-plan-badge"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#ff6b4a]/10 hover:bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30 transition-all"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b4a] animate-pulse" />
            <span>Pro Plan</span>
          </Link>

          {isLoaded && isSignedIn ? (
            <div id="nav-user-button" className="flex items-center">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 ring-2 ring-[#ff6b4a]/40 hover:ring-[#ff6b4a] transition-all",
                  },
                }}
              />
            </div>
          ) : isLoaded && !isSignedIn ? (
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button
                  id="nav-signin-btn"
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  id="nav-signup-btn"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-[#ff6b4a] hover:bg-[#e55a39] text-white rounded-lg shadow-sm shadow-[#ff6b4a]/20 transition-all cursor-pointer"
                >
                  Get Started
                </button>
              </SignUpButton>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
          )}
        </div>
      </div>
    </header>
  );
}

export default function Navigation() {
  return (
    <Suspense
      fallback={
        <header
          id="main-navigation"
          className="sticky top-0 z-50 w-full h-16 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-[#ff6b4a]" />
              </div>
              <span className="font-bold text-base tracking-wider text-slate-100">IMAGELY</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
          </div>
        </header>
      }
    >
      <NavigationContent />
    </Suspense>
  );
}
