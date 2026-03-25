/**
 * Server-side helper for loading site images from Convex storage.
 * Falls back to legacy /public/images/ paths if Convex image not found.
 *
 * Usage in Server Components:
 *   const img = await loadSiteImages(["hero/og-image", "team/training-group-1"]);
 *   <Image src={img["hero/og-image"]} ... />
 */

import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";

type ImageData = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

/**
 * Load multiple site images by key.
 * Returns Record<key, ImageData> with fallback to legacy /images/ path.
 */
export async function loadSiteImages(
  keys: string[],
): Promise<Record<string, ImageData>> {
  const result: Record<string, ImageData> = {};

  try {
    const convexImages = await fetchQuery(api.siteImages.getByKeys, { keys });
    for (const key of keys) {
      if (convexImages[key]?.url) {
        result[key] = convexImages[key];
      } else {
        // Fallback to legacy static path
        result[key] = { url: `/images/${key}` };
      }
    }
  } catch {
    // Convex unavailable — fallback all to static
    for (const key of keys) {
      result[key] = { url: `/images/${key}` };
    }
  }

  return result;
}

/**
 * Load a single site image. Returns URL string with fallback.
 */
export async function loadSiteImage(key: string): Promise<string> {
  const images = await loadSiteImages([key]);
  return images[key]?.url ?? `/images/${key}`;
}
