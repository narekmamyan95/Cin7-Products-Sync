import baseProductsResponse from '../../../docs/fixtures/cin7-products-page-1.json';
import type { Cin7Product, Cin7ProductsResponse } from './cin7.types';

const MOCK_PRODUCTS_TOTAL = 4000;

const baseProducts = baseProductsResponse.Products as Cin7Product[];

const createMockProduct = (index: number): Cin7Product => {
  const baseProduct = baseProducts[index % baseProducts.length];
  const sequence = index + 1;
  const price = Number((sequence % 250) / 10);

  return {
    ...baseProduct,
    ID: `${baseProduct.ID}-${sequence}`,
    SKU: baseProduct.SKU ? `${baseProduct.SKU}-${sequence}` : null,
    Name: `${baseProduct.Name} ${sequence}`,
    PriceTiers: {
      ...baseProduct.PriceTiers,
      Retail: price
    }
  };
};

const mockProducts = Array.from({ length: MOCK_PRODUCTS_TOTAL }, (_item, index) =>
  createMockProduct(index)
);

export const cin7MockSource = {
  getProductsPage: async (page: number, limit: number): Promise<Cin7ProductsResponse> => {
    const normalizedPage = Math.max(1, page);
    const normalizedLimit = Math.max(1, limit);
    const start = (normalizedPage - 1) * normalizedLimit;
    const end = start + normalizedLimit;

    return {
      Total: mockProducts.length,
      Page: normalizedPage,
      Products: mockProducts.slice(start, end)
    };
  }
};
