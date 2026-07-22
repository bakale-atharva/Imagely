"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

function VideoEditorContent() {
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

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState("1x");
  const [isMuted, setIsMuted] = useState(false);
  const [activeInspectorTab, setActiveInspectorTab] = useState<"media" | "tools" | "subtitles">("media");
  const [activeMediaTab, setActiveMediaTab] = useState<"clips" | "audio" | "effects">("clips");
  const [audioGain, setAudioGain] = useState(100);
  
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);
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
            // video might just use standard sign URL
          }),
        });
        const data = await res.json();
        if (data.url) setSignedUrl(data.url);
      } catch (err) {
        console.error("Failed to sign URL", err);
      }
    };
    fetchSignedUrl();
  }, [selectedVersion, family]);

  const handleCreateVersion = async () => {
    if (!family || !selectedVersion) return;
    try {
      const newVersionId = await createVersion({
        familyId: family._id,
        parentVersionId: selectedVersion._id,
        imageKitFileId: selectedVersion.imageKitFileId,
        imageKitPath: selectedVersion.imageKitPath,
        recipe: { audioGain }, // mock recipe edits
        dimensions: selectedVersion.dimensions || { width: 1920, height: 1080 },
        editLabel: "New Video Edit",
      });
      setSelectedVersionId(newVersionId);
      setHasUnsavedEdits(false);
    } catch (error) {
      console.error(error);
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
    <div id="video-editor-shell" className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      <div className="h-14 border-b border-slate-800/80 bg-slate-900/80 px-6 flex items-center justify-between backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/gallery"
            id="video-back-to-gallery-btn"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
            title="Back to Gallery"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xs font-bold text-slate-100 flex items-center gap-2 tracking-wide">
              <span>{family?.title || "Video Promo.mp4"}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#ff6b4a]/10 text-[#ff6b4a] border border-[#ff6b4a]/20">
                1080p
              </span>
            </h1>
            <span className="text-[11px] text-slate-400 font-mono">Family: {family?._id || "Demo"}</span>
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
            onClick={handleCreateVersion}
            disabled={!hasUnsavedEdits}
            className={`px-4 py-1.5 rounded-lg text-white text-xs font-bold shadow-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              hasUnsavedEdits ? "bg-[#ff6b4a] hover:bg-[#e05637] shadow-[#ff6b4a]/20" : "bg-slate-700 opacity-50"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
            Save Version
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <aside className="w-[340px] border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff6b4a]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {activeInspectorTab === "media" ? "Media Browser" : activeInspectorTab === "tools" ? "Trim & Transitions" : "Subtitles"}
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
              Inspector
            </span>
          </div>

          <div className="p-3 border-b border-slate-800/60">
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(["media", "tools", "subtitles"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveInspectorTab(tab)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeInspectorTab === tab
                      ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab === "media" ? "Media" : tab === "tools" ? "Tools" : "Subtitles"}
                </button>
              ))}
            </div>
          </div>

          {activeInspectorTab === "tools" && (
            <div className="p-4 space-y-4">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/90 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">Audio Gain Boost</span>
                  <span className="font-mono text-slate-400">{audioGain}%</span>
                </div>
                <input
                  type="range" min="0" max="200" value={audioGain}
                  onChange={(e) => { setAudioGain(Number(e.target.value)); setHasUnsavedEdits(true); }}
                  className="w-full accent-[#ff6b4a] cursor-pointer"
                />
              </div>
            </div>
          )}

          <div className="p-4 space-y-3 flex-1 flex flex-col justify-end">
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
                        <span className="text-xs font-bold text-[#ff6b4a] block">Draft</span>
                      </div>
                    </div>
                  </div>
                )}
                
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
          </div>
        </aside>

        <main className="flex-1 bg-[#090d16] flex flex-col justify-between p-6 relative overflow-hidden">
          <div className="flex-1 flex items-center justify-center relative">
            <div className="w-full max-w-3xl aspect-video bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs font-mono text-slate-300 backdrop-blur-md z-10">
                00:{currentTime < 10 ? `0${currentTime}` : currentTime} / 01:30
              </div>
              
              {signedUrl ? (
                <video 
                  src={signedUrl} 
                  controls={false}
                  autoPlay={isPlaying}
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  {isPlaying && <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b4a]/10 via-purple-500/10 to-indigo-500/10 animate-pulse pointer-events-none" />}
                  <div className="w-20 h-20 rounded-full bg-[#ff6b4a]/15 border border-[#ff6b4a]/30 flex items-center justify-center text-[#ff6b4a] mb-3 shadow-lg shadow-[#ff6b4a]/10">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-200">Video Canvas Viewport</h3>
                </>
              )}
            </div>
          </div>

          <div className="w-full bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-4 space-y-3 mt-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">00:{currentTime < 10 ? `0${currentTime}` : currentTime}</span>
              <input
                type="range" min="0" max="90" value={currentTime}
                onChange={(e) => setCurrentTime(Number(e.target.value))}
                className="flex-1 accent-[#ff6b4a] cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-400">01:30</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2.5 rounded-xl bg-[#ff6b4a] hover:bg-[#e05637] text-white transition-all shadow-md shadow-[#ff6b4a]/20 cursor-pointer"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <div className="h-[260px] border-t border-slate-800/90 bg-slate-900/70 backdrop-blur-md p-4 shrink-0 flex flex-col relative overflow-hidden">
        <div className="h-6 flex items-center justify-between px-24 border-b border-slate-800/80 text-[10px] font-mono text-slate-500 shrink-0">
          <span>00:00</span><span>00:15</span><span>00:30</span><span>00:45</span><span>01:00</span><span>01:15</span><span>01:30</span>
        </div>
        <div className="flex-1 flex flex-col gap-2 pt-3 overflow-y-auto relative">
          <div style={{ left: `${(currentTime / 90) * 80 + 10}%` }} className="absolute top-0 bottom-0 w-0.5 bg-[#ff6b4a] z-20 pointer-events-none transition-all duration-150">
            <div className="w-3 h-3 bg-[#ff6b4a] rounded-full -translate-x-[5px] -translate-y-1 shadow-md shadow-[#ff6b4a]/40" />
          </div>

          <div className="h-14 bg-slate-950/80 rounded-xl border border-slate-800/80 p-2 flex items-center gap-3 relative">
            <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 w-16 shrink-0">Video</span>
            <div className="flex-1 flex gap-2 overflow-x-auto h-full">
               <div className="h-full bg-indigo-950/70 border border-indigo-500/40 rounded-lg px-3 flex items-center gap-2 text-xs text-indigo-200 shrink-0 w-64 shadow-sm">
                <span className="truncate font-semibold">{family?.title || "Cinematic Intro.mp4"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VideoEditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Loading Editor...</div>}>
      <VideoEditorContent />
    </Suspense>
  );
}
