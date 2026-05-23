import { Router } from 'express';
import { asyncHandler } from '../../infrastructure/http/asyncHandler';
import { productController } from './product.controller';

export const productRoutes = Router();

productRoutes.get('/', asyncHandler(productController.list));
