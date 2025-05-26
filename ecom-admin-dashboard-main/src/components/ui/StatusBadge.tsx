import React from 'react';

interface StatusConfig {
  color: string;
  icon?: string;
}

interface StatusMappings {
  [key: string]: StatusConfig;
}

interface StatusBadgeProps {
  status: string;
  statusMapping?: StatusMappings;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  statusMapping,
  size = 'sm'
}) => {
  // Default styling if no mapping provided
  const defaultMapping: StatusMappings = {
    active: { color: 'bg-green-100 text-green-800', icon: 'check_circle' },
    inactive: { color: 'bg-gray-100 text-gray-800', icon: 'cancel' },
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: 'hourglass_empty' },
    processing: { color: 'bg-blue-100 text-blue-800', icon: 'sync' },
    shipped: { color: 'bg-purple-100 text-purple-800', icon: 'local_shipping' },
    delivered: { color: 'bg-green-100 text-green-800', icon: 'check_circle' },
    cancelled: { color: 'bg-red-100 text-red-800', icon: 'cancel' },
    refunded: { color: 'bg-gray-100 text-gray-800', icon: 'assignment_return' },
    paid: { color: 'bg-green-100 text-green-800', icon: 'payments' },
    failed: { color: 'bg-red-100 text-red-800', icon: 'error' },
  };

  const mapping = statusMapping || defaultMapping;
  const config = mapping[status ? status.toLowerCase() : ''] || { color: 'bg-gray-100 text-gray-800' };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const displayText = status ? (status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()) : 'Unknown';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses[size]}`}>
      {config.icon && <span className="mdi mr-1">{config.icon}</span>}
      {displayText}
    </span>
  );
};