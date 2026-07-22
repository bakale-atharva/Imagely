# Task 1 Brief: Convex Schema & Owned Data API

## Objectives
1. Update `convex/schema.ts` to replace sample schema with `assetFamilies` and `assetVersions` tables.
2. Implement backend queries and mutations in `convex/assetFamilies.ts` and `convex/assetVersions.ts` with strict ownership checks via `ctx.auth.getUserIdentity()`.
3. Integrate `validateRecipe` from `lib/imagekit.ts` to validate all persisted recipes on version creation.

## Detailed Requirements

### 1. `convex/schema.ts`
Define schema with `defineSchema` and `defineTable` from `convex/server`:
- `assetFamilies`:
  - `ownerTokenIdentifier`: `v.string()`
  - `imageKitPath`: `v.string()`
  - `imageKitFileId`: `v.string()`
  - `mediaKind`: `v.union(v.literal("image"), v.literal("video"))`
  - `title`: `v.string()`
  - `currentVersionNumber`: `v.number()`
  - Indexes:
    - `.index("by_owner", ["ownerTokenIdentifier"])`
    - `.index("by_owner_and_mediaKind", ["ownerTokenIdentifier", "mediaKind"])`
- `assetVersions`:
  - `familyId`: `v.id("assetFamilies")`
  - `parentVersionId`: `v.optional(v.id("assetVersions"))`
  - `versionNumber`: `v.number()`
  - `imageKitFileId`: `v.string()`
  - `imageKitVersionId`: `v.optional(v.string())`
  - `imageKitPath`: `v.string()`
  - `recipe`: `v.any()`
  - `dimensions`: `v.object({ width: v.number(), height: v.number() })`
  - `editLabel`: `v.string()`
  - `createdAt`: `v.number()`
  - Indexes:
    - `.index("by_family", ["familyId"])`
    - `.index("by_family_and_version", ["familyId", "versionNumber"])`

### 2. `convex/assetFamilies.ts`
Implement:
- `listPaginatedAssetFamilies`: `query` with `args: { paginationOpts: paginationOptsValidator, mediaKind: v.optional(v.union(v.literal("image"), v.literal("video"))) }`.
  - Check `ctx.auth.getUserIdentity()`. If unauthenticated, return empty pagination page (`{ page: [], isDone: true, continueCursor: "" }`).
  - Query `assetFamilies` using index `by_owner` (or `by_owner_and_mediaKind` if `mediaKind` provided) matching `ownerTokenIdentifier == identity.tokenIdentifier`.
  - Return `paginate(args.paginationOpts)`.
- `getAssetFamily`: `query` with `args: { familyId: v.id("assetFamilies") }`.
  - Check `ctx.auth.getUserIdentity()`.
  - Fetch `family = await ctx.db.get(args.familyId)`.
  - Verify `family && family.ownerTokenIdentifier === identity.tokenIdentifier`. Return `family` or `null`.
- `createAssetFamilyWithV1`: `mutation` with args for initial family and V1 version:
  - `args`: `{ title: v.string(), mediaKind: v.union(v.literal("image"), v.literal("video")), imageKitPath: v.string(), imageKitFileId: v.string(), dimensions: v.object({ width: v.number(), height: v.number() }), editLabel: v.string(), recipe: v.any() }`
  - Check `identity = await ctx.auth.getUserIdentity()`. Throw `"Unauthenticated"` if null.
  - Validate recipe: `const validation = validateRecipe(args.recipe); if (!validation.valid) throw new Error("Invalid recipe: " + validation.errors.join(", "));`
  - Insert family document with `ownerTokenIdentifier: identity.tokenIdentifier`, `currentVersionNumber: 1`.
  - Insert `assetVersions` document with `familyId`, `versionNumber: 1`, `parentVersionId: undefined`, `imageKitFileId: args.imageKitFileId`, `imageKitPath: args.imageKitPath`, `recipe: validation.normalizedRecipe ?? args.recipe`, `dimensions: args.dimensions`, `editLabel: args.editLabel`, `createdAt: Date.now()`.
  - Return `{ familyId, versionId }`.

### 3. `convex/assetVersions.ts`
Implement:
- `listAssetVersions`: `query` with `args: { familyId: v.id("assetFamilies") }`.
  - Check `identity = await ctx.auth.getUserIdentity()`.
  - Verify family ownership (`family = await ctx.db.get(args.familyId)`). Throw if unauthorized.
  - Return all versions matching `by_family` index ordered by `versionNumber` ascending (`order("asc")`).
- `createAssetVersion`: `mutation` with args:
  - `args`: `{ familyId: v.id("assetFamilies"), parentVersionId: v.optional(v.id("assetVersions")), imageKitFileId: v.string(), imageKitVersionId: v.optional(v.string()), imageKitPath: v.string(), recipe: v.any(), dimensions: v.object({ width: v.number(), height: v.number() }), editLabel: v.string() }`
  - Authenticate identity. Throw if null.
  - Verify family exists and `family.ownerTokenIdentifier === identity.tokenIdentifier`. Throw if unauthorized.
  - Validate recipe via `validateRecipe(args.recipe)`. Throw if invalid.
  - Compute `nextVersionNumber = family.currentVersionNumber + 1`.
  - Insert version record with `versionNumber: nextVersionNumber`, `createdAt: Date.now()`.
  - Patch family record with `currentVersionNumber: nextVersionNumber`.
  - Return `versionId`.

## Guidelines Compliance
- Always follow `convex/_generated/ai/guidelines.md`.
- Never trust client-supplied owner IDs; use `ctx.auth.getUserIdentity()`.
