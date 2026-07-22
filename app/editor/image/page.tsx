"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

function ImageEditorContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const familyId = idParam ? (idParam as Id<"assetFamilies">) : null;

  const family = useQuery(api.assetFamilies.getAssetFamily, familyId ? { familyId } : "skip");
  const _versions = useQuery(api.assetVersions.listAssetVersions, familyId ? { familyId } : "skip");

  const versions = useMemo(() => {
    if (!_versions) return [];
    return [..._versions].sort((a, b) => a.versionNumber - b.versionNumber);
  }, [_versions]);

  const [selectedVersionId, setSelectedVersionId] = useState<Id<"assetVersions"> | null>(null);

  useEffect(() => {
    if (versions.length > 0 && !selectedVersionId) {
      setSelectedVersionId(versions[versions.length - 1]._id);
    }
  }, [versions, selectedVersionId]);

  const selectedVersion = useMemo(() => {
    if (!versions || versions.length === 0) return null;
    return versions.find((v) => v._id === selectedVersionId) || versions[versions.length - 1];
  }, [versions, selectedVersionId]);

  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeToolTab, setActiveToolTab] = useState<"adjust" | "transform" | "background" | "ai">("adjust");

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);

  useEffect(() => {
    if (selectedVersion) {
      setHasUnsavedEdits(false);
      const recipe = (selectedVersion.recipe as any) || {};
      setBrightness(recipe.brightness ?? 100);
      setContrast(recipe.contrast ?? 100);
      setSaturation(recipe.saturation ?? 100);
      setWidth(selectedVersion.dimensions?.width ?? 1920);
      setHeight(selectedVersion.dimensions?.height ?? 1080);
    }
  }, [selectedVersion]);

  const createVersion = useMutation(api.assetVersions.createAssetVersion);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedVersion || !family) return;

    const fetchSignedUrl = async () => {
      try {
        const res = await fetch("/api/media/sign-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: selectedVersion.imageKitPath,
            width: width,
            maxDimensions: { width, height },
          }),
        });
        const data = await res.json();
        if (data.url) setSignedUrl(data.url);
      } catch (err) {
        console.error("Failed to sign URL", err);
      }
    };
    fetchSignedUrl();
  }, [selectedVersion, family, width, height]);

  const handleCreateVersion = async () => {
    if (!family || !selectedVersion) return;
    try {
      const newVersionId = await createVersion({
        familyId: family._id,
        parentVersionId: selectedVersion._id,
        imageKitFileId: selectedVersion.imageKitFileId,
        imageKitPath: selectedVersion.imageKitPath,
        recipe: { brightness, contrast, saturation },
        dimensions: { width, height },
        editLabel: "Custom Edit",
      });
      setSelectedVersionId(newVersionId);
      setHasUnsavedEdits(false);
    } catch (error) {
      console.error(error);
    }
  };

  const getToolTitle = () => {
    switch (activeToolTab) {
      case "adjust": return "Adjustments";
      case "transform": return "Transform & Crop";
      case "background": return "Background";
      case "ai": return "AI Magic Tools";
      default: return "Image Inspector";
    }
  };

  const formatTimeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div id="image-editor-shell" className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-[#090d16] text-slate-100 overflow-hidden font-sans">
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
              <span>{family?.title || "Demo Image.png"}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#ff6b4a]/10 text-[#ff6b4a] border border-[#ff6b4a]/20">
                {width} × {height}
              </span>
            </h1>
            <span className="text-[11px] text-slate-400 font-mono">Asset Family: {family?._id || "Demo"}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setHasUnsavedEdits(true)}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700/60 cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 text-[#ff6b4a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            + New Version
          </button>
          <button
            className="px-4 py-1.5 rounded-lg bg-[#ff6b4a] hover:bg-[#e05637] text-white text-xs font-bold shadow-lg shadow-[#ff6b4a]/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Asset
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <aside className="w-[340px] border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex flex-col shrink-0 overflow-y-auto">
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

          <div className="p-3 border-b border-slate-800/60">
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(["adjust", "ai", "transform"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveToolTab(tab)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeToolTab === tab
                      ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab === "adjust" ? "Adjust" : tab === "ai" ? "AI Magic" : "Transform"}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 space-y-4 border-b border-slate-800/80">
            {activeToolTab === "adjust" && (
              <div className="space-y-4">
                {[
                  { label: "Brightness", val: brightness, setVal: setBrightness, min: 50, max: 150 },
                  { label: "Contrast", val: contrast, setVal: setContrast, min: 50, max: 150 },
                  { label: "Saturation", val: saturation, setVal: setSaturation, min: 0, max: 200 }
                ].map(({ label, val, setVal, min, max }) => (
                  <div key={label} className="space-y-1.5">
                    <div className="flex justify-between text-xs items-center">
                      <label className="font-medium text-slate-300 text-xs">{label}</label>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setVal(Math.max(min, val - 5)); setHasUnsavedEdits(true); }} className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-xs">-</button>
                        <span className="font-mono text-xs text-slate-200 w-10 text-center">{val}%</span>
                        <button onClick={() => { setVal(Math.min(max, val + 5)); setHasUnsavedEdits(true); }} className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-xs">+</button>
                      </div>
                    </div>
                    <input
                      type="range" min={min} max={max} value={val}
                      onChange={(e) => { setVal(Number(e.target.value)); setHasUnsavedEdits(true); }}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
                    />
                  </div>
                ))}
              </div>
            )}
            
            {activeToolTab === "transform" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">Dimensions</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Width</span>
                      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 h-9">
                        <input
                          type="number" value={width}
                          onChange={(e) => { setWidth(Number(e.target.value)); setHasUnsavedEdits(true); }}
                          className="w-full bg-transparent text-xs font-mono text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Height</span>
                      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 h-9">
                        <input
                          type="number" value={height}
                          onChange={(e) => { setHeight(Number(e.target.value)); setHasUnsavedEdits(true); }}
                          className="w-full bg-transparent text-xs font-mono text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeToolTab === "ai" && (
              <div className="space-y-3">
                <button className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-left transition-all cursor-pointer">
                  <span className="text-[#ff6b4a] font-bold text-xs">4x AI Super Resolution</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Version History</h3>
                <span className="text-[11px] font-mono text-slate-500">{versions.length} Versions</span>
              </div>

              <div className="space-y-2">
                {hasUnsavedEdits && (
                  <div className="p-3 rounded-xl border-2 border-dashed border-[#ff6b4a]/50 bg-[#ff6b4a]/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#ff6b4a]/20 border border-[#ff6b4a]/40 flex items-center justify-center text-[#ff6b4a] font-mono text-xs font-bold">*</div>
                      <div>
                        <span className="text-xs font-bold text-[#ff6b4a] block">New version (Draft)</span>
                        <span className="text-[10px] text-slate-400 block">Unsaved inspector edits</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#ff6b4a] bg-[#ff6b4a]/10 px-2 py-0.5 rounded border border-[#ff6b4a]/20">Draft</span>
                  </div>
                )}

                {/* Reverse the versions for UI history (newest at top) */}
                {[...versions].reverse().map((ver) => {
                  const isSelected = selectedVersionId === ver._id;
                  const isLatest = versions[versions.length - 1]._id === ver._id;
                  return (
                    <button
                      key={ver._id}
                      onClick={() => setSelectedVersionId(ver._id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected ? "bg-[#ff6b4a]/10 border-2 border-[#ff6b4a] text-slate-100 shadow-md shadow-[#ff6b4a]/10" : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                          isSelected ? "bg-[#ff6b4a] text-white" : "bg-slate-800 text-slate-300"
                        }`}>
                          V{ver.versionNumber}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-200">{ver.editLabel || `Version ${ver.versionNumber}`}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">{formatTimeAgo(ver.createdAt)}</span>
                        </div>
                      </div>
                      {isLatest && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30">Current</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleCreateVersion}
              disabled={!hasUnsavedEdits || !selectedVersion}
              className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-4 ${
                !hasUnsavedEdits ? "bg-slate-700 opacity-50 cursor-not-allowed" : "bg-[#ff6b4a] hover:bg-[#e05637] cursor-pointer shadow-[#ff6b4a]/20"
              }`}
            >
              Create version
            </button>
          </div>
        </aside>

        <main className="flex-1 bg-[#090d16] flex flex-col items-center justify-center relative p-8 overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

          <div className="absolute top-6 left-6 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md text-xs font-medium text-slate-300 flex items-center gap-2.5 shadow-xl z-10">
            <span className="font-semibold text-slate-100">{family?.title || "Demo"}</span>
            <span className="text-[10px] font-mono font-bold text-[#ff6b4a] bg-[#ff6b4a]/10 px-2 py-0.5 rounded border border-[#ff6b4a]/20">
              V{selectedVersion?.versionNumber || "1"} 
            </span>
          </div>

          <div
            style={{ transform: `scale(${zoomLevel / 100})`, filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` }}
            className="relative transition-transform duration-200 ease-out max-w-full max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 flex items-center justify-center p-3"
          >
            {signedUrl ? (
               // eslint-disable-next-line @next/next/no-img-element
              <img src={signedUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="w-[620px] h-[350px] bg-gradient-to-tr from-slate-900 via-[#090d16] to-slate-900 rounded-xl flex flex-col items-center justify-center p-6 text-center space-y-4 border border-[#ff6b4a]/20 relative overflow-hidden">
                <span className="text-slate-400">Loading Preview...</span>
              </div>
            )}
          </div>

          <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-xl z-10">
            <button onClick={() => setZoomLevel((z) => Math.max(25, z - 25))} className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg">-</button>
            <span className="text-xs font-mono font-bold text-slate-200 w-12 text-center">{zoomLevel}%</span>
            <button onClick={() => setZoomLevel((z) => Math.min(200, z + 25))} className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg">+</button>
            <div className="w-px h-4 bg-slate-800 mx-1" />
            <button onClick={() => { setZoomLevel(100); setBrightness(100); setContrast(100); setSaturation(100); setHasUnsavedEdits(true); }} className="px-2.5 py-1 text-xs font-semibold text-[#ff6b4a] hover:bg-[#ff6b4a]/10 rounded-lg">Reset</button>
          </div>
        </main>
      </div>

      <div className="h-[240px] border-t border-slate-800/90 bg-slate-900/70 backdrop-blur-md p-4 shrink-0 flex flex-col justify-between overflow-x-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Version Timeline Track</h3>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-4 px-6 overflow-x-auto py-2">
          {versions.map((ver, idx) => {
            const isSelected = selectedVersionId === ver._id;
            const isLatest = idx === versions.length - 1;
            return (
              <div key={ver._id} className="flex items-center shrink-0 gap-4">
                <button
                  onClick={() => setSelectedVersionId(ver._id)}
                  className={`flex flex-col items-center p-3 rounded-2xl border transition-all cursor-pointer w-44 ${
                    isSelected ? "bg-[#ff6b4a]/10 border-2 border-[#ff6b4a] shadow-lg shadow-[#ff6b4a]/10" : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-slate-300">V{ver.versionNumber}</span>
                    {isLatest && <span className="text-[9px] font-bold text-[#ff6b4a] bg-[#ff6b4a]/20 px-1 rounded border border-[#ff6b4a]/30">Current</span>}
                  </div>
                  <div className="w-full h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-medium text-slate-400">
                    {ver.editLabel || `Version ${ver.versionNumber}`}
                  </div>
                </button>
                {idx < versions.length - 1 && (
                  <div className="w-12 h-0.5 bg-gradient-to-r from-slate-700 to-slate-500 shrink-0" />
                )}
              </div>
            );
          })}

          {hasUnsavedEdits && (
            <>
              <div className="w-12 h-0.5 border-t-2 border-dashed border-[#ff6b4a]/60 shrink-0" />
              <div className="flex flex-col items-center p-3 rounded-2xl border-2 border-dashed border-[#ff6b4a]/60 bg-[#ff6b4a]/5 shrink-0 w-44">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-[#ff6b4a]/20 text-[10px] font-mono font-bold text-[#ff6b4a]">Draft</span>
                </div>
                <div className="w-full h-16 rounded-xl bg-slate-950 border border-[#ff6b4a]/30 flex flex-col items-center justify-center p-2 text-center">
                  <span className="text-[11px] font-bold text-[#ff6b4a]">New Version</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ImageEditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Loading Editor...</div>}>
      <ImageEditorContent />
    </Suspense>
  );
}
