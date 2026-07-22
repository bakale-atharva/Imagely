# Task R3 Brief: Rebrand 3-Region Image & Video Editors

## Objectives
Rebrand `app/editor/image/page.tsx` and `app/editor/video/page.tsx` strictly following the 3-region workspace composition in `DESIGN.md`.

## Specifications from `DESIGN.md`

### 1. Image Editor (`app/editor/image/page.tsx`)
- **3-Region Workspace below 64px top bar**:
  1. **Left Inspector (320-360px fixed width)**:
     - Header reflecting selected tool ("Transform", "Background", "Text Overlay", "Adjustments").
     - Version history chronological strip: thumbnails, `Vn`, timestamp, current/selected state.
     - Selected version: coral outlined (`border-2 border-orange-500`). Persistent "Current" label on current ImageKit version.
     - Draft edit state: unsaved dashed "New version" segment (`border-dashed border-orange-500/50`).
     - **Create Version**: single **coral primary action button** (`bg-orange-500 hover:bg-orange-600 text-white`).
     - Compact dark inputs (32-40px height) with concise labels, paired dimensions, steppers, and dividers/chevrons instead of nested cards.
  2. **Preview Stage (Center)**:
     - Deep charcoal background (`bg-slate-950`).
     - Centred media canvas visibly distinct from stage, preserving aspect ratio.
     - Filename & version label at top of canvas (`id="canvas-filename-label"`).
     - Zoom/view controls at bottom right (`id="canvas-zoom-in"`, `id="canvas-zoom-out"`, `id="canvas-reset"`).
  3. **Bottom Timeline (220-280px high, horizontally scrollable)**:
     - Always visible version-aware timeline track.
     - Chronological version nodes (`V1`, `V2`, `V3`) with parent relationship connectors.

### 2. Video Editor (`app/editor/video/page.tsx`)
- **3-Region Workspace below 64px top bar**:
  1. **Left Inspector (320-360px fixed width)**:
     - Media browser & asset picker.
     - Tool tabs ("Trim & Cut", "Transitions", "Subtitles", "Audio Extraction").
     - Compact controls, dividers, steppers.
  2. **Preview Stage (Center)**:
     - Deep charcoal background viewport.
     - Playhead time display (`00:00 / 02:30`).
     - Play/Pause toggle (`id="video-play-btn"`), Mute toggle (`id="video-volume-btn"`), Speed selector (`id="video-speed-select"`).
  3. **Bottom Timeline (220-280px high, horizontally scrollable)**:
     - Time ruler (`00:00`, `00:15`, `00:30`, ...).
     - Fixed red/coral playhead cursor with draggable scrub handle.
     - **Multi-track layout**:
       - Video Clip Track (indigo/blue layer cards with thumbnails).
       - Audio Track (purple/violet audio waveform track).
       - Overlay / Subtitle Track (teal/emerald overlay track).
     - Timeline zoom slider & playback controls.
