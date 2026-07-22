# Imagely: AI Image & Video Studio MVP

## Summary

Build a B2C, per-user media studio using Clerk for authentication/billing, ImageKit for private media storage, transformations, responsive delivery, and file-version history, and Convex for owned project/version metadata.

## Phase 0 — Configure external services

- Enable Clerk Billing for User Plans: `free`, `pro`, `ultra`; attach feature entitlements rather than coding plan-name checks.
- Configure ImageKit signed delivery URLs and private-file uploads. Use user folders: `/users/{clerkUserId}/images/` and `/users/{clerkUserId}/videos/`.
- Configure paid pricing/currency in Clerk before production checkout; use the Clerk development gateway beforehand.

**Subagents:** Clerk/Billing agent validates plan/feature configuration; ImageKit agent validates private upload, signed URL, and transformation settings.

## Phase 1 — Studio shell and owned data

- Replace the starter app with protected gallery, image editor, video editor, pricing, and account routes.
- Protect workspace routes plus upload, preview, export, and version endpoints with Clerk.
- Replace the sample Convex model with:
  - `assetFamilies`: owner, ImageKit path/file identity, media kind, title, and current version.
  - `assetVersions`: family, parent version, sequential version number, ImageKit file/version identity, immutable recipe, dimensions, timestamps, and edit label.
- Derive ownership from authenticated server identity only. Validate normalized, allow-listed transformation recipes; never persist browser-supplied raw transformation strings.

**Subagents:** Convex agent implements schema/ownership/pagination; auth agent validates Clerk route/session enforcement.

## Phase 2 — Private upload and gallery

- Add separate image and video upload actions. An authenticated server route creates short-lived ImageKit upload credentials, fixes the user folder, enforces MIME/size limits, and marks media private.
- Upload through the ImageKit SDK with progress, cancellation, and failure UI. Each first upload becomes **V1** of a new asset family and opens the matching editor.
- Build a paginated gallery filtered to the signed-in user’s ImageKit workspace. Show one card per asset family, its latest-version thumbnail, media type, and `V{n}` badge.
- Generate signed thumbnail/original/export URLs on the server; never expose ImageKit private credentials.

**Subagents:** Media agent implements upload/auth/listing adapter; UI agent implements gallery/upload interactions.

## Phase 2.5 — ImageKit-backed versioning and responsive delivery

- Drafting an edit changes only the preview. Clicking **Create version** materializes the selected transformation as the next immutable ImageKit file version: V1 → V2 → V3.
- Create the new ImageKit version by writing to the same protected filename and folder, with unique filenames disabled; record the returned version identity and parent version in Convex.
- Allow editing any selected historical version. The resulting new version is appended to ImageKit history and records that selected version as its parent in Convex.
- Add a version browser when an asset is selected:
  - chronological thumbnail rail/timeline from V1 to current;
  - version number, label, timestamp, active/current markers;
  - select, compare with parent, download, or use a version as the source for the next edit.
- Never use a full original in gallery or normal editor preview:
  - Build signed ImageKit `srcset` candidates for gallery cards: `240, 320, 480, 640, 960` widths with matching `sizes`.
  - For the editor canvas, choose the nearest width based on rendered container width × device pixel ratio, capped by the selected version’s dimensions.
  - Use ImageKit automatic quality and modern-format delivery, lazy loading, and responsive `sizes`; raw-original download remains a separate authenticated action.
  - Apply the same responsive-thumbnail policy to video cards.

**Subagents:** Versioning agent implements ImageKit materialization/history adapter; delivery agent implements signed responsive source-set generation and tests screen-size selection.

## Phase 3 — Non-destructive image and video editors

- Build a three-pane editor: asset/version navigation, live responsive preview, and feature tools.
- Image tools:
  - Free: resize, crop, rotate, quality, format.
  - Pro: background removal/transparency, effects, text/image/solid-color overlays.
- Video tools:
  - Free: resize, crop, trim, mute, quality/format, thumbnail.
  - Pro: advanced transforms and overlays.
  - Ultra: audio extraction and existing subtitle-file overlays/styling.
- Generate preview/export URLs only after server-side ownership and entitlement checks. Show a processing state for first-time video transforms.
- Exclude generated subtitles/transcription from v1; ImageKit subtitle overlays require an existing subtitle asset.

**Subagents:** Image-editor agent implements recipes/controls; video-editor agent implements video controls/processing states; primary agent integrates shared editor/version UX.

## Phase 4 — Billing gates

- Add a Clerk `<PricingTable />` and Clerk account-management UI.
- Configure feature slugs: `basic_editor`, `image_ai`, `advanced_image`, `advanced_video`, `audio_extraction`, `subtitle_overlay`.
- Attach basic editing to Free; image AI/advanced image/advanced video to Pro and Ultra; audio extraction/subtitle overlay to Ultra.
- Use client-side `has()` only for locked-state UI. Repeat entitlement checks in all server preview/export/version-creation operations.

**Subagents:** Billing UI agent implements pricing/upgrade states; authorization agent implements reusable server guard and tests.

## Phase 5 — Verification and release readiness

- Test anonymous access rejection, user-to-user isolation, invalid uploads, cancellation, recipe validation, save/reload, version creation/history navigation, and signed URL expiry/tampering.
- Test gallery/editor responsive images across grid breakpoints and DPRs; confirm normal views never download originals.
- Test every Free/Pro/Ultra boundary in both UI and server responses.
- Run TypeScript, lint, Convex code generation, production build, and authenticated browser smoke tests.
- Before production: verify Clerk prices/payment gateway, ImageKit signed URL restrictions, private file behavior, environment variables, and ImageKit version-limit handling.

## Assumptions

- Individual users own private workspaces; organizations, collaboration, quotas, and destructive overwrites are out of scope.
- ImageKit owns binary media and durable file versions; Convex owns application metadata, recipes, parent relationships, and version-navigation state.
- Each family supports ImageKit’s maximum version count; the UI prevents creating another version once that limit is reached.
