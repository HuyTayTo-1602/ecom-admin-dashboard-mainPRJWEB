import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../services/axios';
import { useUser } from '../../hooks/useUser';
import { useUserData } from '../../hooks/useUserData';
import { Product } from '../../types/product.types';

type ExtendedProduct = Product & {
  createdByName?: string;
  categoryName?: string;
}

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { accessToken } = useUser();
  
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    location.state?.message || null
  );
  
  // Fetch product data with React Query
  const { 
    data: product,
    isLoading: productLoading,
    error: productError,
    refetch: refetchProduct
  } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/product/${id}`, {
        headers: { "cache-control": "no-cache" }
      });
      return response.data as ExtendedProduct;
    },
    enabled: !!id && !!accessToken,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  // Fetch category data if needed
  const {
    data: category,
    isLoading: categoryLoading
  } = useQuery({
    queryKey: ['category', product?.category],
    queryFn: async () => {
      const response = await axiosInstance.get(`/product/category/${product?.category}`);
      return response.data;
    },
    enabled: !!product?.category && !product?.category.name,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Use the custom hook to fetch user data
  const {
    data: userData,
    isLoading: userLoading
  } = useUserData(product?.createdBy);
  
  // Combined loading state
  const loading = productLoading || 
    (product?.category && !product?.category.name && categoryLoading) || 
    (product?.createdBy && !product?.createdByName && userLoading);
  
  // Error from product query
  const error = productError ? 'Failed to load product details' : null;
  
  // Create extended product with user and category names
  const extendedProduct = product ? {
    ...product,
    createdByName: userData?.name || 'Unknown User',
    categoryName: category?.name || 'None'
  } : null;
  
  useEffect(() => {
    // Clear success message after 5 seconds
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await axiosInstance.delete(`/product/${id}`);
      // Invalidate products list query
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/admin/products', { 
        replace: true, 
        state: { message: 'Product successfully deleted' } 
      });
    } catch (err) {
      console.error('Error deleting product:', err);
      setIsDeleting(false);
      // Refetch to ensure our local data is in sync
      refetchProduct();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400 transition-colors duration-200"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800 text-center transition-colors duration-200">
        <p className="text-red-600 dark:text-red-400 mb-4 transition-colors duration-200">{error}</p>
        <Link 
          to="/admin/products" 
          className="text-blue-500 dark:text-blue-400 hover:underline transition-colors duration-200"
        >
          Return to Products
        </Link>
      </div>
    );
  }

  if (!extendedProduct) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800 text-center transition-colors duration-200">
        <p className="text-yellow-700 dark:text-yellow-400 mb-4 transition-colors duration-200">Product not found</p>
        <Link 
          to="/admin/products" 
          className="text-blue-500 dark:text-blue-400 hover:underline transition-colors duration-200"
        >
          Return to Products
        </Link>
      </div>
    );
  }

  const hasImages = extendedProduct.productImages && extendedProduct.productImages.length > 0;

  return (
    <div className="flex">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 mb-6 transition-colors duration-200">
            {successMessage}
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">{extendedProduct.name}</h2>
          <div className="flex space-x-3">
            <Link
              to={`/admin/products/edit/${id}`}
              className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded hover:bg-red-600 dark:hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
        <div className="flex flex-col">
          {/* Product Image Gallery */}
          {hasImages && (
            <div className="flex gap-2">
              <div className="relative aspect-w-16 aspect-h-9 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden transition-colors duration-200">
                <img
                  src={extendedProduct.productImages && extendedProduct.productImages[activeImageIndex] || "placeholder.jpg"}
                  alt={extendedProduct.name}
                  className="object-cover w-full"
                />
              </div>
              {extendedProduct.productImages && extendedProduct.productImages.length > 1 && (
                <div className="flex items-center justify-center">
                  <div className="grid grid-cols-5 gap-2 h-fit">
                    {extendedProduct.productImages.map((image, index) => (
                      <div
                        key={index}
                        className={`cursor-pointer border-2 rounded-md overflow-hidden h-fit ${
                          index === activeImageIndex ? 'border-blue-500 dark:border-blue-400' : 'border-transparent'
                        } transition-colors duration-200`}
                        onClick={() => setActiveImageIndex(index)}
                      >
                        <img
                          src={image || "placeholder.jpg"}
                          alt={`Thumbnail ${index + 1}`}
                          className="h-24 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2 transition-colors duration-200">Description</h3>
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">{extendedProduct.description}</p>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2 transition-colors duration-200">Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Category</p>
                    <p className="text-gray-800 dark:text-gray-200 transition-colors duration-200">{extendedProduct.categoryName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Created By</p>
                    <p className="text-gray-800 dark:text-gray-200 transition-colors duration-200">{extendedProduct.createdByName}</p>
                  </div>
                  {extendedProduct.updatedAt && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Last Updated</p>
                      <p className="text-gray-800 dark:text-gray-200 transition-colors duration-200">{new Date(extendedProduct.updatedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
              {/* Display custom fields if they exist */}
              {extendedProduct.fields && Object.keys(extendedProduct.fields).length > 0 && (
                <>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2 transition-colors duration-200">Specifications</h3>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg transition-colors duration-200">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                      {Object.entries(extendedProduct.fields).map(([name, value]) => (
                        <div key={name} className="py-2">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">{name}</dt>
                          <dd className="mt-1 text-sm text-gray-900 dark:text-white transition-colors duration-200">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </>
              )}
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg transition-colors duration-200">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4 transition-colors duration-200">Pricing & Inventory</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{extendedProduct.price.toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="space-y-3">
                {extendedProduct.stock !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Stock</p>
                    <p className="text-gray-900 dark:text-white transition-colors duration-200">{extendedProduct.stock} units</p>
                  </div>
                )}
                {extendedProduct.sku && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">SKU</p>
                    <p className="text-gray-900 dark:text-white transition-colors duration-200">{extendedProduct.sku}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    extendedProduct.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                    extendedProduct.status === 'inactive' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                  } transition-colors duration-200`}>
                    {extendedProduct.status === 'active' ? 'Active' :
                     extendedProduct.status === 'inactive' ? 'Inactive' : 'Draft'}
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">Product ID</h4>
                <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-300 transition-colors duration-200">{extendedProduct._id}</code>
              </div>
            </div>
          </div>
        </div>
        
        {/* Variations Section - only shown if product has variations */}
        {extendedProduct.hasVariations && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-4 transition-colors duration-200">Product Variations</h3>
            <div className="bg-white dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              {/* If you have variations data, map through it here */}
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                    This product has multiple variations (e.g. different sizes, colors)
                  </p>
                  <Link
                    to={`/admin/products/edit/${id}?tab=variations`}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200"
                  >
                    Manage Variations
                  </Link>
                </div>
                
                {/* This would be replaced with your actual variations data */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 transition-colors duration-200">
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4 transition-colors duration-200">
                    To view or edit variations, click "Manage Variations"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <Link
            to="/admin/products"
            className="text-blue-500 dark:text-blue-400 hover:underline flex items-center transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;