# Complete Clerk Core 3 Migration

## Summary

Finish the partially completed migration from `@clerk/nextjs` 6 to 7/Core 3. The official upgrade CLI has already completed all 13 codemods and scanned 25 files.

## Implementation Changes

- Replace direct `@clerk/clerk-react` 5.x with `@clerk/react` 6.x, aligned with `@clerk/nextjs` 7.5.20 and Convex’s supported peer dependency.
- Regenerate `pnpm-lock.yaml` through pnpm, preserving the existing ImageKit additions.
- Leave application source unchanged unless verification exposes an incompatibility:
  - `ClerkProvider` is already inside `<body>`.
  - No removed components, redirect props, token handling, appearance properties, or legacy Clerk imports remain.
  - Keep `auth.protect()` in `proxy.ts`; its new unauthenticated 401 behavior is accepted.
- Preserve the unrelated `convex/auth.config.ts` change.
- Refresh Git’s index metadata so the three content-identical files touched by the codemod no longer appear modified.

## Verification

- Confirm Node is at least 20.9 and Next.js is at least 15.2.3.
- Confirm the dependency tree contains `@clerk/nextjs` 7.x and `@clerk/react` 6.x, with no `@clerk/clerk-react`.
- Repeat the Core 3 legacy-pattern search across tracked application files.
- Run TypeScript checking, ESLint, and the production Next.js build.
- Review the final diff to ensure only Clerk dependency migration changes are attributed to this work and the pre-existing ImageKit/Convex edits remain intact.

## Assumptions

- Keep `@clerk/react` as an explicit dependency because Convex declares it as an optional peer and the repository previously installed the Core 2 equivalent explicitly.
- No satellite configuration, custom sign-in flow, Astro, Expo, Express, or React Router migration is required.
- No commit, branch, push, or deployment is included.
