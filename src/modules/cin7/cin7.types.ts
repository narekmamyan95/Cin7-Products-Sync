export type Cin7Product = {
  ID: string;
  SKU: string | null;
  Name: string;
  Brand: string | null;
  PriceTiers?: {
    Retail?: number | null;
  } | null;
};

export type Cin7ProductsResponse = {
  Total: number;
  Page: number;
  Products: Cin7Product[];
};
