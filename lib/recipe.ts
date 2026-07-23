export interface Recipe {
  width?: number;
  height?: number;
  crop?: string;
  quality?: number;
  format?: string;
  bgRemove?: boolean;
  watermark?: string;
  textOverlay?: string;
  colorOverlay?: string;
  blur?: number;
  rotate?: number;
  aspectRatio?: string | number;
  mute?: boolean;
  startSeconds?: number;
  endSeconds?: number;
  duration?: number;
  extractAudio?: boolean;
  subtitleUrl?: string;
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
  'mp3',
  'aac',
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
  'textOverlay',
  'text_overlay',
  'colorOverlay',
  'blur',
  'b',
  'rotate',
  'rt',
  'aspectRatio',
  'ar',
  'mute',
  'startSeconds',
  'so',
  'endSeconds',
  'eo',
  'duration',
  'du',
  'extractAudio',
  'subtitleUrl',
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

  // Validate Text Overlay
  const textOverlayVal = rec.textOverlay ?? rec.text_overlay;
  if (textOverlayVal !== undefined) {
    if (typeof textOverlayVal !== 'string' || !textOverlayVal.trim()) {
      errors.push('Text overlay must be a non-empty string.');
    } else {
      normalizedRecipe.textOverlay = textOverlayVal.trim();
    }
  }

  // Validate Color Overlay
  const colorOverlayVal = rec.colorOverlay;
  if (colorOverlayVal !== undefined) {
    if (typeof colorOverlayVal !== 'string' || !colorOverlayVal.trim()) {
      errors.push('Color overlay must be a non-empty string.');
    } else {
      normalizedRecipe.colorOverlay = colorOverlayVal.trim();
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

  // Validate StartSeconds
  const startVal = rec.startSeconds ?? rec.so;
  if (startVal !== undefined) {
    if (typeof startVal !== 'number' || startVal < 0) {
      errors.push('StartSeconds must be a non-negative number.');
    } else {
      normalizedRecipe.startSeconds = startVal;
    }
  }

  // Validate EndSeconds
  const endVal = rec.endSeconds ?? rec.eo;
  if (endVal !== undefined) {
    if (typeof endVal !== 'number' || endVal < 0) {
      errors.push('EndSeconds must be a non-negative number.');
    } else {
      normalizedRecipe.endSeconds = endVal;
    }
  }

  // Validate Duration
  const durVal = rec.duration ?? rec.du;
  if (durVal !== undefined) {
    if (typeof durVal !== 'number' || durVal <= 0) {
      errors.push('Duration must be a positive number.');
    } else {
      normalizedRecipe.duration = durVal;
    }
  }

  // Validate ExtractAudio
  const extractAudioVal = rec.extractAudio;
  if (extractAudioVal !== undefined) {
    if (typeof extractAudioVal !== 'boolean') {
      errors.push('ExtractAudio must be a boolean.');
    } else {
      normalizedRecipe.extractAudio = extractAudioVal;
    }
  }

  // Validate SubtitleUrl
  const subtitleUrlVal = rec.subtitleUrl;
  if (subtitleUrlVal !== undefined) {
    if (typeof subtitleUrlVal !== 'string' || !subtitleUrlVal.trim()) {
      errors.push('SubtitleUrl must be a non-empty string.');
    } else {
      normalizedRecipe.subtitleUrl = subtitleUrlVal.trim();
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

  if (recipe.extractAudio) {
    parts.push('f-mp3');
  } else if (recipe.format) {
    parts.push(`f-${recipe.format}`);
  }

  if (recipe.width) parts.push(`w-${recipe.width}`);
  if (recipe.height) parts.push(`h-${recipe.height}`);
  if (recipe.crop) parts.push(`c-${recipe.crop}`);
  if (recipe.quality) parts.push(`q-${recipe.quality}`);
  if (recipe.bgRemove) parts.push(`e-bg-remove`);
  if (recipe.blur) parts.push(`bl-${recipe.blur}`);
  if (recipe.rotate !== undefined) parts.push(`rt-${recipe.rotate}`);
  if (recipe.aspectRatio) parts.push(`ar-${String(recipe.aspectRatio).replace(':', '-')}`);
  if (recipe.mute) parts.push(`e-mute`);
  if (recipe.startSeconds !== undefined) parts.push(`so-${recipe.startSeconds}`);
  if (recipe.endSeconds !== undefined) parts.push(`eo-${recipe.endSeconds}`);
  if (recipe.duration !== undefined) parts.push(`du-${recipe.duration}`);
  if (recipe.watermark) parts.push(`l-image,i-${recipe.watermark},l-end`);
  if (recipe.textOverlay) parts.push(`l-text,i-${encodeURIComponent(recipe.textOverlay)},l-end`);
  if (recipe.subtitleUrl) parts.push(`l-subtitles,i-${recipe.subtitleUrl},l-end`);

  return parts.join(',');
}

