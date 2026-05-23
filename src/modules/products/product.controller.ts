import type { Request, Response } from 'express';
import { productService } from './product.service';

export const productController = {
  list: async (req: Request, res: Response) => {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);

    const result = await productService.listProducts({
      page: Number.isFinite(page) ? page : undefined,
      limit: Number.isFinite(limit) ? limit : undefined
    });

    res.json(result);
  }
};
