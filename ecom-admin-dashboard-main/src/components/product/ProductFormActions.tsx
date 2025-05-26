import React from 'react';

interface ProductFormActionsProps {
    isLoading: boolean;
    isSaving: boolean;
}

const ProductFormActions: React.FC<ProductFormActionsProps> = ({ isLoading, isSaving }) => {
    return (
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-end transition-colors duration-200">
            <button
                type="submit"
                disabled={isLoading || isSaving}
                className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-md 
                hover:bg-blue-700 dark:hover:bg-blue-600 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200"
            >
                {isSaving ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                    </span>
                ) : (
                    'Save Product'
                )}
            </button>
        </div>
    );
};

export default ProductFormActions;