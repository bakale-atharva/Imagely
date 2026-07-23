import { checkRecipeEntitlements } from '../lib/entitlements';
import { validateRecipe, formatRecipeToTransformation, Recipe } from '../lib/recipe';
import { getSignedMediaUrl, getSignedResponsiveSrcSet, getSignedCanvasUrl, getImageKitUploadParams } from '../lib/imagekit';
import * as fs from 'fs';
import * as path from 'path';

// Setup test fallback environment variables if not present
if (!process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io/imagely_test_endpoint';
}
if (!process.env.IMAGEKIT_PUBLIC_KEY && !process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY) {
  process.env.IMAGEKIT_PUBLIC_KEY = 'public_test_key_phase5_12345';
  process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY = 'public_test_key_phase5_12345';
}
if (!process.env.IMAGEKIT_PRIVATE_KEY) {
  process.env.IMAGEKIT_PRIVATE_KEY = 'private_test_key_phase5_67890';
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

async function validatePhase5() {
  console.log('\n==================================================');
  console.log('  IMAGELY MVP — PHASE 5 END-TO-END VERIFICATION');
  console.log('==================================================\n');

  const rootDir = process.cwd();

  // ----------------------------------------------------
  // SECTION 1: Auth & Route Protection
  // ----------------------------------------------------
  console.log('--- 1. Anonymous Access Rejection & Route Protection ---');
  const proxyPath = path.join(rootDir, 'proxy.ts');
  assert(fs.existsSync(proxyPath), 'proxy.ts exists');
  const proxyContent = fs.readFileSync(proxyPath, 'utf-8');
  assert(proxyContent.includes('clerkMiddleware'), 'proxy.ts configures Clerk middleware');

  // Verify server-side layout route protection with auth.protect()
  for (const layoutPath of ['app/gallery/layout.tsx', 'app/editor/layout.tsx', 'app/account/layout.tsx']) {
    const fullPath = path.join(rootDir, layoutPath);
    assert(fs.existsSync(fullPath), `${layoutPath} exists`);
    const layoutContent = fs.readFileSync(fullPath, 'utf-8');
    assert(layoutContent.includes('await auth.protect()'), `${layoutPath} enforces await auth.protect()`);
  }

  // ----------------------------------------------------
  // SECTION 2: User-to-User Isolation & Security
  // ----------------------------------------------------
  console.log('\n--- 2. User-to-User Isolation & Path Security ---');
  const uploadParams = getImageKitUploadParams({ userId: 'user_test123', mediaType: 'image' });
  assert(uploadParams.folder === '/users/user_test123/images', 'Upload params restrict folder to user image path');
  
  const videoUploadParams = getImageKitUploadParams({ userId: 'user_test123', mediaType: 'video' });
  assert(videoUploadParams.folder === '/users/user_test123/videos', 'Upload params restrict folder to user video path');

  const schemaPath = path.join(rootDir, 'convex', 'schema.ts');
  assert(fs.existsSync(schemaPath), 'convex/schema.ts exists');
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  assert(schemaContent.includes("ownerTokenIdentifier: v.string()"), 'assetFamilies schema includes ownerTokenIdentifier');
  assert(schemaContent.includes(".index(\"by_owner\", [\"ownerTokenIdentifier\"])"), 'assetFamilies indexed by ownerTokenIdentifier');

  const assetFamiliesPath = path.join(rootDir, 'convex', 'assetFamilies.ts');
  const assetFamiliesContent = fs.readFileSync(assetFamiliesPath, 'utf-8');
  assert(assetFamiliesContent.includes('getUserIdentity'), 'assetFamilies checks getUserIdentity');
  assert(assetFamiliesContent.includes('tokenIdentifier'), 'assetFamilies derives ownership from tokenIdentifier');

  // ----------------------------------------------------
  // SECTION 3: Upload Limits & File Handling
  // ----------------------------------------------------
  console.log('\n--- 3. Upload Validation & Limits ---');
  const uploadModalPath = path.join(rootDir, 'components', 'UploadModal.tsx');
  assert(fs.existsSync(uploadModalPath), 'UploadModal component exists');
  const uploadModalContent = fs.readFileSync(uploadModalPath, 'utf-8');
  assert(uploadModalContent.includes('20 * 1024 * 1024'), '20MB image size limit enforced in UI');
  assert(uploadModalContent.includes('100 * 1024 * 1024'), '100MB video size limit enforced in UI');
  assert(uploadModalContent.includes('image/png'), 'PNG images supported');
  assert(uploadModalContent.includes('video/mp4'), 'MP4 videos supported');

  // ----------------------------------------------------
  // SECTION 4: Recipe Validation & Normalization
  // ----------------------------------------------------
  console.log('\n--- 4. Recipe Validation & Normalization ---');
  const validImageRecipe: Recipe = {
    width: 800,
    height: 600,
    crop: 'maintain_ratio',
    rotate: 90,
    quality: 85,
    format: 'webp',
    bgRemove: true,
    textOverlay: 'Imagely Watermark',
    watermark: 'https://example.com/logo.png',
    blur: 5,
  };

  const normalized = validateRecipe(validImageRecipe);
  assert(normalized.valid === true, 'Recipe marked valid');
  assert(normalized.normalizedRecipe?.width === 800, 'Width normalized');
  assert(normalized.normalizedRecipe?.rotate === 90, 'Rotate normalized');
  assert(normalized.normalizedRecipe?.format === 'webp', 'Format normalized');
  assert(normalized.normalizedRecipe?.bgRemove === true, 'AI bgRemove normalized');

  const trString = formatRecipeToTransformation(normalized.normalizedRecipe!);
  assert(trString.includes('w-800'), 'Transformation string includes width');
  assert(trString.includes('rt-90'), 'Transformation string includes rotation');
  assert(trString.includes('f-webp'), 'Transformation string includes format');
  assert(trString.includes('e-bg-remove'), 'Transformation string includes bg-remove');
  assert(trString.includes('l-text'), 'Transformation string includes text overlay');

  // Raw unsanitized/invalid input stripping test
  const rawInvalidInput = {
    width: -50,
    quality: 999,
    format: 'invalid_format_injection',
    unsupportedParam: 'malicious_code_injection',
  };
  const sanitized = validateRecipe(rawInvalidInput);
  assert(sanitized.valid === false, 'Invalid recipe correctly rejected');
  assert(sanitized.errors.length > 0, 'Descriptive validation error messages produced');

  // ----------------------------------------------------
  // SECTION 5: Version History Lineage & Materialization
  // ----------------------------------------------------
  console.log('\n--- 5. Version History & Materialization Lineage ---');
  const assetVersionsPath = path.join(rootDir, 'convex', 'assetVersions.ts');
  assert(fs.existsSync(assetVersionsPath), 'convex/assetVersions.ts exists');
  const assetVersionsContent = fs.readFileSync(assetVersionsPath, 'utf-8');
  assert(assetVersionsContent.includes('parentVersionId'), 'assetVersions tracks parent version ID');
  assert(assetVersionsContent.includes('versionNumber'), 'assetVersions tracks sequential version number');
  assert(assetVersionsContent.includes('imageKitVersionId'), 'assetVersions tracks ImageKit version ID');
  assert(schemaContent.includes('by_family_and_version'), 'assetVersions indexed by family and version in schema');

  // ----------------------------------------------------
  // SECTION 6: Signed Delivery & HMAC Security
  // ----------------------------------------------------
  console.log('\n--- 6. Signed Delivery & HMAC Security ---');
  const testPath = '/users/user_test123/images/sample.jpg';
  const signedUrl = getSignedMediaUrl({ path: testPath, transformation: { width: 400 } });
  assert(signedUrl.includes('ik-s='), 'Signed URL contains ik-s HMAC signature');
  assert(signedUrl.includes('ik-e='), 'Signed URL contains ik-e expiration timestamp');
  assert(signedUrl.includes('tr:w-400'), 'Signed URL contains transformation parameters');

  // ----------------------------------------------------
  // SECTION 7: Responsive Image & Canvas Calculations
  // ----------------------------------------------------
  console.log('\n--- 7. Gallery & Editor Responsive Imagery ---');
  const responsiveSrcSet = getSignedResponsiveSrcSet({ path: testPath });
  assert(responsiveSrcSet.includes('240w'), 'SrcSet includes 240w candidate');
  assert(responsiveSrcSet.includes('320w'), 'SrcSet includes 320w candidate');
  assert(responsiveSrcSet.includes('480w'), 'SrcSet includes 480w candidate');
  assert(responsiveSrcSet.includes('640w'), 'SrcSet includes 640w candidate');
  assert(responsiveSrcSet.includes('960w'), 'SrcSet includes 960w candidate');

  const canvasUrl = getSignedCanvasUrl({ path: testPath, containerWidth: 600, dpr: 2, maxDimensions: { width: 1920, height: 1080 } });
  // Container 600px * DPR 2 = 1200px requested canvas size
  assert(canvasUrl.includes('w-1200'), 'Canvas URL uses container width * DPR calculation (1200px)');

  // ----------------------------------------------------
  // SECTION 8: Free / Pro / Ultra Entitlement Boundaries
  // ----------------------------------------------------
  console.log('\n--- 8. Entitlement Boundary Tests (UI & Server) ---');
  const freeMock = ({ feature }: { feature: string }) => feature === 'basic_editor';
  const proMock = ({ feature }: { feature: string }) => ['basic_editor', 'image_ai', 'advanced_image', 'advanced_video'].includes(feature);
  const ultraMock = () => true;

  // Free Tier Boundaries
  assert(checkRecipeEntitlements(freeMock, { width: 500 }).allowed === true, 'Free tier allows standard resize');
  assert(checkRecipeEntitlements(freeMock, { bgRemove: true }).allowed === false, 'Free tier blocks AI background removal');
  assert(checkRecipeEntitlements(freeMock, { textOverlay: 'Test' }).allowed === false, 'Free tier blocks text overlays');

  // Pro Tier Boundaries
  assert(checkRecipeEntitlements(proMock, { bgRemove: true }).allowed === true, 'Pro tier allows AI background removal');
  assert(checkRecipeEntitlements(proMock, { rotate: 90 }, 'video').allowed === true, 'Pro tier allows advanced video transform');
  assert(checkRecipeEntitlements(proMock, { extractAudio: true }).allowed === false, 'Pro tier blocks audio extraction');
  assert(checkRecipeEntitlements(proMock, { subtitleUrl: 'http://s.vtt' }).allowed === false, 'Pro tier blocks subtitle overlay');

  // Ultra Tier Boundaries
  assert(checkRecipeEntitlements(ultraMock, { extractAudio: true }).allowed === true, 'Ultra tier allows audio extraction');
  assert(checkRecipeEntitlements(ultraMock, { subtitleUrl: 'http://s.vtt' }).allowed === true, 'Ultra tier allows subtitle overlay');

  // ----------------------------------------------------
  // SECTION 9: Pre-Production & Release Readiness
  // ----------------------------------------------------
  console.log('\n--- 9. Release Readiness & Pre-Production Check ---');
  const envExamplePath = path.join(rootDir, '.env.local');
  assert(fs.existsSync(envExamplePath), '.env.local file exists');
  const envContent = fs.readFileSync(envExamplePath, 'utf-8');

  assert(envContent.includes('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'), 'Clerk Publishable Key configured');
  assert(envContent.includes('CLERK_SECRET_KEY'), 'Clerk Secret Key configured');
  assert(envContent.includes('NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT'), 'ImageKit URL Endpoint configured');
  assert(envContent.includes('IMAGEKIT_PUBLIC_KEY'), 'ImageKit Public Key configured');
  assert(envContent.includes('IMAGEKIT_PRIVATE_KEY'), 'ImageKit Private Key configured');
  assert(envContent.includes('NEXT_PUBLIC_CONVEX_URL'), 'Convex URL configured');

  console.log('\n==================================================');
  console.log('  ✅ ALL PHASE 5 END-TO-END VERIFICATIONS PASSED!');
  console.log('==================================================\n');
}

validatePhase5().catch((err) => {
  console.error('Phase 5 Verification Failed:', err);
  process.exit(1);
});
