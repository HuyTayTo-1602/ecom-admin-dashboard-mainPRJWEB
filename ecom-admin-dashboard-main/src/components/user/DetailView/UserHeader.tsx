import React from 'react';

interface UserHeaderProps {
  name: string;
  email: string;
  avatar?: string | null;
  isEditing?: boolean;
  formName?: string;
  formEmail?: string;
  onClose: () => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({
  name,
  email,
  avatar,
  isEditing = false,
  formName,
  formEmail,
  onClose
}) => {
  return (
    <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
      <div className="flex items-center">
        <img 
          src={avatar || 'https://via.placeholder.com/80'} 
          alt={`${name}'s avatar`}
          className="w-16 h-16 rounded-full object-cover mr-4"
        />
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-200">
            {isEditing ? formName : name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
            {isEditing ? formEmail : email}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onClose}
          className="p-2 flex rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors duration-200"
          aria-label="Close"
        >
          <span className="mdi">close</span>
        </button>
      </div>
    </div>
  );
};