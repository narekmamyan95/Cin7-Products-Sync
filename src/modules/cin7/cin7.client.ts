import { logger } from '../../config/logger';
import { withCin7RateLimit } from '../../infrastructure/http/rateLimiter';
import { withRetry } from '../../infrastructure/http/retry';
import { cin7MockSource } from './cin7.mock-source';
import type { Cin7ProductsResponse } from './cin7.types';

export const cin7Client = {
  getProductsPage: (page: number, limit: number): Promise<Cin7ProductsResponse> => {
    return withRetry(
      () => withCin7RateLimit(() => cin7MockSource.getProductsPage(page, limit)),
      {
        onRetry: (error, attempt, delayMs) => {
          logger.warn({ err: error, attempt, delayMs, page, limit }, 'Retrying Cin7 products request');
        }
      }
    );
  }
};
