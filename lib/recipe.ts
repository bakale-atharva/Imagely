export interface Recipe {
  width?: number;
  height?: number;
  crop?: string;
  quality?: number;
  format?: string;
  bgRemove?: boolean;
  watermark?: string;
  blur?: number;
  rotate?: number;
  aspectRatio?: string | number;
  mute?: boolean;
  [key: string]: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  normalizedRecipe?: Recipe;
}

const ALLOWED_CROP_MODES = [
  'maintain_ratio',
  'force',
  'at_max',
  'at_least',
  'extract',
  'pad_resize',
  'crop_extract',
];

const ALLOWED_FORMATS = [
  'auto',
  'webp',
  'png',
  'jpg',
  'jpeg',
  'avif',
  'gif',
  'mp4',
  'webm',
];

const ALLOWED_ROTATIONS = [0, 90, 180, 270, 360];

const ALLOWED_RECIPE_KEYS = new Set([
  'width',
  'w',
  'height',
  'h',
  'crop',
  'c',
  'quality',
  'q',
  'format',
  'f',
  'bgRemove',
  'bg_remove',
  'backgroundRemoval',
  'watermark',
  'blur',
  'b',
  'rotate',
  'rt',
  'aspectRatio',
  'ar',
  'mute',
]);

/**
 * Validates a normalized, allow-listed transformation recipe.
 */
export function validateRecipe(recipe: unknown): ValidationResult {
  if (!recipe || typeof recipe !== 'object' || Array.isArray(recipe)) {
    return {
      valid: false,
      errors: ['Recipe must be a non-null object.'],
    };
  }

  const errors: string[] = [];
  const normalizedRecipe: Recipe = {};
  const rec = recipe as Record<string, unknown>;

  for (const key of Object.keys(rec)) {
    if (!ALLOWED_RECIPE_KEYS.has(key)) {
      errors.push(`Disallowed parameter: '${key}'`);
    }
  }

  // Validate Width
  const widthVal = rec.width ?? rec.w;
  if (widthVal !== undefined) {
    if (typeof widthVal !== 'number' || !Number.isInteger(widthVal) || widthVal < 1 || widthVal > 10000) {
      errors.push('Width must be an integer between 1 and 10000.');
    } else {
      normalizedRecipe.width = widthVal;
    }
  }

  // Validate Height
  const heightVal = rec.height ?? rec.h;
  if (heightVal !== undefined) {
    if (typeof heightVal !== 'number' || !Number.isInteger(heightVal) || heightVal < 1 || heightVal > 10000) {
      errors.push('Height must be an integer between 1 and 10000.');
    } else {
      normalizedRecipe.height = heightVal;
    }
  }

  // Validate Crop
  const cropVal = rec.crop ?? rec.c;
  if (cropVal !== undefined) {
    if (typeof cropVal !== 'string' || !ALLOWED_CROP_MODES.includes(cropVal)) {
      errors.push(`Crop must be one of: ${ALLOWED_CROP_MODES.join(', ')}.`);
    } else {
      normalizedRecipe.crop = cropVal;
    }
  }

  // Validate Quality
  const qualityVal = rec.quality ?? rec.q;
  if (qualityVal !== undefined) {
    if (typeof qualityVal !== 'number' || !Number.isInteger(qualityVal) || qualityVal < 1 || qualityVal > 100) {
      errors.push('Quality must be an integer between 1 and 100.');
    } else {
      normalizedRecipe.quality = qualityVal;
    }
  }

  // Validate Format
  const formatVal = rec.format ?? rec.f;
  if (formatVal !== undefined) {
    if (typeof formatVal !== 'string' || !ALLOWED_FORMATS.includes((formatVal as string).toLowerCase())) {
      errors.push(`Format must be one of: ${ALLOWED_FORMATS.join(', ')}.`);
    } else {
      normalizedRecipe.format = (formatVal as string).toLowerCase();
    }
  }

  // Validate Background Removal
  const bgRemoveVal = rec.bgRemove ?? rec.bg_remove ?? rec.backgroundRemoval;
  if (bgRemoveVal !== undefined) {
    if (typeof bgRemoveVal !== 'boolean') {
      errors.push('bgRemove must be a boolean.');
    } else {
      normalizedRecipe.bgRemove = bgRemoveVal;
    }
  }

  // Validate Watermark
  const watermarkVal = rec.watermark;
  if (watermarkVal !== undefined) {
    if (typeof watermarkVal !== 'string' || !watermarkVal.trim()) {
      errors.push('Watermark must be a non-empty string.');
    } else {
      normalizedRecipe.watermark = watermarkVal.trim();
    }
  }

  // Validate Blur
  const blurVal = rec.blur ?? rec.b;
  if (blurVal !== undefined) {
    if (typeof blurVal !== 'number' || !Number.isInteger(blurVal) || blurVal < 1 || blurVal > 100) {
      errors.push('Blur must be an integer between 1 and 100.');
    } else {
      normalizedRecipe.blur = blurVal;
    }
  }

  // Validate Rotate
  const rotateVal = rec.rotate ?? rec.rt;
  if (rotateVal !== undefined) {
    if (typeof rotateVal !== 'number' || !ALLOWED_ROTATIONS.includes(rotateVal)) {
      errors.push(`Rotate must be one of: ${ALLOWED_ROTATIONS.join(', ')}.`);
    } else {
      normalizedRecipe.rotate = rotateVal;
    }
  }

  // Validate AspectRatio
  const arVal = rec.aspectRatio ?? rec.ar;
  if (arVal !== undefined) {
    if (typeof arVal === 'string' && /^\d+[:\-]\d+$/.test(arVal)) {
      normalizedRecipe.aspectRatio = arVal;
    } else if (typeof arVal === 'number' && arVal > 0) {
      normalizedRecipe.aspectRatio = arVal;
    } else {
      errors.push('AspectRatio must be a valid ratio string (e.g. "16:9") or positive number.');
    }
  }

  // Validate Mute
  const muteVal = rec.mute;
  if (muteVal !== undefined) {
    if (typeof muteVal !== 'boolean') {
      errors.push('Mute must be a boolean.');
    } else {
      normalizedRecipe.mute = muteVal;
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [], normalizedRecipe };
}

/**
 * Converts a validated Recipe object into an ImageKit transformation string.
 */
export function formatRecipeToTransformation(recipe: Recipe): string {
  const parts: string[] = [];

  if (recipe.width) parts.push(`w-${recipe.width}`);
  if (recipe.height) parts.push(`h-${recipe.height}`);
  if (recipe.crop) parts.push(`c-${recipe.crop}`);
  if (recipe.quality) parts.push(`q-${recipe.quality}`);
  if (recipe.format) parts.push(`f-${recipe.format}`);
  if (recipe.bgRemove) parts.push(`e-bg-remove`);
  if (recipe.blur) parts.push(`bl-${recipe.blur}`);
  if (recipe.rotate !== undefined) parts.push(`rt-${recipe.rotate}`);
  if (recipe.aspectRatio) parts.push(`ar-${String(recipe.aspectRatio).replace(':', '-')}`);
  if (recipe.watermark) parts.push(`l-image,i-${recipe.watermark},l-end`);

  return parts.join(',');
}
