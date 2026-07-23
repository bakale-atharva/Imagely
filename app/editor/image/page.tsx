"use client";

import { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Recipe } from "@/lib/recipe";

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

  // Clerk entitlement check
  const { has, isLoaded } = useAuth();
  const isPro = useMemo(() => {
    if (!isLoaded || !has) return false;
    try {
      return (
        has({ plan: "pro" }) ||
        has({ plan: "ultra" }) ||
        has({ feature: "image_ai" }) ||
        has({ feature: "advanced_image" })
      );
    } catch {
      return false;
    }
  }, [has, isLoaded]);

  // Modals state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeatureName, setUpgradeFeatureName] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Inspector & Canvas State
  const [activeToolTab, setActiveToolTab] = useState<"adjust" | "transform" | "ai">("adjust");
  const [zoomLevel, setZoomLevel] = useState(100);

  // Adjust parameters (Free)
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [quality, setQuality] = useState(100);
  const [format, setFormat] = useState<string>("auto");

  // Transform parameters (Free)
  const [aspectRatio, setAspectRatio] = useState<string>("Freeform");
  const [width, setWidth] = useState<number>(1920);
  const [height, setHeight] = useState<number>(1080);
  const [rotate, setRotate] = useState<number>(0);
  const [crop, setCrop] = useState<string>("maintain_ratio");

  // AI & Pro parameters (Pro)
  const [bgRemove, setBgRemove] = useState<boolean>(false);
  const [textOverlay, setTextOverlay] = useState<string>("");
  const [watermark, setWatermark] = useState<string>("");
  const [blur, setBlur] = useState<number>(0);

  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);

  // Sync state when selected version changes
  useEffect(() => {
    if (selectedVersion) {
      setHasUnsavedEdits(false);
      const recipe = (selectedVersion.recipe as any) || {};
      setBrightness(typeof recipe.brightness === "number" ? recipe.brightness : 100);
      setContrast(typeof recipe.contrast === "number" ? recipe.contrast : 100);
      setSaturation(typeof recipe.saturation === "number" ? recipe.saturation : 100);
      setQuality(typeof recipe.quality === "number" ? recipe.quality : 100);
      setFormat(typeof recipe.format === "string" ? recipe.format : "auto");
      setAspectRatio(recipe.aspectRatio ? String(recipe.aspectRatio) : "Freeform");
      setWidth(selectedVersion.dimensions?.width ?? 1920);
      setHeight(selectedVersion.dimensions?.height ?? 1080);
      setRotate(typeof recipe.rotate === "number" ? recipe.rotate : 0);
      setCrop(typeof recipe.crop === "string" ? recipe.crop : "maintain_ratio");
      setBgRemove(typeof recipe.bgRemove === "boolean" ? recipe.bgRemove : false);
      setTextOverlay(typeof recipe.textOverlay === "string" ? recipe.textOverlay : "");
      setWatermark(typeof recipe.watermark === "string" ? recipe.watermark : "");
      setBlur(typeof recipe.blur === "number" ? recipe.blur : 0);
    }
  }, [selectedVersion]);

  // Construct current draft recipe object
  const currentRecipe = useMemo<Recipe>(() => {
    const r: Recipe = {};
    if (brightness !== 100) r.brightness = brightness;
    if (contrast !== 100) r.contrast = contrast;
    if (saturation !== 100) r.saturation = saturation;
    if (quality !== 100) r.quality = quality;
    if (format !== "auto") r.format = format;
    if (aspectRatio !== "Freeform") r.aspectRatio = aspectRatio;
    if (width) r.width = width;
    if (height) r.height = height;
    if (rotate !== 0) r.rotate = rotate;
    if (crop !== "maintain_ratio") r.crop = crop;
    if (bgRemove) r.bgRemove = true;
    if (textOverlay.trim()) r.textOverlay = textOverlay.trim();
    if (watermark.trim()) r.watermark = watermark.trim();
    if (blur > 0) r.blur = blur;
    return r;
  }, [
    brightness,
    contrast,
    saturation,
    quality,
    format,
    aspectRatio,
    width,
    height,
    rotate,
    crop,
    bgRemove,
    textOverlay,
    watermark,
    blur,
  ]);

  // Fetch signed image URL for preview stage
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const fetchSignedUrl = useCallback(async () => {
    if (!selectedVersion) return;
    setIsLoadingPreview(true);
    try {
      const res = await fetch("/api/media/sign-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: selectedVersion.imageKitPath,
          recipe: currentRecipe,
          width: width,
          maxDimensions: { width, height },
        }),
      });
      const data = await res.json();
      if (data.url) setSignedUrl(data.url);
    } catch (err) {
      console.error("Failed to sign preview URL", err);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [selectedVersion, currentRecipe, width, height]);

  useEffect(() => {
    fetchSignedUrl();
  }, [fetchSignedUrl]);

  // Helper for Pro feature entitlement protection
  const handleProInteraction = (featureName: string, callback: () => void) => {
    if (isPro) {
      callback();
    } else {
      setUpgradeFeatureName(featureName);
      setShowUpgradeModal(true);
    }
  };

  // Helper to trigger unsaved edits change
  const markEdited = () => setHasUnsavedEdits(true);

  // Aspect ratio preset handler
  const handleAspectRatioChange = (preset: string) => {
    setAspectRatio(preset);
    markEdited();
    if (preset === "1:1") {
      const side = Math.min(width, height) || 1080;
      setWidth(side);
      setHeight(side);
    } else if (preset === "16:9") {
      setWidth(1920);
      setHeight(1080);
    } else if (preset === "4:3") {
      setWidth(1440);
      setHeight(1080);
    } else if (preset === "9:16") {
      setWidth(1080);
      setHeight(1920);
    }
  };

  // Generate Edit Label
  const getEditLabel = () => {
    const parts: string[] = [];
    if (bgRemove) parts.push("BG Remove");
    if (blur > 0) parts.push(`Blur ${blur}`);
    if (textOverlay) parts.push("Text Overlay");
    if (watermark) parts.push("Watermark");
    if (rotate !== 0) parts.push(`Rotate ${rotate}°`);
    if (aspectRatio !== "Freeform") parts.push(`Crop ${aspectRatio}`);
    if (brightness !== 100 || contrast !== 100 || saturation !== 100) parts.push("Color Adjust");
    if (format !== "auto") parts.push(`Format ${format.toUpperCase()}`);
    return parts.length > 0 ? parts.join(", ") : "Custom Edit";
  };

  // Convex Create Version mutation
  const createVersion = useMutation(api.assetVersions.createAssetVersion);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);

  const handleCreateVersion = async () => {
    if (!family || !selectedVersion) return;
    setIsCreatingVersion(true);
    try {
      // Call server entitlement endpoint before creating version
      const authRes = await fetch("/api/media/version-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe: currentRecipe,
          imageKitPath: selectedVersion.imageKitPath,
          mediaKind: "image",
        }),
      });

      if (!authRes.ok) {
        const errData = await authRes.json();
        if (authRes.status === 403) {
          setUpgradeFeatureName(errData.missingFeatures?.join(", ") || "Advanced Image Tools");
          setShowUpgradeModal(true);
          return;
        }
      }

      const newVersionId = await createVersion({
        familyId: family._id,
        parentVersionId: selectedVersion._id,
        imageKitFileId: selectedVersion.imageKitFileId,
        imageKitPath: selectedVersion.imageKitPath,
        recipe: currentRecipe,
        dimensions: { width, height },
        editLabel: getEditLabel(),
      });
      setSelectedVersionId(newVersionId);
      setHasUnsavedEdits(false);
    } catch (error) {
      console.error("Failed to create asset version:", error);
    } finally {
      setIsCreatingVersion(false);
    }
  };

  // Export trigger
  const handleExport = async () => {
    if (!selectedVersion) return;
    setIsExporting(true);
    try {
      const res = await fetch("/api/media/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: selectedVersion.imageKitPath,
          recipe: currentRecipe,
          filename: family?.title ? `${family.title.replace(/\.[^/.]+$/, "")}-export` : "imagely-export",
          format: format !== "auto" ? format : "png",
        }),
      });
      const data = await res.json();
      if (data.exportUrl) {
        const link = document.createElement("a");
        link.href = data.exportUrl;
        link.download = `${data.filename || "imagely-export"}.${data.format || "png"}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportModal(false);
      }
    } catch (err) {
      console.error("Failed to export media:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const formatTimeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div id="image-editor-shell" className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-[#090d16] text-slate-100 overflow-hidden font-sans relative">
      {/* Top Bar Header */}
      <header className="h-14 border-b border-slate-800/80 bg-[#0d1322]/90 px-6 flex items-center justify-between backdrop-blur-md shrink-0 z-20">
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
              <span>{family?.title || "Image Asset"}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#ff6b4a]/10 text-[#ff6b4a] border border-[#ff6b4a]/20">
                {width} × {height}
              </span>
            </h1>
            <span className="text-[11px] text-slate-400 font-mono">
              Version: V{selectedVersion?.versionNumber || 1} {selectedVersion?._id === versions[versions.length - 1]?._id ? "(Current)" : ""}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedEdits && (
            <span className="text-[11px] font-semibold text-[#ff6b4a] bg-[#ff6b4a]/10 px-2.5 py-1 rounded-full border border-[#ff6b4a]/30 animate-pulse flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b4a]" /> Unsaved Edits
            </span>
          )}
          <button
            onClick={() => setShowExportModal(true)}
            id="image-export-btn"
            className="px-4 py-1.5 rounded-lg bg-[#ff6b4a] hover:bg-[#e05637] text-white text-xs font-bold shadow-lg shadow-[#ff6b4a]/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Asset
          </button>
        </div>
      </header>

      {/* Main Studio View: Inspector + Preview Stage */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Inspector (340px) */}
        <aside className="w-[340px] border-r border-slate-800/80 bg-[#0d1322] flex flex-col shrink-0 overflow-y-auto">
          {/* Inspector Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b4a]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {activeToolTab === "adjust" ? "Adjustments" : activeToolTab === "transform" ? "Transform & Crop" : "AI & Pro Tools"}
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
              Inspector
            </span>
          </div>

          {/* Inspector Tool Tabs */}
          <div className="p-3 border-b border-slate-800/60">
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                id="tab-adjust"
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
                id="tab-transform"
                onClick={() => setActiveToolTab("transform")}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeToolTab === "transform"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Transform
              </button>
              <button
                id="tab-ai-pro"
                onClick={() => setActiveToolTab("ai")}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeToolTab === "ai"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>AI & Pro</span>
                <span className="text-[8px] font-extrabold uppercase px-1 rounded bg-[#ff6b4a] text-white">PRO</span>
              </button>
            </div>
          </div>

          {/* Tool Section Content */}
          <div className="p-4 space-y-5 flex-1">
            {/* Tab 1: Adjust (Free) */}
            {activeToolTab === "adjust" && (
              <div className="space-y-4">
                {/* Brightness */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs items-center">
                    <label className="font-medium text-slate-300">Brightness</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { setBrightness(Math.max(50, brightness - 5)); markEdited(); }}
                        className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs text-slate-200 w-10 text-center">{brightness}%</span>
                      <button
                        onClick={() => { setBrightness(Math.min(150, brightness + 5)); markEdited(); }}
                        className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    type="range" min={50} max={150} value={brightness}
                    onChange={(e) => { setBrightness(Number(e.target.value)); markEdited(); }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs items-center">
                    <label className="font-medium text-slate-300">Contrast</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { setContrast(Math.max(50, contrast - 5)); markEdited(); }}
                        className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs text-slate-200 w-10 text-center">{contrast}%</span>
                      <button
                        onClick={() => { setContrast(Math.min(150, contrast + 5)); markEdited(); }}
                        className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    type="range" min={50} max={150} value={contrast}
                    onChange={(e) => { setContrast(Number(e.target.value)); markEdited(); }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
                  />
                </div>

                {/* Saturation */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs items-center">
                    <label className="font-medium text-slate-300">Saturation</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { setSaturation(Math.max(0, saturation - 5)); markEdited(); }}
                        className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs text-slate-200 w-10 text-center">{saturation}%</span>
                      <button
                        onClick={() => { setSaturation(Math.min(200, saturation + 5)); markEdited(); }}
                        className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    type="range" min={0} max={200} value={saturation}
                    onChange={(e) => { setSaturation(Number(e.target.value)); markEdited(); }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
                  />
                </div>

                {/* Quality */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                  <div className="flex justify-between text-xs items-center">
                    <label className="font-medium text-slate-300">Quality</label>
                    <span className="font-mono text-xs text-slate-200">{quality}%</span>
                  </div>
                  <input
                    type="range" min={1} max={100} value={quality}
                    onChange={(e) => { setQuality(Number(e.target.value)); markEdited(); }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
                  />
                </div>

                {/* Format */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                  <label className="font-medium text-slate-300 text-xs block">Target Format</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["auto", "webp", "png", "jpg", "avif"].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => { setFormat(fmt); markEdited(); }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                          format === fmt
                            ? "bg-[#ff6b4a] text-white shadow-md shadow-[#ff6b4a]/20"
                            : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                        }`}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Transform (Free) */}
            {activeToolTab === "transform" && (
              <div className="space-y-4">
                {/* Aspect Ratio Presets */}
                <div className="space-y-2">
                  <label className="font-medium text-slate-300 text-xs block">Aspect Ratio</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["1:1", "16:9", "4:3", "9:16", "Freeform"].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handleAspectRatioChange(preset)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                          aspectRatio === preset
                            ? "bg-[#ff6b4a] text-white shadow-md shadow-[#ff6b4a]/20"
                            : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Width & Height Inputs */}
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <span className="text-xs font-medium text-slate-300 block">Dimensions (px)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Width</span>
                      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 h-9">
                        <input
                          type="number" min={1} max={10000} value={width}
                          onChange={(e) => { setWidth(Number(e.target.value)); markEdited(); }}
                          className="w-full bg-transparent text-xs font-mono text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Height</span>
                      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 h-9">
                        <input
                          type="number" min={1} max={10000} value={height}
                          onChange={(e) => { setHeight(Number(e.target.value)); markEdited(); }}
                          className="w-full bg-transparent text-xs font-mono text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rotate Presets */}
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <label className="font-medium text-slate-300 text-xs block">Rotate</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 90, 180, 270].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => { setRotate(deg); markEdited(); }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                          rotate === deg
                            ? "bg-[#ff6b4a] text-white shadow-md shadow-[#ff6b4a]/20"
                            : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>

                {/* Crop Mode Select */}
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <label className="font-medium text-slate-300 text-xs block">Crop Mode</label>
                  <select
                    value={crop}
                    onChange={(e) => { setCrop(e.target.value); markEdited(); }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-[#ff6b4a]"
                  >
                    <option value="maintain_ratio">Maintain Ratio (default)</option>
                    <option value="force">Force Stretch</option>
                    <option value="at_max">At Max</option>
                    <option value="at_least">At Least</option>
                    <option value="extract">Extract Sub-region</option>
                    <option value="pad_resize">Pad & Resize</option>
                    <option value="crop_extract">Crop Extract</option>
                  </select>
                </div>
              </div>
            )}

            {/* Tab 3: AI & Pro (Pro Locked Features) */}
            {activeToolTab === "ai" && (
              <div className="space-y-4">
                {/* Background Removal Toggle */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">Background Removal</span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30">PRO</span>
                    </div>
                    <button
                      onClick={() => handleProInteraction("AI Background Removal", () => { setBgRemove(!bgRemove); markEdited(); })}
                      className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                        bgRemove ? "bg-[#ff6b4a] justify-end" : "bg-slate-800 justify-start"
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">Automatically isolate subject and remove image background.</p>
                </div>

                {/* Text Overlay */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Text Overlay</span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30">PRO</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter overlay text..."
                    value={textOverlay}
                    onFocus={() => { if (!isPro) handleProInteraction("Text Overlay", () => {}); }}
                    onChange={(e) => handleProInteraction("Text Overlay", () => { setTextOverlay(e.target.value); markEdited(); })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#ff6b4a]"
                  />
                </div>

                {/* Watermark Overlay */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Watermark Path</span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30">PRO</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Watermark path or label..."
                    value={watermark}
                    onFocus={() => { if (!isPro) handleProInteraction("Watermark Overlay", () => {}); }}
                    onChange={(e) => handleProInteraction("Watermark Overlay", () => { setWatermark(e.target.value); markEdited(); })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#ff6b4a]"
                  />
                </div>

                {/* Blur Slider */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">Blur Effect</span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30">PRO</span>
                    </div>
                    <span className="font-mono text-xs text-slate-400">{blur}px</span>
                  </div>
                  <input
                    type="range" min={0} max={100} value={blur}
                    onMouseDown={() => { if (!isPro) handleProInteraction("Blur Effect", () => {}); }}
                    onChange={(e) => handleProInteraction("Blur Effect", () => { setBlur(Number(e.target.value)); markEdited(); })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Preview Stage Pane (Dark Charcoal Canvas `#090d16`) */}
        <main className="flex-1 bg-[#090d16] flex flex-col items-center justify-center relative p-8 overflow-hidden group">
          {/* Grid background effect */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

          {/* Floating Stage Info Pill */}
          <div className="absolute top-6 left-6 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md text-xs font-medium text-slate-300 flex items-center gap-2.5 shadow-xl z-10">
            <span className="font-semibold text-slate-100">{family?.title || "Asset Preview"}</span>
            <span className="text-[10px] font-mono font-bold text-[#ff6b4a] bg-[#ff6b4a]/10 px-2 py-0.5 rounded border border-[#ff6b4a]/20">
              V{selectedVersion?.versionNumber || 1}
            </span>
          </div>

          {/* Media Canvas Area */}
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`,
            }}
            className="relative transition-all duration-200 ease-out max-w-full max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 flex items-center justify-center p-2"
          >
            {signedUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={signedUrl}
                alt="Preview Stage"
                style={{ transform: `rotate(${rotate}deg)` }}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
              />
            ) : (
              <div className="w-[620px] h-[350px] bg-gradient-to-tr from-slate-900 via-[#090d16] to-slate-900 rounded-xl flex flex-col items-center justify-center p-6 text-center space-y-3 border border-[#ff6b4a]/20 relative overflow-hidden">
                <div className="w-8 h-8 rounded-full border-2 border-[#ff6b4a] border-t-transparent animate-spin" />
                <span className="text-xs text-slate-400 font-mono">Rendering signed preview...</span>
              </div>
            )}

            {isLoadingPreview && signedUrl && (
              <div className="absolute top-3 right-3 px-2 py-1 bg-slate-900/80 rounded border border-slate-800 text-[10px] text-slate-300 font-mono backdrop-blur-md">
                Updating...
              </div>
            )}
          </div>

          {/* Floating Zoom Controls Bar */}
          <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-xl z-10">
            <button
              onClick={() => setZoomLevel((z) => Math.max(25, z - 25))}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg text-xs font-bold w-7 h-7 flex items-center justify-center cursor-pointer"
              title="Zoom Out"
            >
              -
            </button>
            <span className="text-xs font-mono font-bold text-slate-200 w-12 text-center">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg text-xs font-bold w-7 h-7 flex items-center justify-center cursor-pointer"
              title="Zoom In"
            >
              +
            </button>
            <div className="w-px h-4 bg-slate-800 mx-1" />
            <button
              onClick={() => setZoomLevel(100)}
              className="px-2.5 py-1 text-xs font-semibold text-[#ff6b4a] hover:bg-[#ff6b4a]/10 rounded-lg transition-colors cursor-pointer"
            >
              Reset Zoom
            </button>
          </div>
        </main>
      </div>

      {/* Bottom Version Timeline Pane (240px) */}
      <div className="h-[240px] border-t border-slate-800/90 bg-[#0d1322] p-4 shrink-0 flex flex-col justify-between overflow-x-auto z-20">
        {/* Timeline Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Version Timeline Track</h3>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
              {versions.length} {versions.length === 1 ? "Version" : "Versions"}
            </span>
          </div>
          <button
            onClick={handleCreateVersion}
            disabled={!hasUnsavedEdits || isCreatingVersion || !selectedVersion}
            id="create-version-btn"
            className={`px-4 py-2 rounded-xl text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 ${
              !hasUnsavedEdits || isCreatingVersion
                ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-60"
                : "bg-[#ff6b4a] hover:bg-[#e05637] cursor-pointer shadow-[#ff6b4a]/20"
            }`}
          >
            {isCreatingVersion ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Materializing...
              </span>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Create Version
              </>
            )}
          </button>
        </div>

        {/* Horizontal Version Track */}
        <div className="flex-1 flex items-center gap-4 px-4 overflow-x-auto py-2">
          {versions.map((ver, idx) => {
            const isSelected = selectedVersionId === ver._id;
            const isLatest = idx === versions.length - 1;
            return (
              <div key={ver._id} className="flex items-center shrink-0 gap-4">
                <button
                  onClick={() => setSelectedVersionId(ver._id)}
                  className={`flex flex-col items-start p-3 rounded-2xl border transition-all cursor-pointer w-48 text-left ${
                    isSelected
                      ? "bg-[#ff6b4a]/10 border-2 border-[#ff6b4a] shadow-lg shadow-[#ff6b4a]/10"
                      : "bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="w-full flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-slate-200">
                      V{ver.versionNumber}
                    </span>
                    {isLatest && (
                      <span className="text-[9px] font-bold text-[#ff6b4a] bg-[#ff6b4a]/20 px-1.5 py-0.5 rounded border border-[#ff6b4a]/30">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="w-full h-14 rounded-xl bg-slate-900/90 border border-slate-800/80 p-2 flex flex-col justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-200 line-clamp-1">
                      {ver.editLabel || `Version ${ver.versionNumber}`}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {ver.dimensions?.width}×{ver.dimensions?.height}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {formatTimeAgo(ver.createdAt)}
                  </span>
                </button>
                {idx < versions.length - 1 && (
                  <div className="w-8 h-0.5 bg-gradient-to-r from-slate-700 to-slate-500 shrink-0" />
                )}
              </div>
            );
          })}

          {/* Dashed "Draft" edit card when unsaved edits exist */}
          {hasUnsavedEdits && (
            <>
              <div className="w-8 h-0.5 border-t-2 border-dashed border-[#ff6b4a]/60 shrink-0" />
              <div className="flex flex-col items-start p-3 rounded-2xl border-2 border-dashed border-[#ff6b4a] bg-[#ff6b4a]/5 shrink-0 w-48 text-left">
                <div className="w-full flex items-center justify-between mb-1.5">
                  <span className="px-2 py-0.5 rounded bg-[#ff6b4a]/20 text-[10px] font-mono font-bold text-[#ff6b4a]">
                    Draft
                  </span>
                  <span className="text-[9px] font-semibold text-[#ff6b4a]">Unsaved</span>
                </div>
                <div className="w-full h-14 rounded-xl bg-slate-950/80 border border-[#ff6b4a]/30 p-2 flex flex-col justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#ff6b4a] line-clamp-1">
                    * {getEditLabel()}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {width}×{height}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#ff6b4a]">
                  Ready to materialize
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pro Entitlement Lock Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-[#ff6b4a]/40 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff6b4a]/20 border border-[#ff6b4a]/40 flex items-center justify-center text-[#ff6b4a]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>Pro Feature Locked</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#ff6b4a] text-white">PRO</span>
                </h3>
                <span className="text-xs text-slate-400">{upgradeFeatureName || "Advanced Feature"}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-slate-100">{upgradeFeatureName}</strong> requires a Pro or Ultra subscription tier. Upgrade your plan to access AI background removal, text & watermark overlays, blur effects, and pro exports.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Maybe Later
              </button>
              <Link
                href="/pricing"
                className="px-4 py-2 rounded-xl bg-[#ff6b4a] hover:bg-[#e05637] text-white font-bold text-xs shadow-lg shadow-[#ff6b4a]/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Export Asset Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#ff6b4a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Asset
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">Export Format</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["png", "jpg", "webp", "avif"].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={`py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                        format === fmt
                          ? "bg-[#ff6b4a] text-white"
                          : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs items-center">
                  <label className="font-medium text-slate-300">Quality</label>
                  <span className="font-mono text-slate-300">{quality}%</span>
                </div>
                <input
                  type="range" min={1} max={100} value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Output Resolution</span>
                <span className="font-mono text-[#ff6b4a] font-bold">{width} × {height} px</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-5 py-2 rounded-xl bg-[#ff6b4a] hover:bg-[#e05637] text-white font-bold text-xs shadow-lg shadow-[#ff6b4a]/20 transition-all cursor-pointer flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Download Image"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ImageEditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white bg-[#090d16] h-screen flex items-center justify-center font-sans text-xs">Loading Studio Editor...</div>}>
      <ImageEditorContent />
    </Suspense>
  );
}
