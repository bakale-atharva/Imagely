# Imagely Visual Design Direction

## Reference intent

Imagely should feel like a focused professional creative studio: dark, compact,
tool-first, and cinematic. The supplied reference establishes the interaction
model, not a visual copy: a restrained dark chrome, a persistent top workspace
bar, an inspector beside a large media preview, and a timeline/version area
that keeps editing context visible.

## Visual language

- Use the existing Geist sans typeface with a near-black canvas (`slate-950`),
  slightly lighter panels, low-contrast borders, and soft elevation rather
  than large rounded cards.
- Accent color: a warm coral/orange for the active tool, selected timeline
  segment, primary action, and focused controls. Indigo/purple is reserved for
  timeline tracks and audio/video-specific layers; do not use it as the global
  brand accent.
- Use 12-16px panel spacing, 8px control spacing, compact 32-40px controls,
  muted secondary labels, and clear white primary values. Icons precede short
  labels in the main navigation.
- Treat the media itself as the visual hero. Tool surfaces must recede and
  never compete with the preview.

## Application layout

### Global shell

- A 64px top navigation bar contains the Imagely mark, Gallery, Uploads,
  Image editor, Video editor, Versions, Export, plan/upgrade status, and the
  Clerk user menu.
- The active destination has coral text/icon treatment and a thin coral
  underline. Inactive destinations remain muted grey.
- The shell is full-height on desktop; the editor uses the viewport rather
  than a scrolling page wherever practical.

### Gallery

- Use a dark masonry-like responsive grid with asset-family cards, not a white
  dashboard. Each card shows a responsive ImageKit thumbnail, media-type icon,
  title, current-version badge (`V3`), and a subtle hover action for opening
  the editor.
- Selecting a card opens the matching editor. Filters, search, media type, and
  an Upload button sit above the grid; keep controls compact and left aligned.
- Thumbnails must use the ImageKit signed responsive `srcset` ladder described
  in `PLAN.md`; the card never loads an original asset.

### Editor desktop composition

- Use a three-region workspace below the top bar:
  1. **Left inspector**: 320-360px fixed-width tools, version browser, grouped
     controls, and collapsible sections.
  2. **Preview stage**: flexible central area with a centred media canvas,
     media filename/version label, playback controls for video, and zoom/view
     controls.
  3. **Bottom timeline**: 220-280px high, horizontally scrollable; always
     visible for video and version-aware image editing.
- The inspector title reflects the selected tool, for example "Transform",
  "Background", "Text overlay", or "Audio". Sections use dividers and
  chevrons rather than nested cards.
- Inputs are dark filled fields with concise labels; paired dimensions,
  alignment icons, toggles, and steppers mirror the dense inspector treatment
  in the reference.
- The preview stage has a deep charcoal background. Image/video bounds are
  visibly distinct from the stage and preserve the original aspect ratio.
- Generate the preview at the rendered canvas width multiplied by device pixel
  ratio, capped at the selected version's dimensions. Changing zoom requests a
  larger appropriate rendition only when necessary.

### Version and timeline interaction

- Show version history as a chronological strip in the left inspector and as
  a visual track in the bottom timeline. Each entry shows thumbnail, `Vn`,
  timestamp, and current/selected state.
- The selected version is coral outlined; the current ImageKit version has a
  persistent "Current" label. Hover reveals compare, download, and "Edit from
  this version" actions.
- Draft edits display as an unsaved, dashed "New version" segment. **Create
  version** is the single coral primary action and turns that draft into the
  next immutable ImageKit version.
- In video mode, use image thumbnails for clips/versions and separate colored
  tracks for overlays, subtitles, and audio. A fixed playhead, time ruler,
  playback controls, and zoom controls make temporal edits understandable.

## Responsive behavior and states

- At widths below 1024px, collapse the inspector into a slide-over and retain
  the preview and timeline. At widths below 768px, use a bottom sheet for tool
  controls, stack version information beneath the preview, and hide low-value
  labels while retaining icons and accessible names.
- Use skeleton tiles for gallery loading and a dimmed preview with an inline
  processing status for ImageKit video transforms.
- Locked Pro/Ultra tools remain visible with a lock icon and plan label. Their
  click target opens the upgrade flow; no locked-state preview is rendered.
- Errors appear inline at the affected control or upload item. Avoid modal
  alerts except for destructive actions such as deleting a version.

## Accessibility and implementation constraints

- Maintain visible keyboard focus, semantic buttons, labelled icon controls,
  keyboard-accessible timeline/version selection, and sufficient contrast for
  muted text.
- Respect reduced-motion preferences; use short opacity/color transitions only.
- Do not embed ImageKit originals as CSS backgrounds or raw `<img>` sources.
  All gallery, version, and preview imagery uses signed, responsive ImageKit
  URLs; original download remains an explicit authenticated action.
- Keep Clerk billing/profile surfaces functionally intact; style surrounding
  Imagely pages rather than attempting to reproduce Clerk checkout UI.
