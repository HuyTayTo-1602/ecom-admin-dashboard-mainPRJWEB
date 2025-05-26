import React from 'react';
import { CategoryFieldCreate } from '../../types/product.types';

interface CategoryFieldFormProps {
    field: CategoryFieldCreate;
    error?: string;
    onChange: (field: CategoryFieldCreate) => void;
    onRemove: () => void;
    onDuplicate?: () => void;
    isDragging?: boolean;
    index: number; // Add index prop for identifier
}

const CategoryFieldForm: React.FC<CategoryFieldFormProps> = ({ 
    field, 
    error, 
    onChange, 
    onRemove,
    onDuplicate,
    isDragging = false,
    index
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            onChange({ ...field, [name]: checked });
            return;
        }
        
        onChange({ ...field, [name]: value });
    };

    // Use index as fallback for field identification
    const fieldId = `field-${index}`;

    return (
        <div className={`p-4 border ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} rounded-md ${isDragging ? 'opacity-70' : ''}`}>
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <div className="cursor-move px-1 text-gray-400 flex" title="Drag to reorder">
                        <span className="mdi">drag_handle</span>
                    </div>
                    <h3 className="font-medium text-gray-800">Field Configuration</h3>
                </div>
                <div className="flex space-x-2">
                    {onDuplicate && (
                        <button
                            type="button"
                            onClick={onDuplicate}
                            className="text-blue-600 hover:text-blue-800 text-sm mdi"
                            title="Duplicate field"
                        >
                            content_copy
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-red-600 hover:text-red-800 text-sm mdi"
                    >
                        delete
                    </button>
                </div>
            </div>
            
            {error && (
                <div className="mb-3 p-2 bg-red-100 border border-red-200 rounded text-red-700 text-sm error-message">
                    {error}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor={`field-name-${fieldId}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Field Name*
                    </label>
                    <input
                        id={`field-name-${fieldId}`}
                        name="name"
                        type="text"
                        value={field.name}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Color, Size, Material"
                    />
                </div>
                
                <div>
                    <label htmlFor={`field-type-${fieldId}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Field Type*
                    </label>
                    <select
                        id={`field-type-${fieldId}`}
                        name="type"
                        value={field.type}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="String">Text</option>
                        <option value="Number">Number</option>
                        <option value="Boolean">Yes/No</option>
                        <option value="Date">Date</option>
                        <option value="Select">Dropdown</option>
                    </select>
                </div>
                
                <div className="flex items-center">
                    <input
                        id={`field-required-${fieldId}`}
                        name="required"
                        type="checkbox"
                        checked={field.required}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`field-required-${fieldId}`} className="ml-2 block text-sm text-gray-700">
                        Required Field
                    </label>
                </div>
            </div>
        </div>
    );
};

export default CategoryFieldForm;