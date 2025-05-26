import React from 'react';

interface ActionButton {
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface PageHeaderProps {
  title: string;
  actions?: ActionButton[];
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, actions = [], className = '' }) => {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">{title}</h1>
      
      {actions && (
        <div className="flex space-x-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                action.variant === 'primary'
                  ? 'border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-gray-500'
              } transition-colors duration-150`}
            >
              {action.icon && <span className="mdi mr-1.5">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};