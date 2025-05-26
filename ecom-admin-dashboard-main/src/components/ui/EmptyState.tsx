interface EmptyStateProps {
  message: string;
  description?: string;
}

export const EmptyState = ({ message, description }: EmptyStateProps)  => {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-800 rounded-lg shadow transition-colors duration-200">
      <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-700 mb-4 transition-colors duration-200">
        <span className="mdi mdi-filled text-gray-400 dark:text-gray-500 text-3xl">search_off</span>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1 transition-colors duration-200">{message}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm transition-colors duration-200">{description}</p>
      )}
    </div>
  );
};