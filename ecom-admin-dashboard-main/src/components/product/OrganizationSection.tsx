import React from 'react';
import { Product, Category } from '../../types/product.types';

interface OrganizationSectionProps {
    product: Partial<Product>;
    categories: Category[];
    selectedCategory: Category | null;
    onCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const OrganizationSection: React.FC<OrganizationSectionProps> = ({
    product,
    categories,
    selectedCategory,
    onCategoryChange,
    onStatusChange
}) => {
    return (
        <fieldset className="transition-colors duration-200">
            <legend className="text-lg font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-200">Organization</legend>
            <div className="space-y-4">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">Category</label>
                    <select
                        id="category"
                        name="category"
                        value={typeof product.category === 'string' ? product.category : product.category?._id || ''}
                        onChange={onCategoryChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 
                        transition-colors duration-200"
                    >
                        <option value="">Select a category...</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                    {selectedCategory?.description && 
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                            {selectedCategory.description}
                        </p>
                    }
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={product.status || 'draft'}
                        onChange={onStatusChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 
                        transition-colors duration-200"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
            </div>
        </fieldset>
    );
};

export default OrganizationSection;