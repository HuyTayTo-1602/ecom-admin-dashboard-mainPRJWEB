import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { useUser } from '../hooks/useUser';
import axiosInstance from '../services/axios';
import OrderDetailView from '../components/order/OrderDetailView';
import { 
  createColumnHelper,
  SortingState,
  ColumnDef // Add this import
} from '@tanstack/react-table';
import { DataTable } from '../components/ui/data-table/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchFilters } from '../components/ui/SearchFilters';
import { TabFilter, TabItem } from '../components/ui/TabFilter';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Pagination } from '../components/ui/Pagination';
import { ActionsDropdown } from '../components/ui/ActionsDropdown';

// Order status types
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
type PaymentMethod = 'card' | 'cash' | 'momo' | 'bank' | 'paypal';

// Updated Order interface to match the API response
interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
      productImages?: string[];
    };
    quantity: number;
    unitPrice: number;
    deliveryDate: string;
    deliveryFee: number;
    _id: string;
    createdAt: string;
    updatedAt: string;
  }>;
  shippingAddress: {
    home: string;
    street: string;
    city: string;
    state?: string;
    zip: string;
    country: string;
  };
  paymentDetails: {
    method: PaymentMethod;
  };
  isGuestOrder: boolean;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Response type for pagination handling
interface OrdersResponse {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Add this type alias near your other type definitions
type OrderColumn = ColumnDef<Order, unknown>;

export default function Orders() {
    const { accessToken } = useUser();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // State management
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(parseInt(searchParams.get('page') || '1'));
    const [totalOrders, setTotalOrders] = useState<number>(0);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
    const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(null);
    
    // Filter states
    const [activeTab, setActiveTab] = useState<string>(searchParams.get('status') || 'all');
    const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
    const [dateRange, setDateRange] = useState<{start: string | null, end: string | null}>({
      start: searchParams.get('startDate'),
      end: searchParams.get('endDate')
    });
    
    // Table sorting state
    const [sorting, setSorting] = useState<SortingState>([]);
    
    const ordersPerPage = 10;
    
    // Format currency
    const formatCurrency = (amount: number) => {
      return amount.toLocaleString('vi-VN') + '₫';
    };
    
    // Format date
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };
  
    // Handle view details
    const handleViewDetails = (order: Order) => {
      setSelectedOrder(order);
      setIsDetailModalOpen(true);
    };
    
    // Handle status change
    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
      if (!accessToken) return;
      
      setStatusUpdateLoading(orderId);
      
      try {
        await axiosInstance.put(`/order/${orderId}/status`, 
          { status: newStatus },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        
        // If the current order is being viewed in detail, update it
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }
        
      } catch (err) {
        console.error('Failed to update order status:', err);
        setError('Failed to update order status. Please try again.');
      } finally {
        setStatusUpdateLoading(null);
      }
    };
  
    // Define columns with TanStack's column helper
    const columnHelper = createColumnHelper<Order>();
    
    const columns = [
      columnHelper.accessor('_id', {
        header: 'Order #',
        cell: info => <span className="font-medium text-gray-900 dark:text-white transition-colors duration-200">{info.getValue()}</span>,
      }),
      columnHelper.accessor(row => row.user, {
        id: 'user',
        header: 'Customer',
        cell: info => (
          <div>
            <div className="font-medium text-gray-800 dark:text-gray-200 transition-colors duration-200">{info.getValue().name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">{info.getValue().email}</div>
          </div>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: info => <span className="text-gray-700 dark:text-gray-300 transition-colors duration-200">{formatDate(info.getValue())}</span>,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: info => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor(row => row.paymentDetails.method, {
        id: 'paymentMethod',
        header: 'Payment',
        cell: info => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
            ${info.getValue() === 'card' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
              info.getValue() === 'cash' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
              info.getValue() === 'momo' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-400' :
              'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'} 
            transition-colors duration-200`}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('totalAmount', {
        header: 'Total',
        cell: info => <span className="text-gray-700 dark:text-gray-300 transition-colors duration-200">{formatCurrency(info.getValue())}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right text-gray-500 dark:text-gray-400 transition-colors duration-200">Actions</div>,
        cell: info => {
          const order = info.row.original;
          
          const actionGroups = [
            {
              groupLabel: 'Update Status',
              items: (['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[])
                .filter(status => status !== order.status)
                .map(status => ({
                  label: `Mark as ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                  onClick: () => handleStatusChange(order._id, status),
                  disabled: statusUpdateLoading === order._id
                }))
            },
            {
              items: [
                {
                  label: 'Print',
                  icon: 'print',
                  onClick: () => {/* Print functionality */}
                }
              ]
            }
          ];
          
          return (
            <div className="flex justify-end items-center space-x-2">
              <button 
                onClick={() => handleViewDetails(order)} 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors duration-200"
              >
                <span className="mdi">visibility</span>
              </button>
              <ActionsDropdown 
                groups={actionGroups}
                isLoading={statusUpdateLoading === order._id}
              />
            </div>
          );
        },
      }),
    ];
  
    // Create status tabs
    const statusTabs: TabItem[] = [
      { value: 'all', label: 'All Orders' },
      { value: 'pending', label: 'Pending' },
      { value: 'processing', label: 'Processing' },
      { value: 'shipped', label: 'Shipped' },
      { value: 'delivered', label: 'Delivered' },
      { value: 'cancelled', label: 'Cancelled' },
    ];
    
    // Fetch orders with filters
    const fetchOrders = useCallback(async () => {
      if (!accessToken) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('limit', ordersPerPage.toString());
        
        if (activeTab !== 'all') {
          params.append('status', activeTab);
        }
        
        if (searchTerm) {
          params.append('search', searchTerm);
        }
        
        if (dateRange.start) {
          params.append('startDate', dateRange.start);
        }
        
        if (dateRange.end) {
          params.append('endDate', dateRange.end);
        }
        
        // Update URL search params
        setSearchParams(params);
        
        const response = await axiosInstance.get<OrdersResponse>(`/order?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        // Ensure we have an array of orders, even if response is empty
        const orderData = response.data.orders || [];
        setOrders(orderData);
        setTotalOrders(response.data.pagination.total);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load orders. Please try again.');
        // Initialize with empty array on error
        setOrders([]);
        setTotalOrders(0);
      } finally {
        setLoading(false);
      }
    }, [accessToken, currentPage, activeTab, searchTerm, dateRange, setSearchParams]);

    // Define page actions
    const pageActions = [
        {
          label: 'Refresh',
          icon: 'refresh',
          onClick: fetchOrders,
          variant: 'secondary' as const,
        },
        {
          label: 'Export',
          icon: 'download',
          onClick: () => {/* Export functionality */},
          variant: 'primary' as const,
        },
      ];
    
    // Initial load and when dependencies change
    useEffect(() => {
      fetchOrders();
    }, [fetchOrders]);
    
    // Handle page change
    const handlePageChange = (page: number) => {
      setCurrentPage(page);
      // The fetchOrders effect will trigger due to currentPage dependency
    };
  
    return (
      <div className="p-6 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <PageHeader title="Orders" actions={pageActions} />
        
        <SearchFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onApplyFilters={fetchOrders}
          onClearFilters={() => {
            setSearchTerm('');
            setDateRange({ start: null, end: null });
            setActiveTab('all');
          }}
          placeholder="Search orders by ID, customer name, or email"
          showDateFilters={true}
        />
        
        <TabFilter 
          tabs={statusTabs} 
          activeTab={activeTab} 
          onTabChange={(value) => {
            setActiveTab(value);
            setCurrentPage(1);
          }}
        />
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 text-red-700 dark:text-red-400 transition-colors duration-200">
            {error}
          </div>
        )}
        
        <div className="mt-4 rounded-lg shadow dark:shadow-gray-800/10 overflow-hidden">
          <DataTable
            data={orders}
            columns={columns as OrderColumn[]}
            sorting={sorting}
            onSortingChange={setSorting}
            isLoading={loading}
            emptyStateMessage="No orders found"
            emptyStateDescription="Try adjusting your filters or search terms"
          />
          
          {!loading && orders && orders.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalOrders / ordersPerPage)}
                onPageChange={handlePageChange}
                totalItems={totalOrders}
                itemsPerPage={ordersPerPage}
              />
            </div>
          )}
        </div>
        
        <Dialog.Root open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 transition-colors duration-200" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-black/30 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto transition-colors duration-200">
              {selectedOrder && (
                <OrderDetailView 
                  order={selectedOrder}
                  onClose={() => setIsDetailModalOpen(false)}
                  onStatusChange={(newStatus) => {
                    handleStatusChange(selectedOrder._id, newStatus);
                  }}
                  isUpdating={statusUpdateLoading === selectedOrder._id}
                />
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    );
  }