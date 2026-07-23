import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSignedMediaUrl } from '@/lib/imagekit';
import { validateRecipe } from '@/lib/recipe';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { path, recipe, filename, format } = body;

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    // Verify ownership path isolation
    const expectedUserPrefix = `/users/${userId}/`;
    if (!path.startsWith(expectedUserPrefix)) {
      return NextResponse.json({ error: 'Forbidden: Path does not belong to user' }, { status: 403 });
    }

    // If recipe supplied, validate it server-side
    let transformation: string | undefined = undefined;
    if (recipe) {
      const valResult = validateRecipe(recipe);
      if (!valResult.valid) {
        return NextResponse.json({ error: `Invalid recipe: ${valResult.errors.join(', ')}` }, { status: 400 });
      }
    }

    // Construct download signed URL
    const url = getSignedMediaUrl({
      path,
      transformation: recipe,
      expirySeconds: 7200, // 2 hours for export downloads
    });

    // Append attachment header parameter if desired for forced download
    const exportUrl = `${url}${url.includes('?') ? '&' : '?'}ik-attachment=true`;

    return NextResponse.json({
      exportUrl,
      filename: filename || 'imagely-export',
      format: format || 'original',
    });
  } catch (error: any) {
    console.error('Error generating export URL:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
