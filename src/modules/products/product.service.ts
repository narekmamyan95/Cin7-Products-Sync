import type { Product } from '@prisma/client';
import { productRepository } from './product.repository';
import type { ProductDto, ProductListQuery, ProductListResponse } from './product.types';

const CIN7_PRODUCT_URL = 'https://inventory.dearsystems.com/Product';

const normalizeListQuery = (query: Partial<ProductListQuery>): ProductListQuery => {
  const page = Math.floor(query.page ?? 1);
  const limit = Math.floor(query.limit ?? 50);

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit))
  };
};

const toProductDto = (product: Product): ProductDto => {
  return {
    id: product.id,
    cin7Id: product.cin7Id,
    name: product.name,
    sku: product.sku,
    brand: product.brand,
    price: product.price?.toString() ?? null,
    lastSync: product.lastSync.toISOString(),
    cin7Url: `${CIN7_PRODUCT_URL}#${product.cin7Id}`
  };
};

export const productService = {
  listProducts: async (query: Partial<ProductListQuery>): Promise<ProductListResponse> => {
    const normalizedQuery = normalizeListQuery(query);
    const [items, total] = await Promise.all([
      productRepository.list(normalizedQuery),
      productRepository.count()
    ]);

    return {
      items: items.map(toProductDto),
      total,
      page: normalizedQuery.page,
      limit: normalizedQuery.limit
    };
  },

  upsertMany: productRepository.upsertMany
};
