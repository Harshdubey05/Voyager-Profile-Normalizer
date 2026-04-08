/**
 * Request validation schemas using Zod.
 */

import { z } from 'zod';

/**
 * The POST body schema. We accept any JSON object — the normalizer
 * will detect the profile type and clean what it can.
 *
 * We enforce that it must be a non-null object (not an array, string, etc.)
 */
export const NormalizeRequestSchema = z
  .record(z.string(), z.unknown())
  .refine((val) => val !== null && typeof val === 'object' && !Array.isArray(val), {
    message: 'Request body must be a JSON object',
  });

export type NormalizeRequest = z.infer<typeof NormalizeRequestSchema>;

/**
 * Optional query parameters for the normalize endpoint.
 */
export const NormalizeQuerySchema = z.object({
  /** Force a specific profile type instead of auto-detecting */
  type: z.enum(['full', 'mini']).optional(),
});

export type NormalizeQuery = z.infer<typeof NormalizeQuerySchema>;
