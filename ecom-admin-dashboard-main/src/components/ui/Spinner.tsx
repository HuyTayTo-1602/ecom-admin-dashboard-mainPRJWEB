export const Spinner = ({ size = 'md' }) => {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }[size] || 'h-8 w-8';

  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizeClass} animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-500 transition-colors duration-200`}></div>
    </div>
  );
};