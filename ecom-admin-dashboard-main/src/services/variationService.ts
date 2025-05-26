import axiosInstance from './axios';
import { ProductVariation, CreateVariationPayload, UpdateVariationPayload } from '../types/variation.types';

/**
 * Get all variations for a product
 */
export const getProductVariations = async (productId: string, accessToken: string | null | undefined): Promise<ProductVariation[]> => {
  if (!accessToken) {
    throw new Error('Access token is required');
  }
  
  const response = await axiosInstance.get<ProductVariation[]>(
    `/product/${productId}/variations`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  return response.data;
};

/**
 * Create a new variation for a product
 */
export const createProductVariation = async (
  productId: string, 
  data: CreateVariationPayload,
  accessToken: string | null | undefined
): Promise<ProductVariation> => {
  if (!accessToken) {
    throw new Error('Access token is required');
  }
  
  const response = await axiosInstance.post<ProductVariation>(
    `/product/${productId}/variations`, 
    data,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  return response.data;
};

/**
 * Update an existing product variation
 */
export const updateProductVariation = async (
  variationId: string, 
  data: UpdateVariationPayload,
  accessToken: string | null | undefined
): Promise<ProductVariation> => {
  if (!accessToken) {
    throw new Error('Access token is required');
  }
  
  const response = await axiosInstance.put<ProductVariation>(
    `/product/variations/${variationId}`, 
    data,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  return response.data;
};

/**
 * Delete a product variation
 */
export const deleteProductVariation = async (variationId: string, accessToken: string): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(
    `/product/variations/${variationId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  return response.data;
};