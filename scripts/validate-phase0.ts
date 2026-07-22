import crypto from 'crypto';
import {
  getImageKitUploadParams,
  getSignedMediaUrl,
  validateRecipe,
  formatRecipeToTransformation,
} from '../lib/imagekit';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

function runValidation() {
  console.log('🚀 Running Phase 0 ImageKit Integration Validation...\n');

  // Step 1: Environment Variables Validation
  console.log('1. Validating Environment Variables...');
  if (!process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
    console.log('   [INFO] NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT not found in env, setting test fallback endpoint.');
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io/imagely_test_endpoint';
  }
  if (!process.env.IMAGEKIT_PUBLIC_KEY && !process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY) {
    console.log('   [INFO] IMAGEKIT_PUBLIC_KEY not found in env, setting test fallback public key.');
    process.env.IMAGEKIT_PUBLIC_KEY = 'public_test_key_phase0_12345';
  }
  if (!process.env.IMAGEKIT_PRIVATE_KEY) {
    console.log('   [INFO] IMAGEKIT_PRIVATE_KEY not found in env, setting test fallback private key.');
    process.env.IMAGEKIT_PRIVATE_KEY = 'private_test_key_phase0_67890';
  }

  assert(Boolean(process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT), 'NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT must be present.');
  assert(
    Boolean(process.env.IMAGEKIT_PUBLIC_KEY || process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY),
    'IMAGEKIT_PUBLIC_KEY or NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY must be present.'
  );
  assert(Boolean(process.env.IMAGEKIT_PRIVATE_KEY), 'IMAGEKIT_PRIVATE_KEY must be present.');
  console.log('   ✅ Environment variables validated successfully.\n');

  // Step 2: User Isolation Folder Path Construction
  console.log('2. Verifying User Isolation Folder Path Construction...');
  const userId = 'user_2t1aB3c4D5e6F7g8';
  
  const imageUploadParams = getImageKitUploadParams({ userId, mediaType: 'image' });
  console.log(`   - Image Upload Folder: ${imageUploadParams.folder}`);
  assert(
    imageUploadParams.folder === `/users/${userId}/images`,
    `Expected image folder to be /users/${userId}/images, got ${imageUploadParams.folder}`
  );
  assert(Boolean(imageUploadParams.token), 'Upload params token must be non-empty');
  assert(Boolean(imageUploadParams.signature), 'Upload params signature must be non-empty');
  assert(typeof imageUploadParams.expire === 'number', 'Upload params expire must be a number');

  const videoUploadParams = getImageKitUploadParams({ userId, mediaType: 'video' });
  console.log(`   - Video Upload Folder: ${videoUploadParams.folder}`);
  assert(
    videoUploadParams.folder === `/users/${userId}/videos`,
    `Expected video folder to be /users/${userId}/videos, got ${videoUploadParams.folder}`
  );

  // Default media type fallback to 'image'
  const defaultUploadParams = getImageKitUploadParams({ userId });
  assert(
    defaultUploadParams.folder === `/users/${userId}/images`,
    `Expected default folder to be /users/${userId}/images, got ${defaultUploadParams.folder}`
  );

  console.log('   ✅ User isolation folder construction verified successfully.\n');

  // Step 3: Signed Media URL Generation & Parsing
  console.log('3. Testing getSignedMediaUrl Signature Generation & Parsing...');
  const testPath = `/users/${userId}/images/sample-photo.png`;
  const expirySeconds = 1800; // 30 minutes
  
  const signedUrlString = getSignedMediaUrl({
    path: testPath,
    expirySeconds,
  });

  console.log(`   - Generated Signed URL: ${signedUrlString}`);
  
  const parsedUrl = new URL(signedUrlString);
  const endpointBase = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!.replace(/\/+$/, '');
  const expectedBase = new URL(endpointBase);

  assert(parsedUrl.origin === expectedBase.origin, `URL origin mismatch: ${parsedUrl.origin} vs ${expectedBase.origin}`);
  assert(parsedUrl.pathname.endsWith(testPath), `URL path mismatch: ${parsedUrl.pathname} does not end with ${testPath}`);
  
  const ikEParam = parsedUrl.searchParams.get('ik-e');
  const ikSParam = parsedUrl.searchParams.get('ik-s');

  assert(Boolean(ikEParam), 'Signed URL must contain ik-e query parameter');
  assert(Boolean(ikSParam), 'Signed URL must contain ik-s query parameter');

  // Verify HMAC-SHA1 signature correctness
  const expectedStringToSign = `${testPath}${ikEParam}`;
  const expectedSignature = crypto
    .createHmac('sha1', process.env.IMAGEKIT_PRIVATE_KEY!)
    .update(expectedStringToSign)
    .digest('hex');

  assert(ikSParam === expectedSignature, `Signature mismatch! Generated: ${ikSParam}, Expected: ${expectedSignature}`);
  console.log('   ✅ Signature matches expected HMAC-SHA1 calculation.');

  // Test Signed URL with Transformation string & recipe
  const transformRecipe = {
    width: 800,
    height: 600,
    crop: 'maintain_ratio',
    quality: 85,
    format: 'webp',
  };

  const signedTransformedUrl = getSignedMediaUrl({
    path: testPath,
    transformation: transformRecipe,
    expirySeconds: 3600,
  });

  console.log(`   - Transformed Signed URL: ${signedTransformedUrl}`);
  const parsedTransformedUrl = new URL(signedTransformedUrl);
  const expectedTransformString = formatRecipeToTransformation(transformRecipe);
  assert(
    parsedTransformedUrl.pathname.includes(`/tr:${expectedTransformString}`),
    `Transformed URL path does not contain expected transformation: ${parsedTransformedUrl.pathname}`
  );
  console.log('   ✅ Signed media URL generation & parsing verified successfully.\n');

  // Step 4: Recipe Validation (validateRecipe)
  console.log('4. Testing validateRecipe with Valid and Invalid Recipes...');

  // 4a. Valid Recipes
  const validRecipes = [
    { width: 1920, height: 1080, crop: 'maintain_ratio', quality: 90, format: 'webp', bgRemove: true },
    { w: 500, h: 500, c: 'force', q: 80, f: 'jpg', blur: 10, rotate: 90 },
    { width: 300, aspectRatio: '16:9', watermark: 'watermarks/logo.png' },
  ];

  for (const recipe of validRecipes) {
    const res = validateRecipe(recipe);
    assert(res.valid, `Valid recipe was incorrectly rejected: ${JSON.stringify(recipe)}. Errors: ${res.errors.join(', ')}`);
    assert(res.errors.length === 0, 'Valid recipe should have no errors');
    assert(Boolean(res.normalizedRecipe), 'Valid recipe should return a normalized recipe object');
  }
  console.log('   ✅ Valid recipes passed validation.');

  // 4b. Invalid Recipes
  const invalidCases = [
    { recipe: null, desc: 'null recipe' },
    { recipe: 'not an object', desc: 'string recipe' },
    { recipe: { width: -100 }, desc: 'negative width' },
    { recipe: { height: 0 }, desc: 'zero height' },
    { recipe: { height: 15000 }, desc: 'out of bound height' },
    { recipe: { crop: 'invalid_crop_mode' }, desc: 'disallowed crop mode' },
    { recipe: { quality: 150 }, desc: 'quality > 100' },
    { recipe: { format: 'exe' }, desc: 'disallowed format' },
    { recipe: { bgRemove: 'yes' }, desc: 'non-boolean bgRemove' },
    { recipe: { watermark: '' }, desc: 'empty watermark' },
    { recipe: { rotate: 45 }, desc: 'invalid rotation angle' },
    { recipe: { width: 500, maliciousKey: '<script>alert(1)</script>' }, desc: 'disallowed unknown property' },
  ];

  for (const item of invalidCases) {
    const res = validateRecipe(item.recipe);
    assert(!res.valid, `Invalid recipe (${item.desc}) was incorrectly accepted: ${JSON.stringify(item.recipe)}`);
    assert(res.errors.length > 0, `Invalid recipe (${item.desc}) should return at least one error`);
  }
  console.log('   ✅ Invalid recipes correctly rejected.');

  console.log('\n🎉 ALL PHASE 0 VALIDATION CHECKS PASSED SUCCESSFULLY!\n');
}

runValidation();
process.exit(0);
