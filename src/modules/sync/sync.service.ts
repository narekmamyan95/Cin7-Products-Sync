import type { MutexInterface } from 'async-mutex';
import { logger } from '../../config/logger';
import { cin7Service } from '../cin7/cin7.service';
import { mapCin7Product } from '../cin7/cin7.mapper';
import { productService } from '../products/product.service';
import { syncMutex, syncStateStore } from './sync.state';
import type { SyncState } from './sync.types';

const PRODUCTS_PAGE_LIMIT = 1000;

type StartSyncResult = {
  accepted: boolean;
  state: SyncState;
};

const shouldStopSync = (totalFetched: number, pageSize: number, total: number): boolean => {
  return pageSize === 0 || pageSize < PRODUCTS_PAGE_LIMIT || totalFetched >= total;
};

const runProductsSyncJob = async (release: MutexInterface.Releaser): Promise<void> => {
  let totalFetched = 0;
  let totalSaved = 0;
  let page = 1;

  try {
    logger.info('Products sync started');

    while (true) {
      logger.info({ page, limit: PRODUCTS_PAGE_LIMIT }, 'Fetching products page');

      const response = await cin7Service.getProductsPage(page, PRODUCTS_PAGE_LIMIT);
      const products = response.Products;
      const syncedAt = new Date();
      const mappedProducts = products.map((product) => mapCin7Product(product, syncedAt));
      const savedCount = await productService.upsertMany(mappedProducts);

      totalFetched += products.length;
      totalSaved += savedCount;
      syncStateStore.updateProgress({ totalFetched, totalSaved });

      logger.info(
        {
          page,
          fetched: products.length,
          saved: savedCount,
          totalFetched,
          totalSaved,
          total: response.Total
        },
        'Products page synced'
      );

      if (shouldStopSync(totalFetched, products.length, response.Total)) {
        break;
      }

      page += 1;
    }

    syncStateStore.markCompleted();
    logger.info({ totalFetched, totalSaved }, 'Products sync completed');
  } catch (error) {
    syncStateStore.markFailed(error);
    logger.error({ err: error }, 'Products sync failed');
  } finally {
    release();
  }
};

export const syncService = {
  startSync: async (): Promise<StartSyncResult> => {
    if (syncMutex.isLocked()) {
      return {
        accepted: false,
        state: syncStateStore.get()
      };
    }

    const release = await syncMutex.acquire();
    const state = syncStateStore.markRunning();

    void runProductsSyncJob(release);

    return {
      accepted: true,
      state
    };
  },

  getStatus: (): SyncState => {
    return syncStateStore.get();
  }
};
