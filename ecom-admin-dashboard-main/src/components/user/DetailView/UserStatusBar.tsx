import React from 'react';
import { StatusBadge } from '../../ui/StatusBadge';

type UserStatus = 'active' | 'inactive' | 'pending';

interface UserStatusBarProps {
  status: UserStatus;
  onStatusChange: (newStatus: UserStatus) => void;
  isUpdating: boolean;
  isEditing: boolean;
}

export const UserStatusBar: React.FC<UserStatusBarProps> = ({
  status,
  onStatusChange,
  isUpdating,
  isEditing
}) => {
  return (
    <div className="px-6 py-4 flex justify-between items-center transition-colors duration-200">
      <div className="flex items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2 transition-colors duration-200">Status:</span>
        <StatusBadge status={status} />
      </div>
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as UserStatus)}
          disabled={isUpdating || isEditing}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
        {isUpdating && (
          <span className="mdi animate-spin text-blue-500 dark:text-blue-400 transition-colors duration-200">sync</span>
        )}
      </div>
    </div>
  );
};