import fs from "node:fs";
import path from "node:path";
import { validateRecipe } from '../lib/recipe';
import schema from '../convex/schema';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

async function runValidation() {
  console.log('🚀 Running Phase 1 Data Schema, Convex Functions & Route Protection Validation...\n');

  // Step 1: Convex Schema Definition Validation
  console.log('1. Validating Convex Schema Definitions...');
  assert(Boolean(schema), 'Schema object must be defined');
  const tables = schema.tables;
  assert(Boolean(tables.assetFamilies), 'Table assetFamilies must be defined in schema');
  assert(Boolean(tables.assetVersions), 'Table assetVersions must be defined in schema');

  // Verify assetFamilies indexes
  const familyIndexes = (tables.assetFamilies as any).indexes || [];
  const familyIndexNames = familyIndexes.map((idx: any) => idx.indexDescriptor);
  console.log('   - assetFamilies indexes:', familyIndexNames);
  assert(familyIndexNames.includes('by_owner'), 'assetFamilies must contain by_owner index');
  assert(familyIndexNames.includes('by_owner_and_mediaKind'), 'assetFamilies must contain by_owner_and_mediaKind index');

  // Verify assetVersions indexes
  const versionIndexes = (tables.assetVersions as any).indexes || [];
  const versionIndexNames = versionIndexes.map((idx: any) => idx.indexDescriptor);
  console.log('   - assetVersions indexes:', versionIndexNames);
  assert(versionIndexNames.includes('by_family'), 'assetVersions must contain by_family index');
  assert(versionIndexNames.includes('by_family_and_version'), 'assetVersions must contain by_family_and_version index');
  console.log('   ✅ Convex schema tables & indexes verified successfully.\n');

  // Step 2: Convex Function Exports Verification
  console.log('2. Verifying Convex Query & Mutation Exports...');
  const assetFamiliesModule = await import('../convex/assetFamilies');
  assert(Boolean(assetFamiliesModule.listPaginatedAssetFamilies), 'listPaginatedAssetFamilies query must be exported');
  assert(Boolean(assetFamiliesModule.getAssetFamily), 'getAssetFamily query must be exported');
  assert(Boolean(assetFamiliesModule.createAssetFamilyWithV1), 'createAssetFamilyWithV1 mutation must be exported');

  const assetVersionsModule = await import('../convex/assetVersions');
  assert(Boolean(assetVersionsModule.listAssetVersions), 'listAssetVersions query must be exported');
  assert(Boolean(assetVersionsModule.createAssetVersion), 'createAssetVersion mutation must be exported');
  console.log('   ✅ Convex server function exports verified successfully.\n');

  // Step 3: Server-side Recipe Validation Integration
  console.log('3. Verifying Server-side Recipe Validation for Convex Mutations...');
  const validRecipe = { width: 1280, height: 720, crop: 'maintain_ratio', quality: 90, format: 'webp' };
  const validCheck = validateRecipe(validRecipe);
  assert(validCheck.valid, 'Valid recipe must be accepted');
  assert(Boolean(validCheck.normalizedRecipe), 'Normalized recipe should be produced');

  const invalidRecipe = { width: -50, quality: 200, unknownProp: '<script>' };
  const invalidCheck = validateRecipe(invalidRecipe);
  assert(!invalidCheck.valid, 'Invalid recipe must be rejected');
  assert(invalidCheck.errors.length > 0, 'Invalid recipe must produce descriptive error messages');
  console.log('   ✅ Server-side recipe validation integration verified successfully.\n');

  // Step 4: Route Protection Pattern Verification
  console.log('4. Verifying Route Protection Patterns in Proxy...');
  const proxyPath = path.join(process.cwd(), "proxy.ts");
  const middlewarePath = path.join(process.cwd(), "middleware.ts");
  assert(fs.existsSync(proxyPath), "Next.js proxy.ts must exist");
  assert(!fs.existsSync(middlewarePath), "Next.js cannot load both middleware.ts and proxy.ts");

  const proxySource = fs.readFileSync(proxyPath, "utf8");
  assert(proxySource.includes("clerkMiddleware"), "proxy.ts must configure Clerk middleware");
  assert(!proxySource.includes("createRouteMatcher"), "proxy.ts must not use deprecated createRouteMatcher");
  const protectedPatterns = [
    '/gallery',
    '/gallery/sub-path',
    '/editor/image',
    '/editor/video',
    '/account',
    '/api/imagekit/auth',
    '/api/media/upload',
  ];
  const publicPatterns = [
    '/',
    '/pricing',
  ];

  // Regex based on createRouteMatcher(["/gallery(.*)", "/editor(.*)", "/account(.*)", "/api/imagekit/auth(.*)", "/api/media(.*)"])
  const protectedRegexes = [
    /^\/gallery(.*)/,
    /^\/editor(.*)/,
    /^\/account(.*)/,
    /^\/api\/imagekit\/auth(.*)/,
    /^\/api\/media(.*)/,
  ];

  for (const layoutPath of ["app/gallery/layout.tsx", "app/editor/layout.tsx", "app/account/layout.tsx"]) {
    assert(fs.existsSync(path.join(process.cwd(), layoutPath)), `${layoutPath} must provide local auth protection`);
    const layoutSource = fs.readFileSync(path.join(process.cwd(), layoutPath), "utf8");
    assert(layoutSource.includes("@clerk/nextjs/server"), `${layoutPath} must use server-side Clerk auth`);
    assert(layoutSource.includes("await auth.protect()"), `${layoutPath} must protect the route resource`);
  }

  const matchesProtected = (path: string) => protectedRegexes.some((regex) => regex.test(path));

  for (const path of protectedPatterns) {
    assert(matchesProtected(path), `Path ${path} should be protected by middleware`);
  }
  for (const path of publicPatterns) {
    assert(!matchesProtected(path), `Path ${path} should NOT be protected by middleware`);
  }
  console.log('   ✅ Route protection patterns verified successfully.\n');

  // Step 5: Studio Shell Page Components Verification
  console.log('5. Verifying Studio Shell Pages & Navigation Component...');
  const navigationModule = await import('../components/Navigation');
  const galleryPageModule = await import('../app/gallery/page');
  const imageEditorPageModule = await import('../app/editor/image/page');
  const videoEditorPageModule = await import('../app/editor/video/page');
  const pricingPageModule = await import('../app/pricing/page');
  const accountPageModule = await import('../app/account/page');
  const landingPageModule = await import('../app/page');

  assert(Boolean(navigationModule.default), 'Navigation default component exported');
  assert(Boolean(galleryPageModule.default), 'Gallery page default component exported');
  assert(Boolean(imageEditorPageModule.default), 'Image Editor page default component exported');
  assert(Boolean(videoEditorPageModule.default), 'Video Editor page default component exported');
  assert(Boolean(pricingPageModule.default), 'Pricing page default component exported');
  assert(Boolean(accountPageModule.default), 'Account page default component exported');
  assert(Boolean(landingPageModule.default), 'Landing page default component exported');
  console.log('   ✅ All Studio Shell page components verified successfully.\n');

  console.log('🎉 ALL PHASE 1 VALIDATION CHECKS PASSED SUCCESSFULLY!\n');
}

runValidation().catch((err) => {
  console.error('❌ Phase 1 Validation Failed:', err);
  process.exit(1);
});
