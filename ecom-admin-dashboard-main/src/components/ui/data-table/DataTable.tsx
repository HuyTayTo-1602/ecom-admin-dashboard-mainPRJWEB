import { useState, useEffect } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnDef,
} from '@tanstack/react-table';
import { cn } from '../../../services/utils';
import { Spinner } from '../Spinner';
import { EmptyState } from '../EmptyState';

interface DataTableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  isLoading?: boolean;
  emptyStateMessage?: string;
  emptyStateDescription?: string;
}

export function DataTable<TData, TValue = unknown>({
  data,
  columns,
  sorting = [],
  onSortingChange,
  isLoading = false,
  emptyStateMessage = "No data found",
  emptyStateDescription = "Try adjusting your filters or search terms"
}: DataTableProps<TData, TValue>) {
  // Proper responsive handling with useState and useEffect
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  useEffect(() => {
    // Set initial state
    setIsMobile(window.innerWidth < 640);
    
    // Add resize listener
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const table = useReactTable<TData>({
    data: data || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: onSortingChange 
      ? (updater: SortingState | ((prev: SortingState) => SortingState)) => {
          if (typeof updater === 'function') {
            onSortingChange(updater(sorting));
          } else {
            onSortingChange(updater);
          }
        } 
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true, // We're handling pagination externally
  });

  if (isLoading) {
    return <Spinner />;
  }

  if (!data || data.length === 0) {
    return <EmptyState 
      message={emptyStateMessage} 
      description={emptyStateDescription} 
    />;
  }

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800/30 transition-colors duration-200" style={{ WebkitOverflowScrolling: 'touch' }}>
      <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
        <thead className="bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className={cn(
                    "text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200",
                    isMobile ? "p-2" : "px-6 py-3",
                    header.column.id === 'actions' ? 'text-right' : '',
                    header.column.getCanSort() ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750" : ""
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className={cn(
                    "flex items-center whitespace-nowrap",
                    header.column.id === 'actions' ? 'justify-end' : ''
                  )}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {header.column.getCanSort() && (
                      <span className="ml-1 text-gray-400 dark:text-gray-500 transition-colors duration-200">
                        {{
                          asc: <span className="text-blue-500 dark:text-blue-400 transition-colors duration-200">▲</span>,
                          desc: <span className="text-blue-500 dark:text-blue-400 transition-colors duration-200">▼</span>,
                        }[header.column.getIsSorted() as string] || '⇅'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={cn(
                    "text-sm text-gray-900 dark:text-gray-200 transition-colors duration-200",
                    isMobile ? "p-2" : "px-6 py-4",
                    "whitespace-nowrap",
                    cell.column.id === 'actions' ? 'text-right' : ''
                  )}
                >
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
          <tr>
            <td colSpan={columns.length} className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 text-right transition-colors duration-200">
              {data.length} {data.length === 1 ? 'item' : 'items'}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}