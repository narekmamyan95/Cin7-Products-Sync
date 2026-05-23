import type { ProductUpsertInput } from '../products/product.types';
import type { Cin7Product } from './cin7.types';

export const mapCin7Product = (
  product: Cin7Product,
  syncedAt = new Date()
): ProductUpsertInput => {
  return {
    cin7Id: product.ID,
    name: product.Name,
    sku: product.SKU,
    brand: product.Brand,
    price: product.PriceTiers?.Retail ?? null,
    lastSync: syncedAt
  };
};
