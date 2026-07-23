"use client";

import { useState, useEffect, useRef, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface RecipeState {
  startSeconds: number;
  endSeconds: number;
  mute: boolean;
  format: "mp4" | "webm";
  quality: number;
  thumbnailTime: number;
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:5";
  rotate: 0 | 90 | 180 | 270;
  watermark: string;
  extractAudio: boolean;
  subtitleUrl: string;
}

const DEFAULT_RECIPE: RecipeState = {
  startSeconds: 0,
  endSeconds: 90,
  mute: false,
  format: "mp4",
  quality: 80,
  thumbnailTime: 0,
  aspectRatio: "16:9",
  rotate: 0,
  watermark: "",
  extractAudio: false,
  subtitleUrl: "",
};

function VideoEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const familyId = idParam ? (idParam as Id<"assetFamilies">) : null;

  const { has, isLoaded: isAuthLoaded } = useAuth();

  // Entitlement feature checks
  const canUsePro = useMemo(() => {
    if (!isAuthLoaded || !has) return true; // Default permissive in dev/unloaded state
    return (
      has({ feature: "advanced_video" }) ||
      has({ plan: "pro" }) ||
      has({ plan: "ultra" })
    );
  }, [has, isAuthLoaded]);

  const canUseUltra = useMemo(() => {
    if (!isAuthLoaded || !has) return true;
    return (
      has({ feature: "audio_extraction" }) ||
      has({ feature: "subtitle_overlay" }) ||
      has({ plan: "ultra" })
    );
  }, [has, isAuthLoaded]);

  const family = useQuery(
    api.assetFamilies.getAssetFamily,
    familyId ? { familyId } : "skip"
  );
  const _versions = useQuery(
    api.assetVersions.listAssetVersions,
    familyId ? { familyId } : "skip"
  );

  const versions = useMemo(() => {
    if (!_versions) return [];
    return [..._versions].sort((a, b) => a.versionNumber - b.versionNumber);
  }, [_versions]);

  const [selectedVersionId, setSelectedVersionId] = useState<Id<"assetVersions"> | null>(null);

  const selectedVersion = useMemo(() => {
    if (!versions || versions.length === 0) return null;
    return (
      versions.find((v) => v._id === selectedVersionId) ||
      versions[versions.length - 1]
    );
  }, [versions, selectedVersionId]);

  // Recipe state
  const [recipe, setRecipe] = useState<RecipeState>(DEFAULT_RECIPE);
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);
  const loadedVersionIdRef = useRef<string | null>(null);

  // Load recipe from selected version if available
  useEffect(() => {
    if (selectedVersion && selectedVersion._id !== loadedVersionIdRef.current) {
      loadedVersionIdRef.current = selectedVersion._id;
      const existingRecipe = (selectedVersion.recipe as Partial<RecipeState>) || {};
      setRecipe({
        startSeconds: existingRecipe.startSeconds ?? 0,
        endSeconds: existingRecipe.endSeconds ?? 90,
        mute: existingRecipe.mute ?? false,
        format: (existingRecipe.format as "mp4" | "webm") ?? "mp4",
        quality: existingRecipe.quality ?? 80,
        thumbnailTime: existingRecipe.thumbnailTime ?? 0,
        aspectRatio: (existingRecipe.aspectRatio as "16:9" | "9:16" | "1:1" | "4:5") ?? "16:9",
        rotate: (existingRecipe.rotate as 0 | 90 | 180 | 270) ?? 0,
        watermark: existingRecipe.watermark ?? "",
        extractAudio: existingRecipe.extractAudio ?? false,
        subtitleUrl: existingRecipe.subtitleUrl ?? "",
      });
      setHasUnsavedEdits(false);
    }
  }, [selectedVersion]);

  // Video playback states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(90);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Inspector Tab state: "basic" | "advanced" | "audioSubtitles"
  const [inspectorTab, setInspectorTab] = useState<
    "basic" | "advanced" | "audioSubtitles"
  >("basic");

  // Upgrade Modal state
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    requiredTier: "PRO" | "ULTRA";
    featureName: string;
  } | null>(null);

  // Exporting state
  const [isExporting, setIsExporting] = useState(false);
  const createVersion = useMutation(api.assetVersions.createAssetVersion);

  // Fetch signed URL when version or relevant heavy transforms change
  useEffect(() => {
    if (!selectedVersion || !family) return;

    let isMounted = true;

    const fetchSignedUrl = async () => {
      if (isMounted) setIsProcessing(true);
      try {
        const res = await fetch("/api/media/sign-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: selectedVersion.imageKitPath,
            recipe: {
              mute: recipe.mute,
              format: recipe.format,
              quality: recipe.quality,
              rotate: recipe.rotate,
              aspectRatio: recipe.aspectRatio,
              startSeconds: recipe.startSeconds,
              endSeconds: recipe.endSeconds,
              extractAudio: recipe.extractAudio,
              watermark: recipe.watermark || undefined,
              subtitleUrl: recipe.subtitleUrl || undefined,
            },
          }),
        });
        const data = await res.json();
        if (isMounted) {
          if (data.url) setSignedUrl(data.url);
          // Simulate slight processing delay for heavy video transforms
          setTimeout(() => {
            if (isMounted) setIsProcessing(false);
          }, 400);
        }
      } catch (err) {
        console.error("Failed to sign media URL", err);
        if (isMounted) setIsProcessing(false);
      }
    };

    fetchSignedUrl();

    return () => {
      isMounted = false;
    };
  }, [
    selectedVersion,
    family,
    recipe.mute,
    recipe.format,
    recipe.quality,
    recipe.rotate,
    recipe.aspectRatio,
    recipe.startSeconds,
    recipe.endSeconds,
    recipe.extractAudio,
    recipe.watermark,
    recipe.subtitleUrl,
  ]);

  // Video playback speed sync
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Video play/pause sync
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => setIsPlaying(false));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const updateRecipe = (edits: Partial<RecipeState>) => {
    setRecipe((prev) => ({ ...prev, ...edits }));
    setHasUnsavedEdits(true);
  };

  // Helper for entitlement check before applying edit
  const handleGatedInteraction = (
    tier: "PRO" | "ULTRA",
    featureName: string,
    action: () => void
  ) => {
    const isAllowed = tier === "PRO" ? canUsePro : canUseUltra;
    if (!isAllowed) {
      setUpgradeModal({
        isOpen: true,
        requiredTier: tier,
        featureName,
      });
      return;
    }
    action();
  };

  const handleCreateVersion = async () => {
    if (!family || !selectedVersion) return;
    try {
      const authRes = await fetch("/api/media/version-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe,
          imageKitPath: selectedVersion.imageKitPath,
          mediaKind: "video",
        }),
      });

      if (!authRes.ok) {
        const errData = await authRes.json();
        if (authRes.status === 403) {
          const isUltraNeeded = errData.missingFeatures?.includes("audio_extraction") || errData.missingFeatures?.includes("subtitle_overlay");
          setUpgradeModal({
            isOpen: true,
            requiredTier: isUltraNeeded ? "ULTRA" : "PRO",
            featureName: errData.missingFeatures?.join(", ") || "Advanced Video Features",
          });
          return;
        }
      }

      const newVersionId = await createVersion({
        familyId: family._id,
        parentVersionId: selectedVersion._id,
        imageKitFileId: selectedVersion.imageKitFileId,
        imageKitPath: selectedVersion.imageKitPath,
        recipe: { ...recipe },
        dimensions: selectedVersion.dimensions || { width: 1920, height: 1080 },
        editLabel: `Video Edit (V${versions.length + 1})`,
      });
      setSelectedVersionId(newVersionId);
      setHasUnsavedEdits(false);
    } catch (error) {
      console.error("Failed to save version:", error);
    }
  };

  const handleExport = async () => {
    if (!selectedVersion) return;
    setIsExporting(true);
    try {
      const res = await fetch("/api/media/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: selectedVersion.imageKitPath,
          recipe,
          filename: family?.title ? `edited-${family.title}` : "imagely-video-export",
          format: recipe.extractAudio ? "mp3" : recipe.format,
        }),
      });
      const data = await res.json();
      if (data.exportUrl) {
        const link = document.createElement("a");
        link.href = data.exportUrl;
        link.download = data.filename || "video-export";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert(data.error || "Export failed.");
      }
    } catch (err) {
      console.error("Failed to export video", err);
      alert("Error generating export link.");
    } finally {
      setIsExporting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
  };

  const now = useMemo(() => Date.now(), []);

  const formatTimeAgo = (ts: number) => {
    const diff = now - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div
      id="video-editor-shell"
      className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-[#090d16] text-slate-100 overflow-hidden font-sans select-none relative"
    >
      {/* Top Header Bar */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-900/80 px-6 flex items-center justify-between backdrop-blur-md shrink-0 z-20">
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
              <span>{family?.title || "Cinematic Project.mp4"}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#ff6b4a]/10 text-[#ff6b4a] border border-[#ff6b4a]/20">
                {recipe.aspectRatio} • {recipe.format.toUpperCase()}
              </span>
            </h1>
            <span className="text-[11px] text-slate-400 font-mono">
              Family ID: {family?._id || "Loading..."}
            </span>
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
            + New Draft
          </button>

          <button
            onClick={handleCreateVersion}
            disabled={!hasUnsavedEdits}
            className={`px-4 py-1.5 rounded-lg text-white text-xs font-bold shadow-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              hasUnsavedEdits
                ? "bg-[#ff6b4a] hover:bg-[#e05637] shadow-[#ff6b4a]/20"
                : "bg-slate-700 opacity-50 cursor-not-allowed"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            Save Version
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            {isExporting ? (
              <span className="animate-spin text-xs">⏳</span>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            )}
            Export {recipe.extractAudio ? "Audio" : "Video"}
          </button>
        </div>
      </header>

      {/* Center & Left Inspector Split */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Inspector Pane (340px) */}
        <aside
          id="video-inspector-pane"
          className="w-[340px] border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex flex-col shrink-0 overflow-y-auto"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff6b4a]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {inspectorTab === "basic"
                  ? "Basic Video"
                  : inspectorTab === "advanced"
                  ? "Advanced Studio"
                  : "Audio & Subtitles"}
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
              Inspector
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="p-3 border-b border-slate-800/60">
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setInspectorTab("basic")}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  inspectorTab === "basic"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Basic
              </button>
              <button
                onClick={() => setInspectorTab("advanced")}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  inspectorTab === "advanced"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Advanced
                <span className="text-[9px] font-extrabold px-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  PRO
                </span>
              </button>
              <button
                onClick={() => setInspectorTab("audioSubtitles")}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  inspectorTab === "audioSubtitles"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Audio/Sub
                <span className="text-[9px] font-extrabold px-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  ULTRA
                </span>
              </button>
            </div>
          </div>

          {/* Controls Body */}
          <div className="p-4 space-y-5 border-b border-slate-800/80">
            {/* TAB 1: BASIC VIDEO (Free) */}
            {inspectorTab === "basic" && (
              <div className="space-y-4">
                {/* Trim Start & End Times */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Trim Time Range (Seconds)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        Start (so)
                      </span>
                      <input
                        type="number"
                        min="0"
                        max={recipe.endSeconds - 1}
                        value={recipe.startSeconds}
                        onChange={(e) =>
                          updateRecipe({ startSeconds: Math.max(0, Number(e.target.value)) })
                        }
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 h-9 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#ff6b4a]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        End (eo)
                      </span>
                      <input
                        type="number"
                        min={recipe.startSeconds + 1}
                        max={duration}
                        value={recipe.endSeconds}
                        onChange={(e) =>
                          updateRecipe({ endSeconds: Math.max(recipe.startSeconds + 1, Number(e.target.value)) })
                        }
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 h-9 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#ff6b4a]"
                      />
                    </div>
                  </div>
                </div>

                {/* Mute Video Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      {recipe.mute && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />}
                    </svg>
                    <span className="text-xs font-semibold text-slate-200">Mute Audio</span>
                  </div>
                  <button
                    onClick={() => updateRecipe({ mute: !recipe.mute })}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                      recipe.mute ? "bg-[#ff6b4a]" : "bg-slate-800"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                        recipe.mute ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Video Format */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Export Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["mp4", "webm"] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => updateRecipe({ format: fmt })}
                        className={`py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border ${
                          recipe.format === fmt
                            ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border-[#ff6b4a]"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs items-center">
                    <label className="font-semibold text-slate-300">Quality</label>
                    <span className="font-mono text-slate-200">{recipe.quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={recipe.quality}
                    onChange={(e) => updateRecipe({ quality: Number(e.target.value) })}
                    className="w-full accent-[#ff6b4a] cursor-pointer"
                  />
                </div>

                {/* Thumbnail Frame Picker */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs items-center">
                    <label className="font-semibold text-slate-300">Thumbnail Frame Picker</label>
                    <span className="font-mono text-slate-200">{formatTime(recipe.thumbnailTime)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={recipe.thumbnailTime}
                    onChange={(e) => {
                      const t = Number(e.target.value);
                      updateRecipe({ thumbnailTime: t });
                      if (videoRef.current) videoRef.current.currentTime = t;
                    }}
                    className="w-full accent-[#ff6b4a] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: ADVANCED (Pro Gated) */}
            {inspectorTab === "advanced" && (
              <div className="space-y-4">
                {/* Aspect Ratio Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Aspect Ratio Presets</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      PRO
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(["16:9", "9:16", "1:1", "4:5"] as const).map((ar) => (
                      <button
                        key={ar}
                        onClick={() =>
                          handleGatedInteraction("PRO", "Aspect Ratio Presets", () =>
                            updateRecipe({ aspectRatio: ar })
                          )
                        }
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                          recipe.aspectRatio === ar
                            ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border-[#ff6b4a]"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {!canUsePro && <span className="text-[10px]">🔒</span>}
                        {ar}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rotation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Rotation</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      PRO
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {([0, 90, 180, 270] as const).map((rot) => (
                      <button
                        key={rot}
                        onClick={() =>
                          handleGatedInteraction("PRO", "Video Rotation", () =>
                            updateRecipe({ rotate: rot })
                          )
                        }
                        className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                          recipe.rotate === rot
                            ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border-[#ff6b4a]"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {rot}°
                      </button>
                    ))}
                  </div>
                </div>

                {/* Watermark Overlay */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Watermark Overlay</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      PRO
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. logo_watermark_id"
                    value={recipe.watermark}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleGatedInteraction("PRO", "Watermark Overlay", () =>
                        updateRecipe({ watermark: val })
                      );
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 h-9 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#ff6b4a]"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: AUDIO & SUBTITLES (Ultra Gated) */}
            {inspectorTab === "audioSubtitles" && (
              <div className="space-y-4">
                {/* Extract Audio Toggle */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-200">Audio Extraction</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        ULTRA
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Extract MP3 audio track</span>
                  </div>
                  <button
                    onClick={() =>
                      handleGatedInteraction("ULTRA", "Audio Extraction", () =>
                        updateRecipe({ extractAudio: !recipe.extractAudio })
                      )
                    }
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                      recipe.extractAudio ? "bg-purple-600" : "bg-slate-800"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                        recipe.extractAudio ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Subtitle File Overlay */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Subtitle Overlay File</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      ULTRA
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="https://example.com/subtitles.vtt"
                    value={recipe.subtitleUrl}
                    onChange={(e) => {
                      const urlVal = e.target.value;
                      handleGatedInteraction("ULTRA", "Subtitle Overlay", () =>
                        updateRecipe({ subtitleUrl: urlVal })
                      );
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 h-9 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#ff6b4a]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Version History Rail in Inspector */}
          <div className="p-4 space-y-3 flex-1 flex flex-col justify-end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Version History
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  {versions.length} Versions
                </span>
              </div>

              <div className="space-y-2">
                {hasUnsavedEdits && (
                  <div className="p-3 rounded-xl border-2 border-dashed border-[#ff6b4a]/50 bg-[#ff6b4a]/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#ff6b4a]/20 border border-[#ff6b4a]/40 flex items-center justify-center text-[#ff6b4a] font-mono text-xs font-bold">
                        *
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#ff6b4a] block">
                          Draft Version
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Unsaved timeline edits
                        </span>
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
                        isSelected
                          ? "bg-[#ff6b4a]/10 border-2 border-[#ff6b4a] text-slate-100 shadow-md shadow-[#ff6b4a]/10"
                          : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                            isSelected
                              ? "bg-[#ff6b4a] text-white"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          V{ver.versionNumber}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-200">
                            {ver.editLabel || `Version ${ver.versionNumber}`}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            {formatTimeAgo(ver.createdAt)}
                          </span>
                        </div>
                      </div>
                      {isLatest && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30">
                          Current
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Central Preview Stage */}
        <main
          id="video-preview-stage"
          className="flex-1 bg-[#090d16] flex flex-col justify-between p-6 relative overflow-hidden"
        >
          {/* Animated Processing Banner Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-[#090d16]/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3 animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-[#ff6b4a]/40 flex items-center justify-center shadow-xl shadow-[#ff6b4a]/10 animate-pulse">
                <span className="animate-spin text-xl text-[#ff6b4a]">⚡</span>
              </div>
              <div className="text-center">
                <h4 className="text-sm font-bold text-slate-100">Processing video transform...</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Applying ImageKit recipe settings</p>
              </div>
            </div>
          )}

          {/* Video Stage Canvas */}
          <div className="flex-1 flex items-center justify-center relative">
            <div
              className={`w-full max-w-4xl bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-300 ${
                recipe.aspectRatio === "9:16"
                  ? "aspect-[9/16] max-h-[65vh]"
                  : recipe.aspectRatio === "1:1"
                  ? "aspect-square max-h-[65vh]"
                  : recipe.aspectRatio === "4:5"
                  ? "aspect-[4/5] max-h-[65vh]"
                  : "aspect-video"
              }`}
              style={{ transform: `rotate(${recipe.rotate}deg)` }}
            >
              {/* Timecode Header Overlay */}
              <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs font-mono text-slate-300 backdrop-blur-md z-10">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              {signedUrl ? (
                <video
                  ref={videoRef}
                  src={signedUrl}
                  muted={recipe.mute}
                  onLoadedMetadata={(e) => {
                    setDuration(e.currentTarget.duration || 90);
                    if (recipe.endSeconds === 90) {
                      updateRecipe({ endSeconds: Math.floor(e.currentTarget.duration || 90) });
                    }
                  }}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#ff6b4a]/10 border border-[#ff6b4a]/30 flex items-center justify-center text-[#ff6b4a]">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-300">Loading Video Stream...</span>
                </div>
              )}
            </div>
          </div>

          {/* Scrubber & Player Bar */}
          <div className="w-full bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-4 space-y-3 mt-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={currentTime}
                onChange={(e) => {
                  const t = Number(e.target.value);
                  setCurrentTime(t);
                  if (videoRef.current) videoRef.current.currentTime = t;
                }}
                className="flex-1 accent-[#ff6b4a] cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-xs font-mono text-slate-400">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2.5 rounded-xl bg-[#ff6b4a] hover:bg-[#e05637] text-white transition-all shadow-md shadow-[#ff6b4a]/20 cursor-pointer"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  )}
                </button>

                <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400">Speed:</span>
                  {[0.5, 1.0, 1.5, 2.0].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-0.5 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        playbackSpeed === spd
                          ? "bg-[#ff6b4a]/20 text-[#ff6b4a]"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {recipe.extractAudio && (
                  <span className="text-[10px] font-extrabold px-2 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    🎵 Audio Extraction Enabled
                  </span>
                )}
                {recipe.mute && (
                  <span className="text-[10px] font-extrabold px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    🔇 Muted
                  </span>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Multi-Track Timeline (260px) */}
      <footer
        id="video-timeline-pane"
        className="h-[260px] border-t border-slate-800/90 bg-slate-900/70 backdrop-blur-md p-4 shrink-0 flex flex-col relative overflow-hidden"
      >
        {/* Time Ruler with Markers */}
        <div className="h-6 flex items-center justify-between px-20 border-b border-slate-800/80 text-[10px] font-mono text-slate-400 shrink-0 select-none">
          <span>00:00</span>
          <span>00:15</span>
          <span>00:30</span>
          <span>00:45</span>
          <span>01:00</span>
          <span>01:15</span>
          <span>01:30</span>
        </div>

        {/* Tracks Container */}
        <div className="flex-1 flex flex-col gap-2 pt-3 overflow-y-auto relative">
          {/* Red/Coral Playhead Indicator */}
          <div
            style={{ left: `${Math.min(100, Math.max(0, (currentTime / (duration || 90)) * 100))}%` }}
            className="absolute top-0 bottom-0 w-0.5 bg-[#ff6b4a] z-30 pointer-events-none transition-all duration-75"
          >
            <div className="w-3 h-3 bg-[#ff6b4a] rounded-full -translate-x-[5px] -translate-y-1 shadow-md shadow-[#ff6b4a]/50" />
          </div>

          {/* Track 1: Video Clip Track */}
          <div className="h-12 bg-slate-950/80 rounded-xl border border-slate-800/80 px-3 flex items-center gap-3 relative shrink-0">
            <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 w-20 shrink-0 flex items-center gap-1">
              🎬 Video Clip
            </span>
            <div className="flex-1 h-8 bg-indigo-950/60 border border-indigo-500/30 rounded-lg px-3 flex items-center justify-between text-xs text-indigo-200 overflow-hidden">
              <span className="truncate font-semibold text-xs">
                {family?.title || "Video Track.mp4"}
              </span>
              <span className="text-[10px] font-mono text-indigo-300/70">
                [{recipe.startSeconds}s - {recipe.endSeconds}s]
              </span>
            </div>
          </div>

          {/* Track 2: Audio Track (Purple/Indigo Waveform styling) */}
          <div className="h-12 bg-slate-950/80 rounded-xl border border-slate-800/80 px-3 flex items-center gap-3 relative shrink-0">
            <span className="text-[10px] font-mono font-bold uppercase text-purple-400 w-20 shrink-0 flex items-center gap-1">
              🎵 Audio Wave
            </span>
            <div className={`flex-1 h-8 rounded-lg px-3 flex items-center justify-between text-xs border ${
              recipe.mute
                ? "bg-slate-900 border-slate-800 text-slate-500"
                : "bg-purple-950/60 border-purple-500/40 text-purple-200"
            }`}>
              <div className="flex items-center gap-2">
                <div className="flex items-end gap-0.5 h-4">
                  <span className="w-1 bg-purple-400 h-3 animate-pulse" />
                  <span className="w-1 bg-purple-400 h-4" />
                  <span className="w-1 bg-purple-400 h-2" />
                  <span className="w-1 bg-purple-400 h-3.5" />
                </div>
                <span className="font-semibold text-xs">
                  {recipe.mute ? "Audio Muted" : "Master Audio Stream"}
                </span>
              </div>
              <span className="text-[10px] font-mono">
                {recipe.extractAudio ? "Extracted MP3" : "Stereo 48kHz"}
              </span>
            </div>
          </div>

          {/* Track 3: Subtitle Track (Amber/Emerald styling) */}
          <div className="h-12 bg-slate-950/80 rounded-xl border border-slate-800/80 px-3 flex items-center gap-3 relative shrink-0">
            <span className="text-[10px] font-mono font-bold uppercase text-amber-400 w-20 shrink-0 flex items-center gap-1">
              💬 Subtitles
            </span>
            <div className={`flex-1 h-8 rounded-lg px-3 flex items-center justify-between text-xs border ${
              recipe.subtitleUrl
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
                : "bg-amber-950/40 border-amber-500/30 text-amber-300/80"
            }`}>
              <span className="font-semibold text-xs truncate">
                {recipe.subtitleUrl ? `Subtitle file: ${recipe.subtitleUrl}` : "No Subtitle Overlay Loaded"}
              </span>
              <span className="text-[10px] font-mono">
                {recipe.subtitleUrl ? "VTT Active" : "Disabled"}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Upgrade Prompt Modal */}
      {upgradeModal?.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 text-xl font-bold">
              👑
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-100">
                Unlock {upgradeModal.featureName}
              </h3>
              <p className="text-xs text-slate-400">
                This feature requires the{" "}
                <span className="font-bold text-amber-400">{upgradeModal.requiredTier} Plan</span>.
                Upgrade your subscription to access professional video studio capabilities.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setUpgradeModal(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => router.push("/pricing")}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold shadow-lg cursor-pointer"
              >
                Upgrade to {upgradeModal.requiredTier}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VideoEditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-100 bg-[#090d16] h-screen">Loading Video Studio...</div>}>
      <VideoEditorContent />
    </Suspense>
  );
}
