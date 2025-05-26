import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import OrderStatusBadge from './OrderStatusBadge';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
type PaymentMethod = 'card' | 'cash' | 'momo' | 'bank' | 'paypal';

// Updated interface to match the API response structure
interface OrderDetailViewProps {
  order: {
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
      deliveryFee: number;
      deliveryDate: string;
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
  };
  onClose: () => void;
  onStatusChange: (newStatus: OrderStatus) => void;
  isUpdating: boolean;
}

const OrderDetailView: React.FC<OrderDetailViewProps> = ({
  order,
  onClose,
  onStatusChange,
  isUpdating
}) => {
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate order subtotal
  const subtotal = order.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  
  // Calculate shipping total
  const shipping = order.items.reduce((sum, item) => sum + item.deliveryFee, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-200">Order #{order._id.substring(order._id.length - 8)}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors duration-200"
            aria-label="Close"
          >
            <span className="mdi">close</span>
          </button>
        </div>
      </div>

      {/* Order Status Bar */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2 transition-colors duration-200">Status:</span>
          <OrderStatusBadge status={order.status} />
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={order.status}
            onChange={(e) => onStatusChange(e.target.value as OrderStatus)}
            disabled={isUpdating}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
          {isUpdating && (
            <span className="mdi animate-spin text-blue-500 dark:text-blue-400 transition-colors duration-200">sync</span>
          )}
        </div>
      </div>

      {/* Order Details */}
      <div className="flex-grow overflow-auto p-6 bg-white dark:bg-gray-800 transition-colors duration-200">
        <Tabs.Root defaultValue="items" className="w-full">
          <Tabs.List className="flex border-b border-gray-200 dark:border-gray-700 mb-4 transition-colors duration-200">
            <Tabs.Trigger
              value="items"
              className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-b-2 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 transition-colors duration-200"
            >
              Items
            </Tabs.Trigger>
            <Tabs.Trigger
              value="customer"
              className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-b-2 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 transition-colors duration-200"
            >
              Customer
            </Tabs.Trigger>
            <Tabs.Trigger
              value="shipping"
              className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-b-2 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 transition-colors duration-200"
            >
              Shipping
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="items" className="focus:outline-none">
            <div className="space-y-4">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
                <thead className="bg-gray-50 dark:bg-gray-750 transition-colors duration-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">
                      Item
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">
                      Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">
                        {item.product.name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right transition-colors duration-200">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right transition-colors duration-200">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right transition-colors duration-200">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="bg-gray-50 dark:bg-gray-750 rounded-md p-4 space-y-2 transition-colors duration-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Subtotal:</span>
                  <span className="text-gray-900 dark:text-white transition-colors duration-200">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Shipping:</span>
                  <span className="text-gray-900 dark:text-white transition-colors duration-200">{formatCurrency(shipping)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 flex justify-between text-sm font-bold transition-colors duration-200">
                  <span className="text-gray-800 dark:text-gray-300 transition-colors duration-200">Total:</span>
                  <span className="text-gray-900 dark:text-white transition-colors duration-200">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="customer" className="focus:outline-none">
            <div className="bg-white dark:bg-gray-800 rounded-md p-4 transition-colors duration-200">
              <h3 className="font-medium mb-2 text-gray-800 dark:text-white transition-colors duration-200">Customer Information</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Name:</span>{' '}
                  <span className="text-gray-900 dark:text-white transition-colors duration-200">{order.user.name}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Email:</span>{' '}
                  <span className="text-gray-900 dark:text-white transition-colors duration-200">{order.user.email}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Payment Method:</span>{' '}
                  <span className="capitalize text-gray-900 dark:text-white transition-colors duration-200">{order.paymentDetails.method}</span>
                </p>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="shipping" className="focus:outline-none">
            <div className="bg-white dark:bg-gray-800 rounded-md p-4 transition-colors duration-200">
              <h3 className="font-medium mb-2 text-gray-800 dark:text-white transition-colors duration-200">Shipping Address</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Home:</span>{' '}
                  <span className="text-gray-900 dark:text-white transition-colors duration-200">{order.shippingAddress.home}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Street:</span>{' '}
                  <span className="text-gray-900 dark:text-white transition-colors duration-200">{order.shippingAddress.street}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">City:</span>{' '}
                  <span className="text-gray-900 dark:text-white transition-colors duration-200">{order.shippingAddress.city}</span>
                </p>
                {order.shippingAddress.state && (
                  <p className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">State:</span>{' '}
                    <span className="text-gray-900 dark:text-white transition-colors duration-200">{order.shippingAddress.state}</span>
                  </p>
                )}
                <p className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">ZIP Code:</span>{' '}
                  <span className="text-gray-900 dark:text-white transition-colors duration-200">{order.shippingAddress.zip}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Country:</span>{' '}
                  <span className="text-gray-900 dark:text-white transition-colors duration-200">{order.shippingAddress.country}</span>
                </p>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 transition-colors duration-200">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          Close
        </button>
        <button
          className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
        >
          <span className="mdi mr-1">print</span>
          Print Order
        </button>
      </div>
    </div>
  );
};

export default OrderDetailView;