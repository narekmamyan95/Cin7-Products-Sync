import { Router } from 'express';
import { asyncHandler } from '../../infrastructure/http/asyncHandler';
import { syncController } from './sync.controller';

export const syncRoutes = Router();

syncRoutes.post('/', asyncHandler(syncController.start));
syncRoutes.get('/status', asyncHandler(syncController.status));
