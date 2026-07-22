import { v } from "convex/values";
import { validateRecipe } from "../lib/recipe";
import { mutation, query } from "./_generated/server";

export const listAssetVersions = query({
  args: {
    familyId: v.id("assetFamilies"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const family = await ctx.db.get(args.familyId);
    if (!family || family.ownerTokenIdentifier !== identity.tokenIdentifier) {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("assetVersions")
      .withIndex("by_family", (q) => q.eq("familyId", args.familyId))
      .order("asc")
      .collect();
  },
});

export const createAssetVersion = mutation({
  args: {
    familyId: v.id("assetFamilies"),
    parentVersionId: v.optional(v.id("assetVersions")),
    imageKitFileId: v.string(),
    imageKitVersionId: v.optional(v.string()),
    imageKitPath: v.string(),
    recipe: v.any(),
    dimensions: v.object({ width: v.number(), height: v.number() }),
    editLabel: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const family = await ctx.db.get(args.familyId);
    if (!family || family.ownerTokenIdentifier !== identity.tokenIdentifier) {
      throw new Error("Unauthorized");
    }

    const validation = validateRecipe(args.recipe);
    if (!validation.valid) {
      throw new Error("Invalid recipe: " + validation.errors.join(", "));
    }

    const nextVersionNumber = family.currentVersionNumber + 1;

    const versionId = await ctx.db.insert("assetVersions", {
      familyId: args.familyId,
      parentVersionId: args.parentVersionId,
      versionNumber: nextVersionNumber,
      imageKitFileId: args.imageKitFileId,
      imageKitVersionId: args.imageKitVersionId,
      imageKitPath: args.imageKitPath,
      recipe: validation.normalizedRecipe ?? args.recipe,
      dimensions: args.dimensions,
      editLabel: args.editLabel,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.familyId, {
      currentVersionNumber: nextVersionNumber,
    });

    return versionId;
  },
});
