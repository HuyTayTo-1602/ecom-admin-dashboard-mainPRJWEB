import React from 'react';

interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface UserAddressInfoProps {
  address?: UserAddress;
  isEditing: boolean;
  formAddress: UserAddress;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UserAddressInfo: React.FC<UserAddressInfoProps> = ({
  address,
  isEditing,
  formAddress,
  handleChange
}) => {
  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md transition-colors duration-200">
      <h3 className="font-medium mb-2 text-gray-900 dark:text-white transition-colors duration-200">Address</h3>
      {isEditing ? (
        // Edit mode - Address form fields
        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="address.street" className="block text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Street</label>
            <input
              type="text"
              id="address.street"
              name="address.street"
              value={formAddress.street || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="address.city" className="block text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">City</label>
            <input
              type="text"
              id="address.city"
              name="address.city"
              value={formAddress.city || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="address.state" className="block text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">State</label>
            <input
              type="text"
              id="address.state"
              name="address.state"
              value={formAddress.state || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Zip Code</label>
            <input
              type="text"
              id="address.zipCode"
              name="address.zipCode"
              value={formAddress.zipCode || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="address.country" className="block text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Country</label>
            <input
              type="text"
              id="address.country"
              name="address.country"
              value={formAddress.country || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
            />
          </div>
        </div>
      ) : (
        // View mode - Show static address
        <>
          {address ? (
            <div className="space-y-2">
              {address.street && (
                <p className="text-sm">
                  <span className="font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Street:</span>{' '}
                  <span className="text-gray-900 dark:text-white transition-colors duration-200">{address.street}</span>
                </p>
              )}
              {address.city && (
                <p className="text-sm">
                  <span className="font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">City:</span>{' '}
                  <span className="text-gray-900 dark:text-white transition-colors duration-200">{address.city}</span>
                </p>
              )}
              {address.state && (
                <p className="text-sm">
                  <span className="font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">State:</span>{' '}
                  <span className="text-gray-900 dark:text-white transition-colors duration-200">{address.state}</span>
                </p>
              )}
              {address.zipCode && (
                <p className="text-sm">
                  <span className="font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Zip Code:</span>{' '}
                  <span className="text-gray-900 dark:text-white transition-colors duration-200">{address.zipCode}</span>
                </p>
              )}
              {address.country && (
                <p className="text-sm">
                  <span className="font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Country:</span>{' '}
                  <span className="text-gray-900 dark:text-white transition-colors duration-200">{address.country}</span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">No address information available</p>
          )}
        </>
      )}
    </div>
  );
};