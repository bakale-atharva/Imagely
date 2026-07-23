import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { validateRecipe } from '@/lib/recipe';
import { checkRecipeEntitlements } from '@/lib/entitlements';

export async function POST(req: NextRequest) {
  try {
    const { userId, has } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { recipe, imageKitPath, mediaKind } = body;

    if (imageKitPath && typeof imageKitPath === 'string') {
      const expectedUserPrefix = `/users/${userId}/`;
      if (!imageKitPath.startsWith(expectedUserPrefix)) {
        return NextResponse.json({ error: 'Forbidden: Path does not belong to user' }, { status: 403 });
      }
    }

    // Verify feature entitlements server-side
    if (has) {
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

    // Validate recipe structure
    const valResult = validateRecipe(recipe || {});
    if (!valResult.valid) {
      return NextResponse.json({ error: `Invalid recipe: ${valResult.errors.join(', ')}` }, { status: 400 });
    }

    return NextResponse.json({
      authorized: true,
      normalizedRecipe: valResult.normalizedRecipe,
    });
  } catch (error: any) {
    console.error('Error verifying version creation entitlements:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
