import { Recipe } from './recipe';

export interface EntitlementCheckResult {
  allowed: boolean;
  requiredFeatures: string[];
  missingFeatures: string[];
}

/**
 * Returns all Clerk feature slugs required to execute a given transformation recipe.
 */
export function getRequiredFeaturesForRecipe(recipe?: Recipe | null, mediaKind?: 'image' | 'video'): string[] {
  const features = new Set<string>();
  
  // Every edit or preview requires basic_editor entitlement
  features.add('basic_editor');

  if (!recipe) return Array.from(features);

  // Audio Extraction (Ultra Feature)
  if (recipe.extractAudio) {
    features.add('audio_extraction');
  }

  // Subtitle Overlay (Ultra Feature)
  if (recipe.subtitleUrl) {
    features.add('subtitle_overlay');
  }

  // Background Removal (Pro / AI Feature)
  if (recipe.bgRemove) {
    features.add('image_ai');
    features.add('advanced_image');
  }

  // Advanced Image Overlays & Filters (Pro Feature)
  if (recipe.textOverlay || recipe.watermark || recipe.colorOverlay || (recipe.blur !== undefined && recipe.blur > 0)) {
    features.add('advanced_image');
  }

  // Advanced Video Transformations (Pro Feature)
  if (mediaKind === 'video') {
    if (recipe.aspectRatio || (recipe.rotate !== undefined && recipe.rotate > 0) || recipe.watermark) {
      features.add('advanced_video');
    }
  } else {
    // If aspect ratio or rotate specified on images beyond basic defaults
    if (recipe.aspectRatio) {
      features.add('advanced_image');
    }
  }

  return Array.from(features);
}

/**
 * Checks whether the user (via `has({ feature: 'slug' })`) possesses all required features for a recipe.
 */
export function checkRecipeEntitlements(
  has: (params: { feature: string }) => boolean,
  recipe?: Recipe | null,
  mediaKind?: 'image' | 'video'
): EntitlementCheckResult {
  const requiredFeatures = getRequiredFeaturesForRecipe(recipe, mediaKind);
  const missingFeatures: string[] = [];

  for (const feature of requiredFeatures) {
    if (!has({ feature })) {
      missingFeatures.push(feature);
    }
  }

  return {
    allowed: missingFeatures.length === 0,
    requiredFeatures,
    missingFeatures,
  };
}
