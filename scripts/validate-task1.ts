import schema from "../convex/schema";
import * as assetFamilies from "../convex/assetFamilies";
import * as assetVersions from "../convex/assetVersions";
import { validateRecipe } from "../lib/recipe";

function runValidation() {
  console.log("🚀 Running Task 1 Validation Checks...\n");

  // 1. Schema check
  console.log("1. Checking convex/schema.ts definitions...");
  const tables = schema.tables;
  if (!tables.assetFamilies || !tables.assetVersions) {
    throw new Error("Missing assetFamilies or assetVersions table in schema!");
  }
  console.log("   ✅ assetFamilies and assetVersions tables defined.");

  // Check indexes
  const familyIndexes = ((tables.assetFamilies as any).indexes || []).map((idx: any) => idx.indexDescriptor || idx.name);
  const versionIndexes = ((tables.assetVersions as any).indexes || []).map((idx: any) => idx.indexDescriptor || idx.name);

  if (!familyIndexes.includes("by_owner") || !familyIndexes.includes("by_owner_and_mediaKind")) {
    throw new Error(`Missing required assetFamilies index. Found: ${familyIndexes.join(", ")}`);
  }
  console.log("   ✅ assetFamilies indexes verified: by_owner, by_owner_and_mediaKind");

  if (!versionIndexes.includes("by_family") || !versionIndexes.includes("by_family_and_version")) {
    throw new Error(`Missing required assetVersions index. Found: ${versionIndexes.join(", ")}`);
  }
  console.log("   ✅ assetVersions indexes verified: by_family, by_family_and_version");

  // 2. assetFamilies exports check
  console.log("\n2. Checking convex/assetFamilies.ts exports...");
  if (!assetFamilies.listPaginatedAssetFamilies) throw new Error("Missing listPaginatedAssetFamilies query");
  if (!assetFamilies.getAssetFamily) throw new Error("Missing getAssetFamily query");
  if (!assetFamilies.createAssetFamilyWithV1) throw new Error("Missing createAssetFamilyWithV1 mutation");
  console.log("   ✅ listPaginatedAssetFamilies, getAssetFamily, createAssetFamilyWithV1 exported.");

  // 3. assetVersions exports check
  console.log("\n3. Checking convex/assetVersions.ts exports...");
  if (!assetVersions.listAssetVersions) throw new Error("Missing listAssetVersions query");
  if (!assetVersions.createAssetVersion) throw new Error("Missing createAssetVersion mutation");
  console.log("   ✅ listAssetVersions, createAssetVersion exported.");

  // 4. Validate recipe integration test
  console.log("\n4. Testing recipe validation logic for asset versions...");
  const validRecipe = { width: 800, height: 600, format: "webp", quality: 85, crop: "maintain_ratio" };
  const validRes = validateRecipe(validRecipe);
  if (!validRes.valid || !validRes.normalizedRecipe) {
    throw new Error("Valid recipe failed validation!");
  }
  console.log("   ✅ Valid recipe validated & normalized:", JSON.stringify(validRes.normalizedRecipe));

  const invalidRecipe = { width: -100, invalidParam: "hacked" };
  const invalidRes = validateRecipe(invalidRecipe);
  if (invalidRes.valid) {
    throw new Error("Invalid recipe passed validation unexpectedly!");
  }
  console.log("   ✅ Invalid recipe rejected correctly with errors:", invalidRes.errors.join("; "));

  console.log("\n🎉 TASK 1 VALIDATION PASSED SUCCESSFULLY!");
}

runValidation();
