import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSignedMediaUrl, getSignedCanvasUrl, getSignedResponsiveSrcSet } from '@/lib/imagekit';
import { checkRecipeEntitlements } from '@/lib/entitlements';

export async function POST(req: NextRequest) {
  try {
    const { userId, has } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { path, recipe, width, widths, maxDimensions, mediaKind } = body;

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'path is required and must be a string' }, { status: 400 });
    }

    const expectedUserPrefix = `/users/${userId}/`;
    if (!path.startsWith(expectedUserPrefix)) {
      return NextResponse.json({ error: 'Forbidden: Path does not belong to authenticated user' }, { status: 403 });
    }

    // Verify feature entitlements server-side
    if (recipe && has) {
      const entitlementCheck = checkRecipeEntitlements(has, recipe, mediaKind);
      if (!entitlementCheck.allowed) {
        return NextResponse.json(
          {
            error: `Forbidden: Missing required feature entitlement (${entitlementCheck.missingFeatures.join(', ')})`,
            missingFeatures: entitlementCheck.missingFeatures,
          },
          { status: 403 }
        );
      }
    }

    let url = '';
    let srcset: string | undefined = undefined;

    if (maxDimensions && typeof maxDimensions === 'object' && maxDimensions.width) {
      url = getSignedCanvasUrl({
        path,
        recipe,
        containerWidth: width,
        dpr: 1,
        maxDimensions,
      });
      if (widths && Array.isArray(widths)) {
        srcset = getSignedResponsiveSrcSet({
          path,
          recipe,
          widths,
        });
      }
    } else {
      let transformation: string | any = recipe;
      if (width) {
        transformation = `w-${width},q-auto,f-auto`;
      }
      
      if (widths && Array.isArray(widths)) {
        srcset = getSignedResponsiveSrcSet({
          path,
          recipe,
          widths,
        });
      }
      
      let trString = '';
      if (width) {
        trString = `w-${width},q-auto,f-auto`;
      }
      url = getSignedMediaUrl({
        path,
        transformation: trString || recipe,
      });
    }

    return NextResponse.json({ url, srcset });
  } catch (error: any) {
    console.error('Error signing media URL:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
