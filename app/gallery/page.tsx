"use client";

import { useState } from "react";
import Link from "next/link";

type MediaTypeFilter = "all" | "image" | "video";

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState<MediaTypeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initial asset families (demo items for rich visual preview & testability)
  const [assets] = useState([
    {
      id: "asset-demo-1",
      name: "Neon Studio Portrait",
      type: "image" as const,
      versionCount: 3,
      updatedAt: "2 hours ago",
      dimensions: "1920x1080",
    },
    {
      id: "asset-demo-2",
      name: "Cinematic Reel",
      type: "video" as const,
      versionCount: 2,
      updatedAt: "5 hours ago",
      dimensions: "4K 60fps",
    },
    {
      id: "asset-demo-3",
      name: "Brand Mark & Logo",
      type: "image" as const,
      versionCount: 1,
      updatedAt: "1 day ago",
      dimensions: "1280x720",
    },
    {
      id: "asset-demo-4",
      name: "Product Promo Video",
      type: "video" as const,
      versionCount: 4,
      updatedAt: "2 days ago",
      dimensions: "1080p 30fps",
    },
  ]);

  const filteredAssets = assets.filter((asset) => {
    if (activeTab !== "all" && asset.type !== activeTab) return false;
    if (searchQuery && !asset.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <main id="gallery-container" className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8 bg-slate-950 min-h-screen">
      {/* Gallery Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
            <span>Asset Gallery</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-normal">
              {filteredAssets.length} {filteredAssets.length === 1 ? "Item" : "Items"}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage, organize, and inspect your media asset families and version history.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLoading(!isLoading)}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            title="Toggle Skeleton Loading Demo"
          >
            {isLoading ? "Show Assets" : "Simulate Loading"}
          </button>
          <button
            id="gallery-upload-btn"
            onClick={() => setIsUploading(!isUploading)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold bg-[#ff6b4a] hover:bg-[#e55a39] text-white shadow-md shadow-[#ff6b4a]/20 transition-all active:scale-95 cursor-pointer text-xs sm:text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Upload New Asset
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 backdrop-blur-md">
        {/* Tab Buttons */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          <button
            id="gallery-tab-all"
            onClick={() => setActiveTab("all")}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-[#ff6b4a]/15 text-[#ff6b4a] border border-[#ff6b4a]/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
            }`}
          >
            All Assets
          </button>
          <button
            id="gallery-tab-images"
            onClick={() => setActiveTab("image")}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === "image"
                ? "bg-[#ff6b4a]/15 text-[#ff6b4a] border border-[#ff6b4a]/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
            }`}
          >
            Images Only
          </button>
          <button
            id="gallery-tab-videos"
            onClick={() => setActiveTab("video")}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === "video"
                ? "bg-[#ff6b4a]/15 text-[#ff6b4a] border border-[#ff6b4a]/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
            }`}
          >
            Videos Only
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <svg
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="gallery-search-input"
            type="text"
            placeholder="Search asset title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#ff6b4a] transition-colors"
          />
        </div>
      </div>

      {/* Upload Dropzone Overlay */}
      {isUploading && (
        <div
          id="gallery-upload-dropzone-placeholder"
          className="p-8 rounded-2xl border-2 border-dashed border-[#ff6b4a]/50 bg-[#ff6b4a]/5 text-center space-y-4 animate-fadeIn"
        >
          <div className="w-12 h-12 rounded-full bg-[#ff6b4a]/10 border border-[#ff6b4a]/30 flex items-center justify-center mx-auto text-[#ff6b4a]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Upload Media Asset</h3>
            <p className="text-xs text-slate-400 mt-1">Drag and drop images (PNG, JPG, WEBP) or videos (MP4, MOV) here</p>
          </div>
          <button
            id="gallery-upload-cancel-btn"
            onClick={() => setIsUploading(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800/80 animate-pulse flex flex-col justify-between p-4">
              <div className="w-full h-36 bg-slate-800/50 rounded-xl" />
              <div className="space-y-2 pt-3">
                <div className="w-3/4 h-4 bg-slate-800/60 rounded" />
                <div className="w-1/2 h-3 bg-slate-800/40 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dark Masonry-like Asset Grid */}
      {!isLoading && filteredAssets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="group relative rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-[#ff6b4a]/50 transition-all duration-300 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:shadow-[#ff6b4a]/5"
            >
              {/* Thumbnail Container */}
              <div className="relative w-full h-44 bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800/60">
                {/* Media-type Icon Badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-800 backdrop-blur-md text-[10px] text-slate-300">
                  {asset.type === "image" ? (
                    <svg className="w-3 h-3 text-[#ff6b4a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  <span className="capitalize font-medium">{asset.type}</span>
                </div>

                {/* Version Badge */}
                <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-[#ff6b4a]/15 text-[#ff6b4a] border border-[#ff6b4a]/30 font-mono text-[10px] font-bold">
                  V{asset.versionCount}
                </div>

                {/* ImageKit Responsive Thumbnail Mock / Illustration */}
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 group-hover:scale-105 transition-transform duration-500">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-500 group-hover:border-[#ff6b4a]/40 group-hover:text-[#ff6b4a] transition-colors">
                      {asset.type === "image" ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{asset.dimensions}</span>
                  </div>
                </div>

                {/* Subtle Hover Action Overlay */}
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 z-20">
                  <Link
                    href={asset.type === "image" ? "/editor/image" : "/editor/video"}
                    id={`gallery-card-open-${asset.id}`}
                    className="px-4 py-2 rounded-xl bg-[#ff6b4a] hover:bg-[#e55a39] text-white text-xs font-semibold shadow-lg shadow-[#ff6b4a]/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Open in Editor
                  </Link>
                </div>
              </div>

              {/* Card Meta Footer */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-[#ff6b4a] transition-colors">
                    {asset.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Updated {asset.updatedAt}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md">
                  V{asset.versionCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State Card */}
      {!isLoading && filteredAssets.length === 0 && (
        <div
          id="gallery-empty-state-card"
          className="flex flex-col items-center justify-center p-12 md:p-16 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 shadow-lg">
            <svg className="w-8 h-8 text-[#ff6b4a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <div className="max-w-md space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-100">No assets found in your gallery</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Your media vault is empty or no items match your search. Upload your first media asset or launch a studio below.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/editor/image"
              id="gallery-empty-launch-image-btn"
              className="px-5 py-2.5 rounded-xl font-semibold bg-[#ff6b4a] hover:bg-[#e55a39] text-white text-xs transition-all cursor-pointer shadow-md shadow-[#ff6b4a]/20"
            >
              Open Image Studio
            </Link>
            <Link
              href="/editor/video"
              id="gallery-empty-launch-video-btn"
              className="px-5 py-2.5 rounded-xl font-semibold bg-purple-600 hover:bg-purple-500 text-white text-xs transition-all cursor-pointer shadow-md shadow-purple-600/20"
            >
              Open Video Studio
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

