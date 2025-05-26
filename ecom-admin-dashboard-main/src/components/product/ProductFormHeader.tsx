import React from 'react';
import { Link } from 'react-router-dom';

interface ProductFormHeaderProps {
    productId?: string;
    productName?: string;
    isEditMode: boolean;
}

const ProductFormHeader: React.FC<ProductFormHeaderProps> = ({ productId, productName, isEditMode }) => {
    const title = isEditMode ? `Edit Product: ${productName || ''}` : 'Create New Product';
    const cancelLink = isEditMode && productId ? `/admin/products/${productId}` : '/admin/products';

    return (
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">{title}</h2>
            <Link
                to={cancelLink}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-300 
                hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-sm"
            >
                Cancel
            </Link>
        </div>
    );
};

export default ProductFormHeader;