import React from 'react';
import { formatDate } from '../../../utils/formatters';

type UserRole = 'admin' | 'customer' | 'anon';

interface UserBasicInfoProps {
  user: {
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    createdAt: string;
  };
  isEditing: boolean;
  formData: {
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const UserBasicInfo: React.FC<UserBasicInfoProps> = ({
  user,
  isEditing,
  formData,
  handleChange
}) => {
  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md transition-colors duration-200">
      <h3 className="font-medium mb-2 text-gray-900 dark:text-white transition-colors duration-200">Basic Information</h3>
      <div className="space-y-3">
        {isEditing ? (
          // Edit mode - Show form fields
          <>
            <div className="space-y-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="role" className="block text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
              >
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
                <option value="anon">Anon</option>
              </select>
            </div>
            
            <p className="text-sm">
              <span className="font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Joined:</span>{' '}
              <span className="text-gray-900 dark:text-white transition-colors duration-200">{formatDate(user.createdAt)}</span>
            </p>
          </>
        ) : (
          // View mode - Show static text
          <>
            <p className="text-sm">
              <span className="font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Name:</span>{' '}
              <span className="text-gray-900 dark:text-white transition-colors duration-200">{user.name}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Email:</span>{' '}
              <span className="text-gray-900 dark:text-white transition-colors duration-200">{user.email}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Phone:</span>{' '}
              <span className="text-gray-900 dark:text-white transition-colors duration-200">{user.phone || 'Not provided'}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Role:</span>{' '}
              <span className="text-gray-900 dark:text-white transition-colors duration-200">{user.role}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Joined:</span>{' '}
              <span className="text-gray-900 dark:text-white transition-colors duration-200">{formatDate(user.createdAt)}</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};