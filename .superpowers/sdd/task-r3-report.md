# Task R3 Report: Rebrand 3-Region Image & Video Editors

## Status: DONE

### Summary of Changes

#### 1. Image Editor (`app/editor/image/page.tsx`)
- **3-Region Composition**:
  - **Left Inspector (340px)**:
    - Added dynamic tool title header reflecting the active tool section ("Adjustments", "Transform & Crop", "AI Magic Tools").
    - Tool selection tabs (`image-tool-tab-adjust`, `image-tool-tab-[#ff6b4a]`, `image-tool-tab-crop`).
    - Compact dark controls with steppers and dividers.
    - Chronological version history strip with version cards (`image-version-v1`, `image-version-v2`, `image-version-v3`).
    - Selected version has coral outline (`border-2 border-[#ff6b4a]`).
    - Persistent "Current" badge on active ImageKit version.
    - Unsaved draft edit segment with dashed border (`border-2 border-dashed border-[#ff6b4a]/50`).
    - Single coral primary CTA button: **"Create version"** (`bg-[#ff6b4a] hover:bg-[#e05637] text-white`).
  - **Central Preview Stage**:
    - Deep charcoal background (`bg-[#090d16]`).
    - Centred image canvas surface (`id="image-canvas-surface"`).
    - Top canvas filename & version badge (`id="canvas-filename-label"`).
    - Zoom/reset controls (`id="canvas-zoom-in"`, `id="canvas-zoom-out"`, `id="canvas-reset"`, `id="image-canvas-controls"`).
  - **Bottom Timeline (240px high)**:
    - Horizontally scrollable version timeline track with lineage connectors linking `V1` -> `V2` -> `V3` -> `Draft`.
- Retained all existing interactive `id` attributes.

#### 2. Video Editor (`app/editor/video/page.tsx`)
- **3-Region Composition**:
  - **Left Inspector (340px)**:
    - Tool & Media browser tabs ("Media", "Trim & Cut", "Subtitles").
    - Asset picker items (`video-media-item-clip-1`, `video-media-item-clip-2`, `video-media-item-clip-3`) with "+ Add" buttons (`video-add-to-timeline-*`).
    - Compact tool controls (`video-trim-start-btn`, `video-trim-end-btn`, `video-transition-select`, `video-audio-gain-slider`).
  - **Central Preview Stage**:
    - Deep charcoal viewport (`bg-[#090d16]`).
    - Viewport playhead time display badge (`00:15 / 01:30`).
    - Play/pause toggle (`id="video-play-btn"`), mute toggle (`id="video-volume-btn"`), speed selector (`id="video-speed-select"`), seekbar (`id="video-seekbar"`), fullscreen toggle (`id="video-fullscreen-btn"`).
  - **Bottom Timeline (260px high)**:
    - Time ruler (`00:00`, `00:15`, `00:30`, `00:45`, `01:00`, `01:15`, `01:30`).
    - Vertical red/coral playhead cursor (`bg-[#ff6b4a]`) with top scrub handle.
    - Multi-track layout:
      1. Indigo video clip layer track.
      2. Purple audio waveform track with animated audio bars.
      3. Teal subtitle overlay track.
- Retained all existing interactive `id` attributes.

### Verification
- `npx tsc --noEmit` executed cleanly with 0 type errors.
