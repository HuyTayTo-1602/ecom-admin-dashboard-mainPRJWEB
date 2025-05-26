import { Product } from './product.types';

export interface VariationAttribute {
  name: string;
  type: string;
  value: string;
}

export interface ProductVariation {
  _id: string;
  product: string | Product;
  name: string;
  sku?: string;
  price: number;
  stock: number;
  attributes: VariationAttribute[];
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateVariationPayload {
  name: string;
  sku?: string;
  price: number;
  stock: number;
  attributes: VariationAttribute[];
  images?: string[];
}

export interface UpdateVariationPayload {
  name?: string;
  sku?: string;
  price?: number;
  stock?: number;
  attributes?: VariationAttribute[];
  images?: string[];
}