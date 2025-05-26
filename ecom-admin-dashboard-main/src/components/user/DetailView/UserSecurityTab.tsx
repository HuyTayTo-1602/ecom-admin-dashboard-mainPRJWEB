import React from 'react';

export const UserSecurityTab: React.FC = () => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 transition-colors duration-200">
      <h3 className="font-medium mb-2 text-gray-900 dark:text-white transition-colors duration-200">Security Settings</h3>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-1 text-gray-800 dark:text-gray-200 transition-colors duration-200">Password</h4>
          <button
            className="px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
          >
            Reset Password
          </button>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1 text-gray-800 dark:text-gray-200 transition-colors duration-200">Two-Factor Authentication</h4>
          <div className="flex items-center">
            <span className="h-5 w-5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-full flex items-center justify-center mr-2 transition-colors duration-200">
              <span className="mdi text-xs">close</span>
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">Not enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};