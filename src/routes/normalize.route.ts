/**
 * Normalize route handler.
 *
 * POST /api/v1/normalize
 *
 * Accepts raw LinkedIn profile JSON and returns cleaned, standardized data.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { NormalizeRequestSchema, NormalizeQuerySchema } from '../schemas/normalize.schema.js';
import {
  detectProfileType,
  normalizeFullProfile,
  normalizeMiniProfile,
} from '../services/normalizer.service.js';
import type { RawLinkedInProfile, RawMiniProfile } from '../types/profile.types.js';

export async function normalizeRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /api/v1/normalize
   *
   * Query params:
   *   - type?: "full" | "mini"  (force a profile type, otherwise auto-detect)
   *
   * Body: Raw LinkedIn profile JSON
   *
   * Returns: Cleaned, normalized profile JSON
   */
  fastify.post(
    '/api/v1/normalize',
    async (
      request: FastifyRequest<{
        Body: Record<string, unknown>;
        Querystring: { type?: string };
      }>,
      reply: FastifyReply,
    ) => {
      // ── Validate body ───────────────────────────────────────────
      const bodyResult = NormalizeRequestSchema.safeParse(request.body);
      if (!bodyResult.success) {
        return reply.status(400).send({
          error: 'INVALID_BODY',
          message: 'Request body must be a non-empty JSON object.',
          details: bodyResult.error.issues,
        });
      }

      const body = bodyResult.data;

      // ── Validate query params ───────────────────────────────────
      const queryResult = NormalizeQuerySchema.safeParse(request.query);
      if (!queryResult.success) {
        return reply.status(400).send({
          error: 'INVALID_QUERY',
          message: 'Invalid query parameters.',
          details: queryResult.error.issues,
        });
      }

      const { type: forcedType } = queryResult.data;

      // ── Detect profile type ─────────────────────────────────────
      const profileType = forcedType ?? detectProfileType(body);

      if (profileType === 'unknown') {
        return reply.status(422).send({
          error: 'UNRECOGNIZED_PROFILE',
          message:
            'Could not determine the profile type. The input does not match a known LinkedIn profile structure. ' +
            'Use the ?type=full or ?type=mini query parameter to force a specific type.',
        });
      }

      // ── Normalize ───────────────────────────────────────────────
      const startTime = performance.now();

      let result;
      if (profileType === 'mini') {
        result = normalizeMiniProfile(body as unknown as RawMiniProfile);
      } else {
        result = normalizeFullProfile(body as unknown as RawLinkedInProfile);
      }

      const durationMs = Math.round((performance.now() - startTime) * 100) / 100;

      // ── Response ────────────────────────────────────────────────
      return reply.status(200).send({
        success: true,
        profileType,
        processingTimeMs: durationMs,
        data: result,
      });
    },
  );

  /**
   * GET /api/v1/health
   *
   * Simple health check endpoint.
   */
  fastify.get('/api/v1/health', async (_request, reply) => {
    return reply.status(200).send({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });
}
