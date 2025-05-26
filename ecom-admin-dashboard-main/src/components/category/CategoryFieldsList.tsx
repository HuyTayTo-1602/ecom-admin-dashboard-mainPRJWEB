import React from 'react';
import { CategoryField } from '../../types/product.types';

interface CategoryFieldsListProps {
    fields: CategoryField[];
}

const CategoryFieldsList: React.FC<CategoryFieldsListProps> = ({ fields }) => {
    if (fields.length === 0) {
        return (
            <div className="text-sm text-gray-500 italic">
                No custom fields defined for this category.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-md overflow-hidden border border-gray-200">
            <div className="grid grid-cols-3 gap-4 px-4 py-2 bg-gray-100 font-medium text-sm text-gray-600">
                <div>Field Name</div>
                <div>Type</div>
                <div>Required</div>
            </div>
            <div className="divide-y divide-gray-200">
                {fields.map(field => (
                    <div key={field._id} className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
                        <div className="font-medium text-gray-800">{field.name}</div>
                        <div className="text-gray-600">{field.type}</div>
                        <div>
                            {field.required ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Required
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Optional
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryFieldsList;