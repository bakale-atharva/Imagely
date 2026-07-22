# Clerk Billing Setup & Configuration Guide (Phase 0)

This guide provides step-by-step instructions for enabling, configuring, validating, and deploying Clerk Billing for **Imagely**.

---

## 1. Overview & Plan Architecture

Imagely Phase 0 uses user-level subscription plans (`payer_type: "user"`) with feature-based entitlements.

### Plan Tiers & Features Matrix

| Feature Slug | Feature Name | Description | Free ($0/mo) | Pro ($15/mo, $150/yr) | Ultra ($30/mo, $300/yr) |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `basic_editor` | Basic Editor | Core image and video editing tools | ✅ | ✅ | ✅ |
| `image_ai` | AI Image Generation | AI prompt processing & image generation | ❌ | ✅ | ✅ |
| `advanced_image` | Advanced Image Tools | Filters, background removal, enhancements | ❌ | ✅ | ✅ |
| `advanced_video` | Advanced Video Tools | Multi-track trimming, HD export, video FX | ❌ | ✅ | ✅ |
| `audio_extraction` | Audio Extraction | Extract audio tracks from video files | ❌ | ❌ | ✅ |
| `subtitle_overlay` | Subtitle Overlay | Auto-subtitles and custom subtitle rendering | ❌ | ❌ | ✅ |

---

## 2. Prerequisites & Clerk Dashboard Setup

Before applying the JSON configuration, complete the initial setup in the Clerk Dashboard:

1. **Log into Clerk Dashboard**: Navigate to [dashboard.clerk.com](https://dashboard.clerk.com).
2. **Select Application**: Select your Imagely application instance (Development / Staging / Production).
3. **Enable Billing**:
   - Go to **Billing** in the left sidebar menu.
   - Click **Enable Billing**.
   - Select **User Billing** (or enable both User and Organization Billing if applicable).
4. **Connect Payment Gateway (Stripe)**:
   - In the **Billing** settings tab, connect your Stripe account or activate Clerk's managed Stripe test mode.
   - Set Default Currency to **USD (`usd`)**.

---

## 3. Local Configuration File (`billing.json`)

The `billing.json` file in the root directory defines all features, plans, pricing tiers, and feature entitlements.

```json
{
  "$schema": "https://clerk.com/schemas/billing.json",
  "version": "1.0",
  "billing": {
    "user_enabled": true,
    "organization_enabled": false,
    "currency": "usd",
    "features": [
      { "slug": "basic_editor", "name": "Basic Editor" },
      { "slug": "image_ai", "name": "AI Image Generation" },
      { "slug": "advanced_image", "name": "Advanced Image Tools" },
      { "slug": "advanced_video", "name": "Advanced Video Tools" },
      { "slug": "audio_extraction", "name": "Audio Extraction" },
      { "slug": "subtitle_overlay", "name": "Subtitle Overlay" }
    ],
    "plans": [
      {
        "slug": "free",
        "name": "Free",
        "payer_type": "user",
        "prices": [{ "currency": "usd", "amount": 0, "interval": "month" }],
        "features": ["basic_editor"]
      },
      {
        "slug": "pro",
        "name": "Pro",
        "payer_type": "user",
        "prices": [
          { "currency": "usd", "amount": 1500, "interval": "month" },
          { "currency": "usd", "amount": 15000, "interval": "year" }
        ],
        "features": ["basic_editor", "image_ai", "advanced_image", "advanced_video"]
      },
      {
        "slug": "ultra",
        "name": "Ultra",
        "payer_type": "user",
        "prices": [
          { "currency": "usd", "amount": 3000, "interval": "month" },
          { "currency": "usd", "amount": 30000, "interval": "year" }
        ],
        "features": [
          "basic_editor",
          "image_ai",
          "advanced_image",
          "advanced_video",
          "audio_extraction",
          "subtitle_overlay"
        ]
      }
    ]
  }
}
```

---

## 4. Validating and Applying Configuration via Clerk CLI

### Step 1: Run the Local Validation Script

Before patching your instance, run the included TypeScript validation script to ensure schema correctness:

```bash
npx tsx scripts/apply-clerk-billing.ts
```

This verifies:
- JSON structure and schema validity
- All 6 required feature slugs (`basic_editor`, `image_ai`, `advanced_image`, `advanced_video`, `audio_extraction`, `subtitle_overlay`)
- Plan definitions (`free`, `pro`, `ultra`) and pricing amounts
- Feature entitlements mapping for each plan

### Step 2: Authenticate Clerk CLI

```bash
npx clerk login
```

### Step 3: Preview Changes (Dry Run)

Test the configuration patch against your Clerk environment without saving changes:

```bash
npx clerk config patch --file billing.json --dry-run
```

### Step 4: Patch Configuration to Clerk

Apply the configuration to your active development instance:

```bash
npx clerk config patch --file billing.json
```

To target production explicitly:

```bash
npx clerk config patch --file billing.json --instance prod
```

---

## 5. Alternative: Manual Dashboard Setup

If you prefer to configure billing directly in the Clerk Dashboard:

1. **Add Features**:
   - Go to **Billing** > **Features** > **Create Feature**.
   - Create each feature slug (`basic_editor`, `image_ai`, `advanced_image`, `advanced_video`, `audio_extraction`, `subtitle_overlay`).
2. **Add Plans**:
   - Go to **Billing** > **Plans** > **Create Plan**.
   - **Free Plan**:
     - Name: `Free`, Slug: `free`
     - Price: $0 / month
     - Features: Select `basic_editor`
   - **Pro Plan**:
     - Name: `Pro`, Slug: `pro`
     - Monthly Price: $15.00 (`$15/month`)
     - Annual Price: $150.00 (`$150/year`)
     - Features: Select `basic_editor`, `image_ai`, `advanced_image`, `advanced_video`
   - **Ultra Plan**:
     - Name: `Ultra`, Slug: `ultra`
     - Monthly Price: $30.00 (`$30/month`)
     - Annual Price: $300.00 (`$300/year`)
     - Features: Select all 6 features

---

## 6. Code Integration & Feature Gating

In your Next.js application, use feature entitlement checks instead of checking plan slugs:

### Server Component / Server Action Gating
```typescript
import { auth } from '@clerk/nextjs/server';

export async function generateAiImageAction() {
  const { has } = await auth();

  if (!has({ feature: 'image_ai' })) {
    throw new Error('AI Image Generation requires a Pro or Ultra subscription.');
  }

  // AI image processing logic...
}
```

### Client Component Protection
```tsx
import { Protect } from '@clerk/nextjs';

export function SubtitleSection() {
  return (
    <Protect
      feature="subtitle_overlay"
      fallback={<p>Upgrade to Ultra to unlock automated subtitle overlays.</p>}
    >
      <SubtitleEditorComponent />
    </Protect>
  );
}
```
