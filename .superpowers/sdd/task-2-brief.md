# Task 2 Brief: Clerk Route Enforcement & Protection

## Objectives
1. Set up route protection using Clerk in `middleware.ts` (or `proxy.ts`).
2. Secure studio workspace routes: `/gallery(.*)`, `/editor(.*)`, `/account(.*)`, `/api/imagekit/auth(.*)`, `/api/media(.*)`.
3. Create server-side endpoint helper/guaranteed auth wrappers if needed.

## Detailed Requirements

### 1. `middleware.ts` / `proxy.ts`
Create or update `middleware.ts` in project root:
- Import `clerkMiddleware, createRouteMatcher` from `@clerk/nextjs/server`.
- Define protected route matcher:
  ```ts
  const isProtectedRoute = createRouteMatcher([
    "/gallery(.*)",
    "/editor(.*)",
    "/account(.*)",
    "/api/imagekit/auth(.*)",
    "/api/media(.*)",
  ]);
  ```
- In `clerkMiddleware`, if `isProtectedRoute(req)`, `await auth.protect()`.
- Export matching config matching all routes except `_next` and static files, plus API routes.

### 2. Verify `app/api/imagekit/auth/route.ts`
- Ensure `auth()` is imported from `@clerk/nextjs/server`.
- Enforce `const { userId } = await auth(); if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`
- Use `getImageKitUploadParams({ userId, mediaType })` from `@/lib/imagekit`.

## Guidelines Compliance
- Ensure unauthenticated requests to `/gallery`, `/editor/image`, `/editor/video`, `/account`, or `/api/*` are redirected to sign in or rejected with 401.
