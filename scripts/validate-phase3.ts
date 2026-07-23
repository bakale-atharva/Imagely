import { validateRecipe, formatRecipeToTransformation, Recipe } from '../lib/recipe';

async function main() {
  console.log('=== Phase 3 Validation Script ===');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, description: string) {
    if (condition) {
      console.log(`✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${description}`);
      failed++;
    }
  }

  // Test 1: Image Free Tools Recipe
  const imageFreeRecipe: Recipe = {
    width: 1200,
    height: 800,
    crop: 'maintain_ratio',
    quality: 85,
    format: 'webp',
    rotate: 90,
  };
  const valResult1 = validateRecipe(imageFreeRecipe);
  assert(valResult1.valid === true, 'Image Free recipe validation passes');
  const tr1 = formatRecipeToTransformation(valResult1.normalizedRecipe!);
  assert(tr1.includes('w-1200'), 'Image Free recipe contains width');
  assert(tr1.includes('h-800'), 'Image Free recipe contains height');
  assert(tr1.includes('c-maintain_ratio'), 'Image Free recipe contains crop');
  assert(tr1.includes('q-85'), 'Image Free recipe contains quality');
  assert(tr1.includes('f-webp'), 'Image Free recipe contains format');
  assert(tr1.includes('rt-90'), 'Image Free recipe contains rotation');

  // Test 2: Image Pro Tools Recipe (Background removal & text overlay)
  const imageProRecipe: Recipe = {
    bgRemove: true,
    blur: 15,
    textOverlay: 'Confidential Draft',
    watermark: 'logo.png',
  };
  const valResult2 = validateRecipe(imageProRecipe);
  assert(valResult2.valid === true, 'Image Pro recipe validation passes');
  const tr2 = formatRecipeToTransformation(valResult2.normalizedRecipe!);
  assert(tr2.includes('e-bg-remove'), 'Image Pro recipe contains background removal');
  assert(tr2.includes('bl-15'), 'Image Pro recipe contains blur');
  assert(tr2.includes('l-text'), 'Image Pro recipe contains text overlay');
  assert(tr2.includes('l-image'), 'Image Pro recipe contains watermark overlay');

  // Test 3: Video Free Tools Recipe (Trim & Mute)
  const videoFreeRecipe: Recipe = {
    startSeconds: 5,
    endSeconds: 45,
    mute: true,
    format: 'mp4',
  };
  const valResult3 = validateRecipe(videoFreeRecipe);
  assert(valResult3.valid === true, 'Video Free recipe validation passes');
  const tr3 = formatRecipeToTransformation(valResult3.normalizedRecipe!);
  assert(tr3.includes('so-5'), 'Video Free recipe contains startSeconds');
  assert(tr3.includes('eo-45'), 'Video Free recipe contains endSeconds');
  assert(tr3.includes('e-mute'), 'Video Free recipe contains mute');
  assert(tr3.includes('f-mp4'), 'Video Free recipe contains format');

  // Test 4: Video Pro & Ultra Tools Recipe (Aspect ratio, audio extraction, subtitles)
  const videoUltraRecipe: Recipe = {
    aspectRatio: '16:9',
    extractAudio: true,
    subtitleUrl: 'subtitles/en.vtt',
  };
  const valResult4 = validateRecipe(videoUltraRecipe);
  assert(valResult4.valid === true, 'Video Ultra recipe validation passes');
  const tr4 = formatRecipeToTransformation(valResult4.normalizedRecipe!);
  assert(tr4.includes('f-mp3'), 'Video Ultra recipe converts extractAudio to f-mp3');
  assert(tr4.includes('ar-16-9'), 'Video Ultra recipe formats aspect ratio');
  assert(tr4.includes('l-subtitles,i-subtitles/en.vtt,l-end'), 'Video Ultra recipe contains subtitle overlay');

  // Test 5: Invalid Recipe parameter rejection
  const invalidRecipe = {
    maliciousParam: 'DROP TABLE users;',
    width: -100,
  };
  const valResult5 = validateRecipe(invalidRecipe);
  assert(valResult5.valid === false, 'Invalid recipe correctly rejected');
  assert(valResult5.errors.length >= 2, 'Validation returns descriptive errors');

  console.log(`\nResults: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Validation script error:', err);
  process.exit(1);
});
