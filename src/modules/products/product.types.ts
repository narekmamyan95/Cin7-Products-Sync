export type ProductListQuery = {
  page: number;
  limit: number;
};

export type ProductUpsertInput = {
  cin7Id: string;
  name: string;
  sku: string | null;
  brand: string | null;
  price: number | null;
  lastSync: Date;
};

export type ProductDto = {
  id: number;
  cin7Id: string;
  name: string;
  sku: string | null;
  brand: string | null;
  price: string | null;
  lastSync: string;
  cin7Url: string;
};

export type ProductListResponse = {
  items: ProductDto[];
  total: number;
  page: number;
  limit: number;
};
