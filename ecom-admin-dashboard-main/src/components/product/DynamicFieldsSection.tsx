import React from 'react';
import { Category, FieldValues } from '../../types/product.types';

interface DynamicFieldsSectionProps {
    selectedCategory: Category | null;
    dynamicFieldValues: FieldValues[];
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const DynamicFieldsSection: React.FC<DynamicFieldsSectionProps> = ({
    selectedCategory,
    dynamicFieldValues,
    onChange
}) => {
    if (!selectedCategory || selectedCategory.fields.length === 0) {
        return null;
    }

    return (
        <fieldset className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <legend className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3 transition-colors duration-200">
                {selectedCategory.name} Specifications
            </legend>
            <div className="space-y-4">
                {selectedCategory.fields.map((categoryField) => {
                    // Use field._id as it's defined in the Category type
                    let currentFieldValue: string | number = ''; // Initialize with default value
                    if (categoryField.type === "String") {
                        currentFieldValue = Array.isArray(dynamicFieldValues)
                            ? dynamicFieldValues.find(df => df.name === categoryField.name)?.value || ''
                            : '';
                    } else if (categoryField.type === "Number") {
                        currentFieldValue = Array.isArray(dynamicFieldValues)
                            ? dynamicFieldValues.find(df => df.name === categoryField.name)?.value || 0
                            : 0;
                    }
                    
                    const inputId = `field-${categoryField.name}`;
                    
                    return (
                        <div key={categoryField._id || categoryField.name} className="space-y-1">
                            <label 
                                htmlFor={inputId} 
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200"
                            >
                                {categoryField.name}
                                {categoryField.required && <span className="text-red-600 dark:text-red-400 ml-1 transition-colors duration-200">*</span>}
                            </label>
                            
                            {categoryField.type === 'String' && (
                                <input
                                    id={inputId}
                                    type="text"
                                    name={categoryField.name}
                                    value={currentFieldValue}
                                    onChange={onChange}
                                    required={categoryField.required}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                                    transition-colors duration-200"
                                />
                            )}
                            {categoryField.type === 'Number' && (
                                <input
                                    id={inputId}
                                    type="number"
                                    name={categoryField.name}
                                    value={currentFieldValue}
                                    onChange={onChange}
                                    required={categoryField.required}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                                    transition-colors duration-200"
                                />
                            )}
                            {!['String', 'Number'].includes(categoryField.type) && (
                                <p className="text-xs text-red-500 dark:text-red-400 transition-colors duration-200">
                                    Unsupported field type: {categoryField.type}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </fieldset>
    );
};

export default DynamicFieldsSection;