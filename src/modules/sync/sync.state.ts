import { Mutex } from 'async-mutex';
import type { SyncProgressUpdate, SyncState } from './sync.types';

const createIdleState = (): SyncState => ({
  status: 'IDLE',
  totalFetched: 0,
  totalSaved: 0,
  startedAt: null,
  finishedAt: null,
  errorMessage: null
});

let currentSyncState: SyncState = createIdleState();

export const syncMutex = new Mutex();

export const syncStateStore = {
  get: (): SyncState => {
    return { ...currentSyncState };
  },

  markRunning: (): SyncState => {
    currentSyncState = {
      status: 'RUNNING',
      totalFetched: 0,
      totalSaved: 0,
      startedAt: new Date().toISOString(),
      finishedAt: null,
      errorMessage: null
    };

    return syncStateStore.get();
  },

  updateProgress: (progress: SyncProgressUpdate): SyncState => {
    currentSyncState = {
      ...currentSyncState,
      ...progress
    };

    return syncStateStore.get();
  },

  markCompleted: (): SyncState => {
    currentSyncState = {
      ...currentSyncState,
      status: 'COMPLETED',
      finishedAt: new Date().toISOString(),
      errorMessage: null
    };

    return syncStateStore.get();
  },

  markFailed: (error: unknown): SyncState => {
    currentSyncState = {
      ...currentSyncState,
      status: 'FAILED',
      finishedAt: new Date().toISOString(),
      errorMessage: error instanceof Error ? error.message : 'Unknown sync error'
    };

    return syncStateStore.get();
  },

  reset: (): SyncState => {
    currentSyncState = createIdleState();
    return syncStateStore.get();
  }
};
