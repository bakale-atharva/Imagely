"use client";

import { useState } from "react";
import Link from "next/link";

export default function VideoEditorPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(15);
  const [playbackSpeed, setPlaybackSpeed] = useState("1x");
  const [isMuted, setIsMuted] = useState(false);
  const [activeInspectorTab, setActiveInspectorTab] = useState<"media" | "tools" | "subtitles">("media");
  const [activeMediaTab, setActiveMediaTab] = useState<"clips" | "audio" | "effects">("clips");
  const [audioGain, setAudioGain] = useState(100);

  const mediaClips = [
    { id: "clip-1", title: "Cinematic Intro.mp4", duration: "00:45", size: "18.4 MB" },
    { id: "clip-2", title: "Cyberpunk Drone.mp4", duration: "00:30", size: "12.1 MB" },
    { id: "clip-3", title: "Synthwave Audio Track.mp3", duration: "02:15", size: "5.6 MB" },
  ];

  return (
    <div id="video-editor-shell" className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      {/* 64px Top Navigation Workspace Bar */}
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
              <span>Neon City Teaser Promo.mp4</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#ff6b4a]/10 text-[#ff6b4a] border border-[#ff6b4a]/20">
                1080p 60fps
              </span>
            </h1>
            <span className="text-[11px] text-slate-400 font-mono">Timeline Duration: 01:30</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="video-add-media-btn"
            className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700/60 cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 text-[#ff6b4a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            + Import Media
          </button>
          <button
            id="video-export-btn"
            className="px-4 py-1.5 rounded-lg bg-[#ff6b4a] hover:bg-[#e05637] text-white text-xs font-bold shadow-lg shadow-[#ff6b4a]/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
            Render Video
          </button>
        </div>
      </div>

      {/* Main Workspace Body: Left Inspector + Center Viewport */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* LEFT INSPECTOR (320-360px Fixed Width) */}
        <aside
          id="video-editor-left-pane"
          className="w-[340px] border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex flex-col shrink-0 overflow-y-auto"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff6b4a]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {activeInspectorTab === "media" ? "Media Browser" : activeInspectorTab === "tools" ? "Trim & Transitions" : "Subtitles & Audio"}
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
              Inspector
            </span>
          </div>

          {/* Tab Selection */}
          <div className="p-3 border-b border-slate-800/60">
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveInspectorTab("media")}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeInspectorTab === "media"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Media
              </button>
              <button
                onClick={() => setActiveInspectorTab("tools")}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeInspectorTab === "tools"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Trim & Cut
              </button>
              <button
                onClick={() => setActiveInspectorTab("subtitles")}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeInspectorTab === "subtitles"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Subtitles
              </button>
            </div>
          </div>

          {/* Media Browser Tab Body */}
          {activeInspectorTab === "media" && (
            <div className="p-4 space-y-4">
              {/* Media Categories */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  id="video-media-tab-clips"
                  onClick={() => setActiveMediaTab("clips")}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeMediaTab === "clips"
                      ? "bg-slate-800 text-slate-200"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Clips
                </button>
                <button
                  id="video-media-tab-audio"
                  onClick={() => setActiveMediaTab("audio")}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeMediaTab === "audio"
                      ? "bg-slate-800 text-slate-200"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Audio
                </button>
                <button
                  id="video-media-tab-fx"
                  onClick={() => setActiveMediaTab("effects")}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeMediaTab === "effects"
                      ? "bg-slate-800 text-slate-200"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Effects
                </button>
              </div>

              {/* Media Items List */}
              <div className="space-y-2">
                {mediaClips.map((clip) => (
                  <div
                    key={clip.id}
                    id={`video-media-item-${clip.id}`}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-[#ff6b4a]/40 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#ff6b4a]/10 border border-[#ff6b4a]/20 flex items-center justify-center text-[#ff6b4a]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200 truncate max-w-[130px]">{clip.title}</span>
                        <span className="text-[10px] font-mono text-slate-500">{clip.duration} • {clip.size}</span>
                      </div>
                    </div>

                    <button
                      id={`video-add-to-timeline-${clip.id}`}
                      className="px-2.5 py-1 bg-[#ff6b4a]/20 hover:bg-[#ff6b4a] text-[#ff6b4a] hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer border border-[#ff6b4a]/30"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tools & Controls Panel */}
          <div id="video-editor-right-pane" className="p-4 space-y-4">
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/90 space-y-2">
                <span className="text-xs font-bold text-slate-200 block">Trim & Cut Controls</span>
                <div className="flex gap-2">
                  <button id="video-trim-start-btn" className="flex-1 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-xs text-slate-300 font-medium cursor-pointer">Split Left</button>
                  <button id="video-trim-end-btn" className="flex-1 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-xs text-slate-300 font-medium cursor-pointer">Split Right</button>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/90 space-y-2">
                <span className="text-xs font-bold text-slate-200 block">Transition Style</span>
                <select id="video-transition-select" className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#ff6b4a]">
                  <option value="fade">Cross Dissolve Fade</option>
                  <option value="wipe">Linear Wipe</option>
                  <option value="zoom">Smart Zoom Blur</option>
                </select>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/90 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">Audio Gain Boost</span>
                  <span className="font-mono text-slate-400">{audioGain}%</span>
                </div>
                <input
                  id="video-audio-gain-slider"
                  type="range"
                  min="0"
                  max="200"
                  value={audioGain}
                  onChange={(e) => setAudioGain(Number(e.target.value))}
                  className="w-full accent-[#ff6b4a] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* CENTRAL PREVIEW STAGE */}
        <main
          id="video-editor-center-pane"
          className="flex-1 bg-[#090d16] flex flex-col justify-between p-6 relative overflow-hidden"
        >
          {/* Main Video Viewport Stage */}
          <div className="flex-1 flex items-center justify-center relative">
            <div
              id="video-canvas-viewport"
              className="w-full max-w-3xl aspect-video bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group"
            >
              {/* Playhead Time Badge inside Viewport */}
              <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs font-mono text-slate-300 backdrop-blur-md">
                00:{currentTime < 10 ? `0${currentTime}` : currentTime} / 01:30
              </div>

              {/* Viewport Play Glow */}
              {isPlaying && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b4a]/10 via-purple-500/10 to-indigo-500/10 animate-pulse pointer-events-none" />
              )}

              <div className="w-20 h-20 rounded-full bg-[#ff6b4a]/15 border border-[#ff6b4a]/30 flex items-center justify-center text-[#ff6b4a] mb-3 shadow-lg shadow-[#ff6b4a]/10">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-200">Video Canvas Viewport</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">Status: {isPlaying ? "Playing..." : "Paused"}</p>
            </div>
          </div>

          {/* Timeline & Playback Control Bar */}
          <div
            id="video-playback-controls"
            className="w-full bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-4 space-y-3 mt-4"
          >
            {/* Seekbar Slider */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">00:{currentTime < 10 ? `0${currentTime}` : currentTime}</span>
              <input
                id="video-seekbar"
                type="range"
                min="0"
                max="90"
                value={currentTime}
                onChange={(e) => setCurrentTime(Number(e.target.value))}
                className="flex-1 accent-[#ff6b4a] cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-400">01:30</span>
            </div>

            {/* Playback Action Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  id="video-play-btn"
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

                <button
                  id="video-volume-btn"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  {isMuted ? (
                    <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <select
                  id="video-speed-select"
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#ff6b4a]"
                >
                  <option value="0.5x">0.5x</option>
                  <option value="1x">1.0x</option>
                  <option value="1.5x">1.5x</option>
                  <option value="2x">2.0x</option>
                </select>

                <button
                  id="video-fullscreen-btn"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* BOTTOM TIMELINE TRACK (220-280px High, Multi-Track with Playhead Cursor & Ruler) */}
      <div className="h-[260px] border-t border-slate-800/90 bg-slate-900/70 backdrop-blur-md p-4 shrink-0 flex flex-col relative overflow-hidden">
        {/* Time Ruler */}
        <div className="h-6 flex items-center justify-between px-24 border-b border-slate-800/80 text-[10px] font-mono text-slate-500 shrink-0">
          <span>00:00</span>
          <span>00:15</span>
          <span>00:30</span>
          <span>00:45</span>
          <span>01:00</span>
          <span>01:15</span>
          <span>01:30</span>
        </div>

        {/* Multi-Track Container */}
        <div className="flex-1 flex flex-col gap-2 pt-3 overflow-y-auto relative">
          {/* Red/Coral Playhead Line & Handle */}
          <div
            style={{ left: `${(currentTime / 90) * 80 + 10}%` }}
            className="absolute top-0 bottom-0 w-0.5 bg-[#ff6b4a] z-20 pointer-events-none transition-all duration-150"
          >
            <div className="w-3 h-3 bg-[#ff6b4a] rounded-full -translate-x-[5px] -translate-y-1 shadow-md shadow-[#ff6b4a]/40" />
          </div>

          {/* TRACK 1: Video Clip Track (Indigo Layer Cards) */}
          <div className="h-14 bg-slate-950/80 rounded-xl border border-slate-800/80 p-2 flex items-center gap-3 relative">
            <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 w-16 shrink-0">Video Track</span>
            <div className="flex-1 flex gap-2 overflow-x-auto h-full">
              <div className="h-full bg-indigo-950/70 border border-indigo-500/40 rounded-lg px-3 flex items-center gap-2 text-xs text-indigo-200 shrink-0 w-64 shadow-sm">
                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="truncate font-semibold">Cinematic Intro.mp4 (00:45)</span>
              </div>
              <div className="h-full bg-indigo-950/70 border border-indigo-500/40 rounded-lg px-3 flex items-center gap-2 text-xs text-indigo-200 shrink-0 w-48 shadow-sm">
                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="truncate font-semibold">Cyberpunk Drone.mp4 (00:30)</span>
              </div>
            </div>
          </div>

          {/* TRACK 2: Audio Track (Purple Waveform Track) */}
          <div className="h-12 bg-slate-950/80 rounded-xl border border-slate-800/80 p-2 flex items-center gap-3 relative">
            <span className="text-[10px] font-mono font-bold uppercase text-purple-400 w-16 shrink-0">Audio Track</span>
            <div className="flex-1 flex items-center h-full bg-purple-950/60 border border-purple-500/40 rounded-lg px-3 gap-1.5 text-xs text-purple-200 overflow-hidden">
              <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <span className="font-semibold text-xs text-purple-200 shrink-0 mr-3">Synthwave Track.mp3</span>
              {/* Waveform Visualization Bars */}
              <div className="flex-1 flex items-center gap-0.5 h-5 opacity-60">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    style={{ height: `${(i % 5 + 1) * 20}%` }}
                    className="w-1 bg-purple-400 rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* TRACK 3: Overlay / Subtitle Track (Teal Layer Track) */}
          <div className="h-10 bg-slate-950/80 rounded-xl border border-slate-800/80 p-2 flex items-center gap-3 relative">
            <span className="text-[10px] font-mono font-bold uppercase text-teal-400 w-16 shrink-0">Subtitles</span>
            <div className="flex-1 flex gap-3 h-full items-center">
              <div className="h-full bg-teal-950/60 border border-teal-500/40 rounded-lg px-3 flex items-center text-xs text-teal-200 w-52 shrink-0">
                <span className="truncate text-[11px] font-mono font-medium">&quot;Welcome to Neon City&quot;</span>
              </div>
              <div className="h-full bg-teal-950/60 border border-teal-500/40 rounded-lg px-3 flex items-center text-xs text-teal-200 w-44 shrink-0">
                <span className="truncate text-[11px] font-mono font-medium">&quot;Cyberpunk 2026 Promo&quot;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

