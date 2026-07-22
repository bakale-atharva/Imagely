import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getImageKitUploadParams } from '@/lib/imagekit';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mediaTypeParam = searchParams.get('mediaType');
    const mediaType = mediaTypeParam === 'video' ? 'video' : 'image';

    const params = getImageKitUploadParams({ userId, mediaType });
    return NextResponse.json(params);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate ImageKit upload parameters';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let mediaType: 'image' | 'video' = 'image';
    try {
      const body = await request.json();
      if (body && body.mediaType === 'video') {
        mediaType = 'video';
      }
    } catch {
      const { searchParams } = new URL(request.url);
      if (searchParams.get('mediaType') === 'video') {
        mediaType = 'video';
      }
    }

    const params = getImageKitUploadParams({ userId, mediaType });
    return NextResponse.json(params);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate ImageKit upload parameters';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
