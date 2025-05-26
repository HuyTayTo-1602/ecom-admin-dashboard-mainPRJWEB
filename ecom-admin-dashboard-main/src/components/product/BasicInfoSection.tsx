import React from 'react';
import { Product } from '../../types/product.types';

interface BasicInfoSectionProps {
    product: Partial<Product>;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ product, onChange }) => {
    return (
        <fieldset className="transition-colors duration-200">
            <legend className="text-lg font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-200">Basic Information</legend>
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">Product Name *</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={product.name || ''}
                        onChange={onChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 
                        transition-colors duration-200"
                    />
                </div>
                <div>
                    <label htmlFor="sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">SKU</label>
                    <input
                        id="sku"
                        name="sku"
                        type="text"
                        value={product.sku || ''}
                        onChange={onChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 
                        transition-colors duration-200"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">Description *</label>
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        required
                        value={product.description || ''}
                        onChange={onChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 
                        transition-colors duration-200"
                    />
                </div>
            </div>
        </fieldset>
    );
};

export default BasicInfoSection;