/**
 * Image URL resolution utilities for LinkedIn profile normalization.
 *
 * LinkedIn stores images as a rootUrl + artifact path segments at various
 * resolutions. This module picks the best resolution and constructs the URL.
 */

import type { RawImageReference } from '../types/profile.types.js';

interface VectorImageArtifact {
  width: number;
  height: number;
  fileIdentifyingUrlPathSegment: string;
}

/**
 * Resolve the best quality image URL from a LinkedIn profile picture object.
 *
 * Picks the artifact with the largest width (highest resolution).
 */
export function resolveProfilePictureUrl(
  profilePicture?: {
    displayImageReference?: {
      vectorImage?: {
        rootUrl?: string;
        artifacts?: VectorImageArtifact[];
      };
    };
  },
): string | null {
  const vector = profilePicture?.displayImageReference?.vectorImage;
  if (!vector?.rootUrl || !vector.artifacts?.length) return null;

  const best = pickBestArtifact(vector.artifacts);
  if (!best) return null;

  return `${vector.rootUrl}${best.fileIdentifyingUrlPathSegment}`;
}

/**
 * Resolve an image URL from a mini-profile image reference.
 *
 * Mini profiles use the 'com.linkedin.common.VectorImage' wrapper.
 */
export function resolveImageFromReference(ref?: RawImageReference): string | null {
  const vector = ref?.['com.linkedin.common.VectorImage'];
  if (!vector?.rootUrl || !vector.artifacts?.length) return null;

  const best = pickBestArtifact(vector.artifacts);
  if (!best) return null;

  return `${vector.rootUrl}${best.fileIdentifyingUrlPathSegment}`;
}

/**
 * Pick the artifact with the largest width from a list.
 */
function pickBestArtifact(
  artifacts: VectorImageArtifact[],
): VectorImageArtifact | null {
  if (!artifacts.length) return null;

  return artifacts.reduce((best, current) =>
    current.width > best.width ? current : best,
  );
}
