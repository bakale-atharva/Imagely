import { checkRecipeEntitlements, getRequiredFeaturesForRecipe } from '../lib/entitlements';
import { Recipe } from '../lib/recipe';
import * as fs from 'fs';
import * as path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

async function validatePhase4() {
  console.log('\n========================================');
  console.log('  PHASE 4 VALIDATION SUITE');
  console.log('========================================\n');

  // Test 1: getRequiredFeaturesForRecipe unit tests
  console.log('--- Test 1: Entitlement Feature Mapping ---');
  
  const basicReqs = getRequiredFeaturesForRecipe(null);
  assert(basicReqs.includes('basic_editor'), 'Null recipe defaults to basic_editor');

  const bgRemoveReqs = getRequiredFeaturesForRecipe({ bgRemove: true });
  assert(bgRemoveReqs.includes('image_ai') && bgRemoveReqs.includes('advanced_image'), 'bgRemove requires image_ai & advanced_image');

  const textOverlayReqs = getRequiredFeaturesForRecipe({ textOverlay: 'Sample' });
  assert(textOverlayReqs.includes('advanced_image'), 'textOverlay requires advanced_image');

  const audioReqs = getRequiredFeaturesForRecipe({ extractAudio: true });
  assert(audioReqs.includes('audio_extraction'), 'extractAudio requires audio_extraction');

  const subReqs = getRequiredFeaturesForRecipe({ subtitleUrl: 'https://example.com/subs.vtt' });
  assert(subReqs.includes('subtitle_overlay'), 'subtitleUrl requires subtitle_overlay');

  const videoAspectReqs = getRequiredFeaturesForRecipe({ aspectRatio: '16:9' }, 'video');
  assert(videoAspectReqs.includes('advanced_video'), 'Video aspect ratio requires advanced_video');

  // Test 2: checkRecipeEntitlements guard tests
  console.log('\n--- Test 2: Entitlement Guard Function ---');
  
  // Free User mock (only basic_editor)
  const mockFreeHas = ({ feature }: { feature: string }) => feature === 'basic_editor';
  
  const freeBasicCheck = checkRecipeEntitlements(mockFreeHas, { width: 800, quality: 90 });
  assert(freeBasicCheck.allowed, 'Free user is allowed basic edits');

  const freeProCheck = checkRecipeEntitlements(mockFreeHas, { bgRemove: true });
  assert(!freeProCheck.allowed, 'Free user is blocked from bgRemove');
  assert(freeProCheck.missingFeatures.includes('advanced_image'), 'Missing feature reported correctly');

  // Pro User mock (basic_editor, image_ai, advanced_image, advanced_video)
  const mockProHas = ({ feature }: { feature: string }) =>
    ['basic_editor', 'image_ai', 'advanced_image', 'advanced_video'].includes(feature);

  const proBgCheck = checkRecipeEntitlements(mockProHas, { bgRemove: true });
  assert(proBgCheck.allowed, 'Pro user is allowed bgRemove');

  const proUltraCheck = checkRecipeEntitlements(mockProHas, { extractAudio: true });
  assert(!proUltraCheck.allowed, 'Pro user is blocked from extractAudio');
  assert(proUltraCheck.missingFeatures.includes('audio_extraction'), 'Missing ultra feature reported correctly');

  // Ultra User mock (all features)
  const mockUltraHas = ({ feature }: { feature: string }) => true;
  const ultraCheck = checkRecipeEntitlements(mockUltraHas, { extractAudio: true, subtitleUrl: 'http://test.srt' });
  assert(ultraCheck.allowed, 'Ultra user is allowed ultra features');

  // Test 3: File existence & endpoint routing validation
  console.log('\n--- Test 3: Endpoint & Page File Verification ---');

  const rootDir = process.cwd();

  const entitlementsFile = path.join(rootDir, 'lib', 'entitlements.ts');
  assert(fs.existsSync(entitlementsFile), 'lib/entitlements.ts exists');

  const signUrlRouteFile = path.join(rootDir, 'app', 'api', 'media', 'sign-url', 'route.ts');
  assert(fs.existsSync(signUrlRouteFile), 'app/api/media/sign-url/route.ts exists');
  const signUrlContent = fs.readFileSync(signUrlRouteFile, 'utf-8');
  assert(signUrlContent.includes('checkRecipeEntitlements'), 'sign-url route imports checkRecipeEntitlements');

  const exportRouteFile = path.join(rootDir, 'app', 'api', 'media', 'export', 'route.ts');
  assert(fs.existsSync(exportRouteFile), 'app/api/media/export/route.ts exists');
  const exportContent = fs.readFileSync(exportRouteFile, 'utf-8');
  assert(exportContent.includes('checkRecipeEntitlements'), 'export route imports checkRecipeEntitlements');

  const versionCreateRouteFile = path.join(rootDir, 'app', 'api', 'media', 'version-create', 'route.ts');
  assert(fs.existsSync(versionCreateRouteFile), 'app/api/media/version-create/route.ts exists');

  const pricingPageFile = path.join(rootDir, 'app', 'pricing', 'page.tsx');
  assert(fs.existsSync(pricingPageFile), 'app/pricing/page.tsx exists');
  const pricingContent = fs.readFileSync(pricingPageFile, 'utf-8');
  assert(pricingContent.includes('PricingTable'), 'Pricing page includes Clerk PricingTable component');

  const accountPageFile = path.join(rootDir, 'app', 'account', 'page.tsx');
  assert(fs.existsSync(accountPageFile), 'app/account/page.tsx exists');
  const accountContent = fs.readFileSync(accountPageFile, 'utf-8');
  assert(accountContent.includes('Active Feature Entitlements'), 'Account page displays Feature Entitlements section');

  console.log('\n========================================');
  console.log('  ✅ ALL PHASE 4 VALIDATIONS PASSED!');
  console.log('========================================\n');
}

validatePhase4().catch((err) => {
  console.error('Validation failed with error:', err);
  process.exit(1);
});
