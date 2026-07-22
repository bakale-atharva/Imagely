"use client";

import { useState } from "react";
import Link from "next/link";

export default function ImageEditorPage() {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedVersion, setSelectedVersion] = useState("v3");
  const [activeToolTab, setActiveToolTab] = useState<"adjust" | "transform" | "background" | "ai">("adjust");

  // Adjustments & transform state
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(true);

  const versions = [
    { id: "v3", label: "V3", title: "AI Enhanced", time: "10 mins ago", isCurrent: true },
    { id: "v2", label: "V2", title: "Brightness Adjusted", time: "1 hour ago", isCurrent: false },
    { id: "v1", label: "V1", title: "Original Upload", time: "2 hours ago", isCurrent: false },
  ];

  const getToolTitle = () => {
    switch (activeToolTab) {
      case "adjust":
        return "Adjustments";
      case "transform":
        return "Transform & Crop";
      case "background":
        return "Background";
      case "ai":
        return "AI Magic Tools";
      default:
        return "Image Inspector";
    }
  };

  return (
    <div id="image-editor-shell" className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      {/* 64px Top Workspace Navigation Bar */}
      <div className="h-14 border-b border-slate-800/80 bg-slate-900/80 px-6 flex items-center justify-between backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/gallery"
            id="image-back-to-gallery-btn"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
            title="Back to Gallery"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xs font-bold text-slate-100 flex items-center gap-2 tracking-wide">
              <span>Cyberpunk Neon Portrait.png</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#ff6b4a]/10 text-[#ff6b4a] border border-[#ff6b4a]/20">
                1920 × 1080
              </span>
            </h1>
            <span className="text-[11px] text-slate-400 font-mono">Asset Family: #img-84920</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="image-upload-new-version-btn"
            onClick={() => setHasUnsavedEdits(true)}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700/60 cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 text-[#ff6b4a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            + New Version
          </button>
          <button
            id="image-export-btn"
            className="px-4 py-1.5 rounded-lg bg-[#ff6b4a] hover:bg-[#e05637] text-white text-xs font-bold shadow-lg shadow-[#ff6b4a]/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Asset
          </button>
        </div>
      </div>

      {/* Workspace Body: Left Inspector + Center Preview Stage */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* LEFT INSPECTOR (320-360px Fixed Width) */}
        <aside
          id="image-editor-left-pane"
          className="w-[340px] border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex flex-col shrink-0 overflow-y-auto"
        >
          {/* Active Tool Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff6b4a]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {getToolTitle()}
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
              Inspector
            </span>
          </div>

          {/* Tool Tab Bar */}
          <div className="p-3 border-b border-slate-800/60">
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                id="image-tool-tab-adjust"
                onClick={() => setActiveToolTab("adjust")}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeToolTab === "adjust"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Adjust
              </button>
              <button
                id="image-tool-tab-ai"
                onClick={() => setActiveToolTab("ai")}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeToolTab === "ai"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                AI Magic
              </button>
              <button
                id="image-tool-tab-crop"
                onClick={() => setActiveToolTab("transform")}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeToolTab === "transform"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Transform
              </button>
            </div>
          </div>

          {/* Tool Controls Panel */}
          <div id="image-editor-right-pane" className="p-4 space-y-4 border-b border-slate-800/80">
            {activeToolTab === "adjust" && (
              <div className="space-y-4">
                {/* Compact Sliders & Steppers */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs items-center">
                    <label htmlFor="image-slider-brightness" className="font-medium text-slate-300 text-xs">Brightness</label>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setBrightness(b => Math.max(50, b - 5))}
                        className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs text-slate-200 w-10 text-center">{brightness}%</span>
                      <button
                        onClick={() => setBrightness(b => Math.min(150, b + 5))}
                        className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    id="image-slider-brightness"
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
                  />
                </div>

                <div className="h-px bg-slate-800/80" />

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs items-center">
                    <label htmlFor="image-slider-contrast" className="font-medium text-slate-300 text-xs">Contrast</label>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setContrast(c => Math.max(50, c - 5))}
                        className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs text-slate-200 w-10 text-center">{contrast}%</span>
                      <button
                        onClick={() => setContrast(c => Math.min(150, c + 5))}
                        className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    id="image-slider-contrast"
                    type="range"
                    min="50"
                    max="150"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
                  />
                </div>

                <div className="h-px bg-slate-800/80" />

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs items-center">
                    <label htmlFor="image-slider-saturation" className="font-medium text-slate-300 text-xs">Saturation</label>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSaturation(s => Math.max(0, s - 5))}
                        className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs text-slate-200 w-10 text-center">{saturation}%</span>
                      <button
                        onClick={() => setSaturation(s => Math.min(200, s + 5))}
                        className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    id="image-slider-saturation"
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
                  />
                </div>
              </div>
            )}

            {activeToolTab === "transform" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">Dimensions & Scale</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Width</span>
                      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 h-9">
                        <input
                          type="number"
                          value={width}
                          onChange={(e) => setWidth(Number(e.target.value))}
                          className="w-full bg-transparent text-xs font-mono text-slate-200 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500 font-mono">px</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Height</span>
                      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 h-9">
                        <input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(Number(e.target.value))}
                          className="w-full bg-transparent text-xs font-mono text-slate-200 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500 font-mono">px</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-800/80" />

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">Aspect Ratio Presets</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button id="image-aspect-1-1" onClick={() => { setWidth(1080); setHeight(1080); }} className="p-2 bg-slate-950 border border-slate-800 hover:border-[#ff6b4a]/60 rounded-lg text-xs font-mono text-slate-300 cursor-pointer">1 : 1 Square</button>
                    <button id="image-aspect-16-9" onClick={() => { setWidth(1920); setHeight(1080); }} className="p-2 bg-slate-950 border border-slate-800 hover:border-[#ff6b4a]/60 rounded-lg text-xs font-mono text-slate-300 cursor-pointer">16 : 9 Widescreen</button>
                    <button id="image-aspect-4-5" onClick={() => { setWidth(1080); setHeight(1350); }} className="p-2 bg-slate-950 border border-slate-800 hover:border-[#ff6b4a]/60 rounded-lg text-xs font-mono text-slate-300 cursor-pointer">4 : 5 Social</button>
                    <button id="image-aspect-free" className="p-2 bg-slate-950 border border-slate-800 hover:border-[#ff6b4a]/60 rounded-lg text-xs font-mono text-slate-300 cursor-pointer">Freeform</button>
                  </div>
                </div>
              </div>
            )}

            {activeToolTab === "ai" && (
              <div className="space-y-3">
                <button
                  id="image-ai-upscale-btn"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-[#ff6b4a]/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-[#ff6b4a] font-bold text-xs">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>4x AI Super Resolution</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Enhance clarity and detail automatically</p>
                </button>

                <button
                  id="image-ai-remove-bg-btn"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.6 15.12a2 2 0 00-1.169.176l-.42.21a2 2 0 00-.785 2.502l.608 1.216A2 2 0 005.626 20.4h12.748a2 2 0 001.792-1.176l.608-1.216a2 2 0 00-.746-2.58z" />
                    </svg>
                    <span>Background Eraser</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Isolate subject in 1-click</p>
                </button>
              </div>
            )}
          </div>

          {/* Version History Chronological Strip & Single Primary CTA */}
          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Version History
                </h3>
                <span className="text-[11px] font-mono text-slate-500">{versions.length} Immutable Versions</span>
              </div>

              <div className="space-y-2">
                {/* Draft edit segment if present */}
                {hasUnsavedEdits && (
                  <div className="p-3 rounded-xl border-2 border-dashed border-[#ff6b4a]/50 bg-[#ff6b4a]/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#ff6b4a]/20 border border-[#ff6b4a]/40 flex items-center justify-center text-[#ff6b4a] font-mono text-xs font-bold">
                        *
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#ff6b4a] block">New version (Draft)</span>
                        <span className="text-[10px] text-slate-400 block">Unsaved inspector edits</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#ff6b4a] bg-[#ff6b4a]/10 px-2 py-0.5 rounded border border-[#ff6b4a]/20">Draft</span>
                  </div>
                )}

                {/* Immutable version cards */}
                {versions.map((ver) => {
                  const isSelected = selectedVersion === ver.id;
                  return (
                    <button
                      key={ver.id}
                      id={`image-version-${ver.id}`}
                      onClick={() => setSelectedVersion(ver.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-[#ff6b4a]/10 border-2 border-[#ff6b4a] text-slate-100 shadow-md shadow-[#ff6b4a]/10"
                          : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                          isSelected ? "bg-[#ff6b4a] text-white" : "bg-slate-800 text-slate-300"
                        }`}>
                          {ver.label}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-200">{ver.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono block">{ver.time}</span>
                        </div>
                      </div>

                      {ver.isCurrent && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30">
                          Current
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Single Coral Primary Action Button */}
            <button
              onClick={() => {
                setHasUnsavedEdits(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#ff6b4a] hover:bg-[#e05637] text-white font-bold text-xs shadow-lg shadow-[#ff6b4a]/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create version
            </button>
          </div>
        </aside>

        {/* CENTRAL PREVIEW STAGE */}
        <main
          id="image-editor-center-pane"
          className="flex-1 bg-[#090d16] flex flex-col items-center justify-center relative p-8 overflow-hidden group"
        >
          {/* Subtle Grid Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

          {/* Filename & Version Label Header on Canvas */}
          <div
            id="canvas-filename-label"
            className="absolute top-6 left-6 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md text-xs font-medium text-slate-300 flex items-center gap-2.5 shadow-xl z-10"
          >
            <span className="font-semibold text-slate-100">Cyberpunk Neon Portrait.png</span>
            <span className="text-[10px] font-mono font-bold text-[#ff6b4a] bg-[#ff6b4a]/10 px-2 py-0.5 rounded border border-[#ff6b4a]/20">
              {selectedVersion.toUpperCase()} {versions.find(v => v.id === selectedVersion)?.isCurrent ? "(Current)" : ""}
            </span>
          </div>

          {/* Centred Image Surface Canvas */}
          <div
            id="image-canvas-surface"
            style={{ transform: `scale(${zoomLevel / 100})`, filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` }}
            className="relative transition-transform duration-200 ease-out max-w-full max-h-[60vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 flex items-center justify-center p-3"
          >
            <div className="w-[620px] h-[350px] bg-gradient-to-tr from-slate-900 via-[#090d16] to-slate-900 rounded-xl flex flex-col items-center justify-center p-6 text-center space-y-4 border border-[#ff6b4a]/20 relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-[#ff6b4a]/15 border border-[#ff6b4a]/30 flex items-center justify-center text-[#ff6b4a] shadow-lg shadow-[#ff6b4a]/10">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Live Image Media Stage</h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">Rendered Size: {width} × {height} px | Zoom: {zoomLevel}%</p>
              </div>
            </div>
          </div>

          {/* Canvas Floating Zoom & View Controls */}
          <div
            id="image-canvas-controls"
            className="absolute bottom-6 right-6 flex items-center gap-2 bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-xl z-10"
          >
            <button
              id="canvas-zoom-out"
              onClick={() => setZoomLevel((z) => Math.max(25, z - 25))}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
              </svg>
            </button>
            <span className="text-xs font-mono font-bold text-slate-200 w-12 text-center">
              {zoomLevel}%
            </span>
            <button
              id="canvas-zoom-in"
              onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Zoom In"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <div className="w-px h-4 bg-slate-800 mx-1" />
            <button
              id="canvas-reset"
              onClick={() => {
                setZoomLevel(100);
                setBrightness(100);
                setContrast(100);
                setSaturation(100);
              }}
              className="px-2.5 py-1 text-xs font-semibold text-[#ff6b4a] hover:bg-[#ff6b4a]/10 rounded-lg transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </main>
      </div>

      {/* BOTTOM TIMELINE TRACK (220-280px High, Horizontally Scrollable) */}
      <div className="h-[240px] border-t border-slate-800/90 bg-slate-900/70 backdrop-blur-md p-4 shrink-0 flex flex-col justify-between overflow-x-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#ff6b4a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Version Timeline Track
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Parent-Child Lineage Track
          </span>
        </div>

        {/* Timeline Node Chain */}
        <div className="flex-1 flex items-center gap-4 px-6 overflow-x-auto py-2">
          {/* Node V1 */}
          <button
            id="image-timeline-node-v1"
            onClick={() => setSelectedVersion("v1")}
            className={`flex flex-col items-center p-3 rounded-2xl border transition-all cursor-pointer shrink-0 w-44 ${
              selectedVersion === "v1"
                ? "bg-[#ff6b4a]/10 border-2 border-[#ff6b4a] shadow-lg shadow-[#ff6b4a]/10"
                : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="w-full flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-slate-300">V1</span>
              <span className="text-[10px] text-slate-500 font-mono">2h ago</span>
            </div>
            <div className="w-full h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-medium text-slate-400">
              Original Upload
            </div>
          </button>

          {/* Relationship Connector Line */}
          <div className="w-12 h-0.5 bg-gradient-to-r from-slate-700 to-[#ff6b4a]/40 shrink-0" />

          {/* Node V2 */}
          <button
            id="image-timeline-node-v2"
            onClick={() => setSelectedVersion("v2")}
            className={`flex flex-col items-center p-3 rounded-2xl border transition-all cursor-pointer shrink-0 w-44 ${
              selectedVersion === "v2"
                ? "bg-[#ff6b4a]/10 border-2 border-[#ff6b4a] shadow-lg shadow-[#ff6b4a]/10"
                : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="w-full flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-slate-300">V2</span>
              <span className="text-[10px] text-slate-500 font-mono">1h ago</span>
            </div>
            <div className="w-full h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-medium text-slate-400">
              Brightness Adjusted
            </div>
          </button>

          {/* Relationship Connector Line */}
          <div className="w-12 h-0.5 bg-gradient-to-r from-[#ff6b4a]/40 to-[#ff6b4a] shrink-0" />

          {/* Node V3 */}
          <button
            id="image-timeline-node-v3"
            onClick={() => setSelectedVersion("v3")}
            className={`flex flex-col items-center p-3 rounded-2xl border transition-all cursor-pointer shrink-0 w-44 ${
              selectedVersion === "v3"
                ? "bg-[#ff6b4a]/10 border-2 border-[#ff6b4a] shadow-lg shadow-[#ff6b4a]/10"
                : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="w-full flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-[#ff6b4a] text-[10px] font-mono font-bold text-white">V3</span>
                <span className="text-[9px] font-bold text-[#ff6b4a] bg-[#ff6b4a]/20 px-1 rounded border border-[#ff6b4a]/30">Current</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">10m ago</span>
            </div>
            <div className="w-full h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-medium text-slate-300">
              AI Enhanced
            </div>
          </button>

          {/* Relationship Connector Line for Draft */}
          {hasUnsavedEdits && (
            <>
              <div className="w-12 h-0.5 border-t-2 border-dashed border-[#ff6b4a]/60 shrink-0" />

              {/* Node Draft */}
              <div className="flex flex-col items-center p-3 rounded-2xl border-2 border-dashed border-[#ff6b4a]/60 bg-[#ff6b4a]/5 shrink-0 w-44">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-[#ff6b4a]/20 text-[10px] font-mono font-bold text-[#ff6b4a]">Draft</span>
                  <span className="text-[10px] text-[#ff6b4a] font-mono">Unsaved</span>
                </div>
                <div className="w-full h-16 rounded-xl bg-slate-950 border border-[#ff6b4a]/30 flex flex-col items-center justify-center p-2 text-center">
                  <span className="text-[11px] font-bold text-[#ff6b4a]">New Version</span>
                  <span className="text-[9px] text-slate-400">Click &quot;Create version&quot;</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

