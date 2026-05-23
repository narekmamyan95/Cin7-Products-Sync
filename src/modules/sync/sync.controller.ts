import type { Request, Response } from 'express';
import { syncService } from './sync.service';

export const syncController = {
  start: async (_req: Request, res: Response) => {
    const result = await syncService.startSync();

    if (!result.accepted) {
      res.status(200).json({
        status: 'already_running',
        sync: result.state
      });
      return;
    }

    res.status(202).json({
      status: 'accepted',
      sync: result.state
    });
  },

  status: async (_req: Request, res: Response) => {
    res.json(syncService.getStatus());
  }
};
