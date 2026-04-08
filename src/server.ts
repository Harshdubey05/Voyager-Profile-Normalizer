/**
 * Voyager Profile Normalizer — Entry Point
 *
 * High-performance Fastify server that normalizes raw LinkedIn profile JSON
 * into clean, standardized data structures.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { normalizeRoutes } from './routes/normalize.route.js';

const PORT = parseInt(process.env.PORT ?? '3210', 10);
const HOST = process.env.HOST ?? '0.0.0.0';

async function bootstrap(): Promise<void> {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
    // Performance tuning
    bodyLimit: 1_048_576, // 1 MB max body
    caseSensitive: true,
    requestTimeout: 10_000,
  });

  // ── Plugins ───────────────────────────────────────────────────
  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS'],
  });

  // ── Routes ────────────────────────────────────────────────────
  await fastify.register(normalizeRoutes);

  // ── Global Error Handler ──────────────────────────────────────
  fastify.setErrorHandler((error: { validation?: unknown; statusCode?: number; message: string }, _request, reply) => {
    fastify.log.error(error);

    if (error.validation) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: error.message,
      });
    }

    return reply.status(error.statusCode ?? 500).send({
      error: 'INTERNAL_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'An internal error occurred.'
          : error.message,
    });
  });

  // ── Start ─────────────────────────────────────────────────────
  try {
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`🚀 Voyager Profile Normalizer running at http://${HOST}:${PORT}`);
    fastify.log.info(`📖 POST http://localhost:${PORT}/api/v1/normalize`);
    fastify.log.info(`💚 GET  http://localhost:${PORT}/api/v1/health`);
  } catch (err) {
    fastify.log.fatal(err);
    process.exit(1);
  }
}

bootstrap();
