export type SyncStatus = 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export type SyncState = {
  status: SyncStatus;
  totalFetched: number;
  totalSaved: number;
  startedAt: string | null;
  finishedAt: string | null;
  errorMessage: string | null;
};

export type SyncProgressUpdate = {
  totalFetched?: number;
  totalSaved?: number;
};
