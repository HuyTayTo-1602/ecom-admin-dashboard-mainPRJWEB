import React, { useState } from 'react';

interface DateRange {
  start: string | null;
  end: string | null;
}

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateRange?: DateRange;
  setDateRange?: (range: DateRange) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  placeholder?: string;
  showDateFilters?: boolean;
  className?: string;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  dateRange,
  setDateRange,
  onApplyFilters,
  onClearFilters,
  placeholder = "Search...",
  showDateFilters = false,
  className, 
}) => {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [localDateRange, setLocalDateRange] = useState<DateRange>(dateRange || {
    start: null,
    end: null
  });

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(localSearch);
    if (setDateRange && showDateFilters) {
      setDateRange(localDateRange);
    }
    onApplyFilters();
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    if (setDateRange && showDateFilters) {
      setLocalDateRange({ start: null, end: null });
    }
    onClearFilters();
  };

  return (
    <div className={`flex flex-wrap gap-3 items-end ${className}`}>
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Search
        </label>
        <div className="relative rounded-md shadow-sm">
          <input
            type="text"
            id="search"
            className="block w-full pr-10 border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 py-2 pl-3 sm:text-sm transition-colors duration-150"
            placeholder={placeholder}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="mdi text-gray-400 dark:text-gray-500">search</span>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={handleApplyFilters}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
        >
          Apply
        </button>
        <button
          onClick={handleClearFilters}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-150"
        >
          Clear
        </button>
      </div>
    </div>
  );
};