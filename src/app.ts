import cors from 'cors';
import express from 'express';
import path from 'node:path';
import pinoHttp from 'pino-http';
import { logger } from './config/logger';
import { errorHandler } from './infrastructure/http/errorHandler';
import { productRoutes } from './modules/products/product.routes';
import { syncRoutes } from './modules/sync/sync.routes';

export const app = express();

app.use(pinoHttp({ logger }));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/products', productRoutes);
app.use('/sync', syncRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sync', syncRoutes);
app.use(errorHandler);
