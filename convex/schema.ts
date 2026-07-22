import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  assetFamilies: defineTable({
    ownerTokenIdentifier: v.string(),
    imageKitPath: v.string(),
    imageKitFileId: v.string(),
    mediaKind: v.union(v.literal("image"), v.literal("video")),
    title: v.string(),
    currentVersionNumber: v.number(),
  })
    .index("by_owner", ["ownerTokenIdentifier"])
    .index("by_owner_and_mediaKind", ["ownerTokenIdentifier", "mediaKind"]),

  assetVersions: defineTable({
    familyId: v.id("assetFamilies"),
    parentVersionId: v.optional(v.id("assetVersions")),
    versionNumber: v.number(),
    imageKitFileId: v.string(),
    imageKitVersionId: v.optional(v.string()),
    imageKitPath: v.string(),
    recipe: v.any(),
    dimensions: v.object({ width: v.number(), height: v.number() }),
    editLabel: v.string(),
    createdAt: v.number(),
  })
    .index("by_family", ["familyId"])
    .index("by_family_and_version", ["familyId", "versionNumber"]),
});
