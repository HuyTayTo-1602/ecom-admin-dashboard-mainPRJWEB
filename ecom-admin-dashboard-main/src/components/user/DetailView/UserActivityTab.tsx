import React from 'react';
import { formatDate } from '../../../utils/formatters';

interface UserActivityTabProps {
  lastLogin?: string | null;
}

export const UserActivityTab: React.FC<UserActivityTabProps> = ({ lastLogin }) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 transition-colors duration-200">
      <h3 className="font-medium mb-2 text-gray-900 dark:text-white transition-colors duration-200">Recent Activity</h3>
      <div className="space-y-2">
        <p className="text-sm">
          <span className="font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Last Login:</span>{' '}
          <span className="text-gray-900 dark:text-white transition-colors duration-200">{formatDate(lastLogin)}</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
          Activity log will be displayed here when available
        </p>
      </div>
    </div>
  );
};