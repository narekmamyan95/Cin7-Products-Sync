import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import type { ProductListQuery, ProductUpsertInput } from './product.types';

const toPrismaDecimal = (value: number | null): Prisma.Decimal | null => {
  return value === null ? null : new Prisma.Decimal(value);
};

export const productRepository = {
  count: () => {
    return prisma.product.count();
  },

  list: ({ page, limit }: ProductListQuery) => {
    return prisma.product.findMany({
      orderBy: { id: 'asc' },
      skip: (page - 1) * limit,
      take: limit
    });
  },

  upsertMany: async (products: ProductUpsertInput[]) => {
    await prisma.$transaction(
      products.map((product) =>
        prisma.product.upsert({
          where: { cin7Id: product.cin7Id },
          update: {
            name: product.name,
            sku: product.sku,
            brand: product.brand,
            price: toPrismaDecimal(product.price),
            lastSync: product.lastSync
          },
          create: {
            cin7Id: product.cin7Id,
            name: product.name,
            sku: product.sku,
            brand: product.brand,
            price: toPrismaDecimal(product.price),
            lastSync: product.lastSync
          }
        })
      )
    );

    return products.length;
  }
};
