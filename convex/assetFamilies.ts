import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { validateRecipe } from "../lib/recipe";
import { mutation, query } from "./_generated/server";

export const listPaginatedAssetFamilies = query({
  args: {
    paginationOpts: paginationOptsValidator,
    mediaKind: v.optional(v.union(v.literal("image"), v.literal("video"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    if (args.mediaKind) {
      return await ctx.db
        .query("assetFamilies")
        .withIndex("by_owner_and_mediaKind", (q) =>
          q
            .eq("ownerTokenIdentifier", identity.tokenIdentifier)
            .eq("mediaKind", args.mediaKind!)
        )
        .order("desc")
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("assetFamilies")
      .withIndex("by_owner", (q) =>
        q.eq("ownerTokenIdentifier", identity.tokenIdentifier)
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getAssetFamily = query({
  args: {
    familyId: v.id("assetFamilies"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const family = await ctx.db.get(args.familyId);
    if (!family || family.ownerTokenIdentifier !== identity.tokenIdentifier) {
      return null;
    }

    return family;
  },
});

export const createAssetFamilyWithV1 = mutation({
  args: {
    title: v.string(),
    mediaKind: v.union(v.literal("image"), v.literal("video")),
    imageKitPath: v.string(),
    imageKitFileId: v.string(),
    dimensions: v.object({ width: v.number(), height: v.number() }),
    editLabel: v.string(),
    recipe: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const validation = validateRecipe(args.recipe);
    if (!validation.valid) {
      throw new Error("Invalid recipe: " + validation.errors.join(", "));
    }

    const familyId = await ctx.db.insert("assetFamilies", {
      ownerTokenIdentifier: identity.tokenIdentifier,
      imageKitPath: args.imageKitPath,
      imageKitFileId: args.imageKitFileId,
      mediaKind: args.mediaKind,
      title: args.title,
      currentVersionNumber: 1,
    });

    const versionId = await ctx.db.insert("assetVersions", {
      familyId,
      parentVersionId: undefined,
      versionNumber: 1,
      imageKitFileId: args.imageKitFileId,
      imageKitPath: args.imageKitPath,
      recipe: validation.normalizedRecipe ?? args.recipe,
      dimensions: args.dimensions,
      editLabel: args.editLabel,
      createdAt: Date.now(),
    });

    return { familyId, versionId };
  },
});
