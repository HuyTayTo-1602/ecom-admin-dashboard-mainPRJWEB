import React, { useEffect, useState } from 'react';
import { getAllProducts } from '../../services/products';
import { ProductCard } from '../../components/product/ProductCard';
import { Link } from 'react-router-dom';

// Define the product type based on actual API response
type Product = {
  name: string;
  description: string;
  price: number;
  category: string;
  createdBy: string;
};

// Define the paginated response type
type ProductsResponse = {
  page: number;
  limit: number;
  total: number;
  products: Product[];
};

const Products: React.FC = () => {
  const [productsData, setProductsData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProducts(false)
      .then(response => setProductsData(response))
      .catch(error => {
        console.error('Failed to fetch products:', error);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Products</h2>
        <Link 
          to="/admin/products/new" 
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Add New Product
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : productsData ? (
        <>
          <div className="mb-4 text-sm text-gray-500">
            Showing {productsData.products.length} of {productsData.total} products (Page {productsData.page})
          </div>
          
          {productsData.products.length === 0 ? (
            <div className="p-8 bg-white rounded-lg shadow text-center">
              <p className="text-gray-500">No products found</p>
              <Link 
                to="/admin/products/new"
                className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Add Your First Product
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsData.products.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center text-red-500">
          Failed to load products. Please try again later.
        </div>
      )}
    </div>
  );
};

export default Products;
