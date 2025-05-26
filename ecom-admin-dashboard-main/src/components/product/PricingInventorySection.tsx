import React, { useState, useEffect } from 'react';
import { Product } from '../../types/product.types';

interface PricingInventorySectionProps {
    product: Partial<Product>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PricingInventorySection: React.FC<PricingInventorySectionProps> = ({ product, onChange }) => {
    const [formattedPrice, setFormattedPrice] = useState<string>(
        product.price ? product.price.toLocaleString('vi-VN') : ''
    );

    useEffect(() => {
        if (product.price !== undefined) {
            setFormattedPrice(product.price.toLocaleString('vi-VN'));
        } else {
            setFormattedPrice('');
        }
    }, [product.price]);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^\d]/g, '');
        
        if (rawValue) {
            setFormattedPrice(parseInt(rawValue).toLocaleString('vi-VN'));
        } else {
            setFormattedPrice('');
        }
        
        // Create a synthetic event to pass to the parent's onChange handler
        const syntheticEvent = {
            ...e,
            target: {
                ...e.target,
                name: 'price',
                value: rawValue ? parseInt(rawValue).toString() : '0'
            }
        };
        
        onChange(syntheticEvent);
    };

    return (
        <fieldset className="transition-colors duration-200">
            <legend className="text-lg font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-200">
                Pricing & Inventory
            </legend>
            <div className="space-y-4">
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                        Price *
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400 transition-colors duration-200">
                            ₫
                        </span>
                        <input
                            id="price"
                            name="price"
                            type="text"
                            value={formattedPrice}
                            onChange={handlePriceChange}
                            className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                            focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 
                            transition-colors duration-200"
                            required
                            placeholder="0"
                        />
                    </div>
                </div>
                
                <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                        Stock
                    </label>
                    <input
                        id="stock"
                        name="stock"
                        type="number"
                        value={product.stock || ''}
                        onChange={onChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 
                        transition-colors duration-200"
                        placeholder="0"
                    />
                </div>
            </div>
        </fieldset>
    );
};

export default PricingInventorySection;