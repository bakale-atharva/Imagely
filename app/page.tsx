"use client";

import Link from "next/link";
import { useAuth, SignUpButton } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Ambient Dark Studio Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#ff6b4a]/10 via-amber-500/5 to-transparent blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-slate-800/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10 w-full">
        {/* Unauthenticated Landing Hero */}
        {isLoaded && !isSignedIn && (
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff6b4a]/10 border border-[#ff6b4a]/20 text-[#ff6b4a] text-xs font-medium tracking-wide uppercase shadow-inner">
              <span className="w-2 h-2 rounded-full bg-[#ff6b4a] animate-pulse" />
              Cinematic AI Media Studio
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 leading-[1.1]">
              Transform Your Vision with{" "}
              <span className="bg-gradient-to-r from-[#ff6b4a] via-orange-400 to-amber-500 bg-clip-text text-transparent">
                Studio Precision
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-2xl font-normal leading-relaxed">
              Full-featured creative suite for image and video production. Real-time canvas editing, multi-track timeline, non-destructive version lineage, and instant ImageKit delivery.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <SignUpButton mode="modal">
                <button
                  id="hero-get-started-btn"
                  className="px-7 py-3.5 rounded-xl font-semibold bg-[#ff6b4a] hover:bg-[#e55a39] text-white shadow-lg shadow-[#ff6b4a]/20 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer text-sm"
                >
                  Start Creating Free
                </button>
              </SignUpButton>

              <Link
                href="/gallery"
                id="hero-explore-gallery-btn"
                className="px-7 py-3.5 rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all transform hover:scale-[1.02] active:scale-95 text-sm"
              >
                Explore Demo Gallery
              </Link>
            </div>

            {/* Studio Feature Showcase Cards with Tool-First Mocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-12 text-left">
              {/* Image Studio Card */}
              <Link
                href="/editor/image"
                id="hero-image-editor-card"
                className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-[#ff6b4a]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#ff6b4a]/5 flex flex-col justify-between"
              >
                <div>
                  {/* Tool Mock Preview */}
                  <div className="w-full h-36 rounded-xl bg-slate-950 border border-slate-800/80 mb-5 p-3 flex flex-col justify-between overflow-hidden relative group-hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#ff6b4a]" />
                        <span className="text-[10px] font-mono text-slate-400">Canvas 1280x720</span>
                      </div>
                      <span className="text-[10px] bg-[#ff6b4a]/20 text-[#ff6b4a] px-1.5 py-0.5 rounded font-mono">V3 Current</span>
                    </div>
                    {/* Mock Canvas Area */}
                    <div className="my-auto flex items-center justify-center relative">
                      <div className="w-28 h-16 rounded bg-slate-900 border border-[#ff6b4a]/40 flex items-center justify-center text-slate-500 text-[10px] shadow-sm">
                        <svg className="w-6 h-6 text-[#ff6b4a]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    {/* Mock Controls */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/40">
                      <span>Crop • Filter • AI Mask</span>
                      <span className="text-slate-400">100%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#ff6b4a]/10 border border-[#ff6b4a]/20 flex items-center justify-center text-[#ff6b4a]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-100">Image Studio</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    3-pane workspace with live canvas preview, inspector controls, smart transformations, and instant version snapshot exports.
                  </p>
                </div>

                <div className="mt-4 flex items-center text-xs font-semibold text-[#ff6b4a] group-hover:translate-x-1 transition-transform">
                  Launch Editor &rarr;
                </div>
              </Link>

              {/* Video Studio Card */}
              <Link
                href="/editor/video"
                id="hero-video-editor-card"
                className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-[#ff6b4a]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#ff6b4a]/5 flex flex-col justify-between"
              >
                <div>
                  {/* Tool Mock Preview */}
                  <div className="w-full h-36 rounded-xl bg-slate-950 border border-slate-800/80 mb-5 p-3 flex flex-col justify-between overflow-hidden relative group-hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-[10px] font-mono text-slate-400">00:04:12 / 00:15:00</span>
                      </div>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">1080p 60fps</span>
                    </div>
                    {/* Mock Video Timeline Track */}
                    <div className="space-y-1.5 my-auto">
                      <div className="h-3 bg-purple-900/40 border border-purple-500/30 rounded flex items-center px-2 relative overflow-hidden">
                        <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-[#ff6b4a]" />
                        <span className="text-[8px] text-purple-300 font-mono">Video_Track_01.mp4</span>
                      </div>
                      <div className="h-2.5 bg-indigo-900/40 border border-indigo-500/30 rounded flex items-center px-2">
                        <span className="text-[8px] text-indigo-300 font-mono">Audio_Background.mp3</span>
                      </div>
                    </div>
                    {/* Mock Playback Control */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/40">
                      <span>▶ Play • Trim • Render</span>
                      <span className="text-slate-400">H.264</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-100">Video Studio</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Multi-track video timeline, real-time player stage, audio layer synchronization, and cloud video rendering pipeline.
                  </p>
                </div>

                <div className="mt-4 flex items-center text-xs font-semibold text-[#ff6b4a] group-hover:translate-x-1 transition-transform">
                  Launch Video Studio &rarr;
                </div>
              </Link>

              {/* Version Browser / Vault Card */}
              <Link
                href="/gallery"
                id="hero-gallery-card"
                className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-[#ff6b4a]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#ff6b4a]/5 flex flex-col justify-between"
              >
                <div>
                  {/* Tool Mock Preview */}
                  <div className="w-full h-36 rounded-xl bg-slate-950 border border-slate-800/80 mb-5 p-3 flex flex-col justify-between overflow-hidden relative group-hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="text-[10px] font-mono text-slate-400">Version Lineage</span>
                      </div>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">3 Versions</span>
                    </div>
                    {/* Mock Version Strip */}
                    <div className="flex items-center justify-around my-auto px-1">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-[9px] text-slate-500 font-mono">V1</div>
                        <span className="text-[8px] text-slate-500">Original</span>
                      </div>
                      <div className="w-4 h-0.5 bg-slate-800" />
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-[9px] text-slate-400 font-mono">V2</div>
                        <span className="text-[8px] text-slate-500">Filtered</span>
                      </div>
                      <div className="w-4 h-0.5 bg-[#ff6b4a]" />
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded bg-[#ff6b4a]/10 border border-[#ff6b4a] flex items-center justify-center text-[9px] text-[#ff6b4a] font-mono font-bold">V3</div>
                        <span className="text-[8px] text-[#ff6b4a] font-medium">Active</span>
                      </div>
                    </div>
                    {/* Mock Footer */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/40">
                      <span>Non-destructive history</span>
                      <span className="text-slate-400">Cloud Sync</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-100">Asset Vault & Lineage</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Organize asset families in a dark grid, track every edit snapshot, compare versions side-by-side, and restore anytime.
                  </p>
                </div>

                <div className="mt-4 flex items-center text-xs font-semibold text-[#ff6b4a] group-hover:translate-x-1 transition-transform">
                  View Asset Vault &rarr;
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Authenticated Dashboard Overview & Quick Redirect */}
        {isLoaded && isSignedIn && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b4a]/5 blur-[60px] rounded-full pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase">
                    Studio Active
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">
                  Welcome to your{" "}
                  <span className="bg-gradient-to-r from-[#ff6b4a] via-orange-400 to-amber-500 bg-clip-text text-transparent">
                    Imagely Studio Workspace
                  </span>
                </h2>

                <p className="text-sm text-slate-400 leading-relaxed">
                  Your creative suite is ready. Select an asset family from your gallery or launch one of our dedicated editing studios below.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <Link
                    href="/gallery"
                    id="authenticated-go-gallery-btn"
                    className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-[#ff6b4a]/50 text-slate-200 transition-all transform hover:scale-[1.02] text-center group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#ff6b4a]/10 border border-[#ff6b4a]/20 flex items-center justify-center text-[#ff6b4a] mb-3 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <span className="font-bold text-sm text-slate-100">Asset Vault</span>
                    <span className="text-xs text-slate-400 mt-1">Manage & Upload</span>
                  </Link>

                  <Link
                    href="/editor/image"
                    id="authenticated-go-image-editor-btn"
                    className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-[#ff6b4a]/50 text-slate-200 transition-all transform hover:scale-[1.02] text-center group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#ff6b4a]/10 border border-[#ff6b4a]/20 flex items-center justify-center text-[#ff6b4a] mb-3 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-bold text-sm text-slate-100">Image Studio</span>
                    <span className="text-xs text-slate-400 mt-1">Canvas & Masks</span>
                  </Link>

                  <Link
                    href="/editor/video"
                    id="authenticated-go-video-editor-btn"
                    className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-slate-200 transition-all transform hover:scale-[1.02] text-center group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-bold text-sm text-slate-100">Video Studio</span>
                    <span className="text-xs text-slate-400 mt-1">Timeline & Layers</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

