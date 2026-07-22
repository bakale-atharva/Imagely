import { getSignedCanvasUrl, getSignedResponsiveSrcSet } from '../lib/imagekit';

function assert(condition: any, message: string) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`);
    process.exit(1);
  }
}

async function validate() {
  console.log('Running Phase 2 Validations...');

  // Mock env variables for ImageKit if not set
  if (!process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io/mock/';
  }
  if (!process.env.IMAGEKIT_PRIVATE_KEY) {
    process.env.IMAGEKIT_PRIVATE_KEY = 'mock_private_key';
  }

  // 1. Test getSignedResponsiveSrcSet
  const srcset = getSignedResponsiveSrcSet({
    path: '/users/123/images/test.jpg',
    widths: [300, 600],
  });
  console.log('SrcSet:', srcset);
  assert(srcset.includes('tr:w-300'), 'Srcset should contain width 300 transformation');
  assert(srcset.includes('300w'), 'Srcset should contain 300w descriptor');
  assert(srcset.includes('tr:w-600'), 'Srcset should contain width 600 transformation');
  assert(srcset.includes('600w'), 'Srcset should contain 600w descriptor');
  assert(srcset.includes('ik-s='), 'Srcset URLs should be signed');

  // 2. Test getSignedCanvasUrl
  const canvasUrl = getSignedCanvasUrl({
    path: '/users/123/images/test.jpg',
    containerWidth: 400,
    dpr: 2,
    maxDimensions: { width: 1000, height: 1000 },
  });
  console.log('Canvas URL:', canvasUrl);
  // 400 * 2 = 800
  assert(canvasUrl.includes('tr:w-800'), 'Canvas URL should calculate targetWidth correctly');
  assert(canvasUrl.includes('ik-s='), 'Canvas URL should be signed');

  // We could test the Next.js API route as well, but mocking NextRequest & Clerk auth in a simple TS script
  // might be tricky due to how NextRequest behaves in Node.js (requires Request polyfills if older Node, etc.)
  // Let's do a basic test if possible.
  console.log('✅ All validations passed!');
}

validate().catch((err) => {
  console.error(err);
  process.exit(1);
});
