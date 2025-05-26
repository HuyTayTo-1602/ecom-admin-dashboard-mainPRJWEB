import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    maxPageButtons?: number;
}

const Pagination: React.FC<PaginationProps> = ({ 
    currentPage, 
    totalItems, 
    itemsPerPage, 
    onPageChange,
    maxPageButtons = 5
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Don't render if there's only 1 page
    if (totalPages <= 1) return null;
    
    // Generate page buttons array
    const getPageNumbers = () => {
        const pageNumbers: (number | string)[] = [];
        
        // For small number of pages, show all
        if (totalPages <= maxPageButtons) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
            return pageNumbers;
        }
        
        // Always show first page
        pageNumbers.push(1);
        
        // Calculate start and end of page range
        let startPage = Math.max(2, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxPageButtons - 3);
        
        // Adjust if we're near the beginning
        if (startPage === 2) {
            endPage = Math.min(totalPages - 1, maxPageButtons - 1);
        }
        
        // Adjust if we're near the end
        if (endPage === totalPages - 1 && endPage - startPage < maxPageButtons - 3) {
            startPage = Math.max(2, totalPages - maxPageButtons + 2);
        }
        
        // Add ellipsis if needed at the beginning
        if (startPage > 2) {
            pageNumbers.push('...');
        }
        
        // Add the page range
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        
        // Add ellipsis if needed at the end
        if (endPage < totalPages - 1) {
            pageNumbers.push('...');
        }
        
        // Always show last page
        if (totalPages > 1) {
            pageNumbers.push(totalPages);
        }
        
        return pageNumbers;
    };
    
    const pageNumbers = getPageNumbers();
    
    return (
        <div className="flex justify-center items-center space-x-1">
            {/* Previous button */}
            <button 
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
                &laquo;
            </button>
            
            {/* Page numbers */}
            {pageNumbers.map((page, index) => (
                typeof page === 'number' ? (
                    <button
                        key={index}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-1 border rounded-md text-sm font-medium ${
                            page === currentPage
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {page}
                    </button>
                ) : (
                    <span key={index} className="px-2 py-1 text-gray-500">
                        {page}
                    </span>
                )
            ))}
            
            {/* Next button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
                &raquo;
            </button>
        </div>
    );
};

export default Pagination;