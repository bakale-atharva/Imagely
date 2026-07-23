import crypto from 'crypto';
import { Recipe, validateRecipe, formatRecipeToTransformation } from './recipe';

export * from './recipe';

export type MediaType = 'image' | 'video';

export interface GetUploadParamsOptions {
  userId: string;
  mediaType?: MediaType;
  token?: string;
  expire?: number;
}

export interface UploadAuthResponse {
  token: string;
  signature: string;
  expire: number;
  folder: string;
  publicKey: string;
}

export interface GetSignedMediaUrlOptions {
  path: string;
  transformation?: string | Recipe;
  expirySeconds?: number;
}

/**
 * Returns ImageKit client upload authentication parameters and enforces user-isolated folder path.
 */
export function getImageKitUploadParams({
  userId,
  mediaType = 'image',
  token,
  expire,
}: GetUploadParamsOptions): UploadAuthResponse {
  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    throw new Error('userId is required to generate ImageKit upload parameters.');
  }

  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error('ImageKit keys (IMAGEKIT_PUBLIC_KEY / NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY) are missing.');
  }

  const defaultToken = token || crypto.randomUUID();
  const defaultExpire = expire || Math.floor(Date.now() / 1000) + 1800;

  const signature = crypto
    .createHmac('sha1', privateKey)
    .update(defaultToken + defaultExpire)
    .digest('hex');

  const folder = '/users/' + userId + '/' + (mediaType === 'video' ? 'videos' : 'images');

  return {
    token: defaultToken,
    signature,
    expire: defaultExpire,
    folder,
    publicKey,
  };
}

/**
 * Constructs signed ImageKit media delivery URLs with ik-t timestamp and ik-s HMAC-SHA1 signature.
 */
export function getSignedMediaUrl({
  path,
  transformation,
  expirySeconds = 3600,
}: GetSignedMediaUrlOptions): string {
  if (!path || typeof path !== 'string') {
    throw new Error('path is required to generate signed media URL.');
  }

  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!urlEndpoint || !privateKey) {
    throw new Error('ImageKit configuration (NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT and IMAGEKIT_PRIVATE_KEY) is missing.');
  }

  const baseEndpoint = urlEndpoint.replace(/\/+$/, '');

  let cleanPath = path;
  if (cleanPath.startsWith(baseEndpoint)) {
    cleanPath = cleanPath.slice(baseEndpoint.length);
  }

  let trString = '';
  if (typeof transformation === 'string' && transformation.trim()) {
    trString = transformation.trim();
    if (trString.startsWith('tr:')) {
      trString = trString.slice(3);
    }
  } else if (transformation && typeof transformation === 'object') {
    const valResult = validateRecipe(transformation);
    if (!valResult.valid) {
      throw new Error(`Invalid transformation recipe: ${valResult.errors.join(', ')}`);
    }
    if (valResult.normalizedRecipe) {
      trString = formatRecipeToTransformation(valResult.normalizedRecipe);
    }
  }

  let signingPath = encodeURI(cleanPath.replace(/^\/+/, ''));

  if (trString) {
    if (!signingPath.startsWith('tr:')) {
      signingPath = `tr:${trString}/${signingPath}`;
    }
  }

  const now = Math.floor(Date.now() / 1000);
  const ikT = expirySeconds > 1000000000 ? expirySeconds : now + expirySeconds;

  const stringToSign = signingPath + ikT;

  const ikS = crypto
    .createHmac('sha1', privateKey)
    .update(stringToSign)
    .digest('hex');

  return `${baseEndpoint}/${signingPath}?ik-t=${ikT}&ik-s=${ikS}`;
}

export interface GetSignedResponsiveSrcSetOptions {
  path: string;
  recipe?: Recipe;
  widths?: number[];
}

export function getSignedResponsiveSrcSet({
  path,
  recipe,
  widths = [240, 320, 480, 640, 960],
}: GetSignedResponsiveSrcSetOptions): string {
  return widths
    .map((width) => {
      let trString = `w-${width},q-auto,f-auto`;
      if (recipe) {
        const valResult = validateRecipe(recipe);
        if (valResult.valid && valResult.normalizedRecipe) {
          const recipeTr = formatRecipeToTransformation(valResult.normalizedRecipe);
          if (recipeTr) {
            trString = `${trString}:${recipeTr}`;
          }
        }
      }
      const signedUrl = getSignedMediaUrl({
        path,
        transformation: trString,
      });
      return `${signedUrl} ${width}w`;
    })
    .join(', ');
}

export interface GetSignedCanvasUrlOptions {
  path: string;
  recipe?: Recipe;
  containerWidth?: number;
  dpr?: number;
  maxDimensions: { width: number; height: number };
}

export function getSignedCanvasUrl({
  path,
  recipe,
  containerWidth,
  dpr,
  maxDimensions,
}: GetSignedCanvasUrlOptions): string {
  const cWidth = containerWidth || 800;
  const dRatio = dpr || 1;
  const targetWidth = Math.min(maxDimensions.width, Math.round(cWidth * dRatio));

  let trString = `w-${targetWidth},q-auto,f-auto`;
  if (recipe) {
    const valResult = validateRecipe(recipe);
    if (valResult.valid && valResult.normalizedRecipe) {
      const recipeTr = formatRecipeToTransformation(valResult.normalizedRecipe);
      if (recipeTr) {
        trString = `${trString}:${recipeTr}`;
      }
    }
  }

  return getSignedMediaUrl({
    path,
    transformation: trString,
  });
}
