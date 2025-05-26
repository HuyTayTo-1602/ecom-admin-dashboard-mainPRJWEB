import React, { useState } from 'react';

interface OrderFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  setDateRange: (range: { start: string | null; end: string | null }) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  dateRange,
  setDateRange,
  onApplyFilters,
  onClearFilters
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [localDateRange, setLocalDateRange] = useState(dateRange);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(localSearch);
    setDateRange(localDateRange);
    onApplyFilters();
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    setLocalDateRange({ start: null, end: null });
    onClearFilters();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <form onSubmit={handleApplyFilters}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-grow relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 mdi">
              search
            </span>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search orders by ID, customer name, or email"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
          >
            <span className="mdi mr-1">filter_list</span>
            Filters
          </button>

          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={localDateRange.start || ''}
                  onChange={(e) => setLocalDateRange({ ...localDateRange, start: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={localDateRange.end || ''}
                  onChange={(e) => setLocalDateRange({ ...localDateRange, end: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default OrderFilters;