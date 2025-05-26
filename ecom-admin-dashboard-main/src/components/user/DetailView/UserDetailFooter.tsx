import React from 'react';

interface UserDetailFooterProps {
  isEditing: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  onClose: () => void;
  onEdit: () => void;
}

export const UserDetailFooter: React.FC<UserDetailFooterProps> = ({
  isEditing,
  isSaving,
  onSave,
  onCancel,
  onClose,
  onEdit
}) => {
  return (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 transition-colors duration-200">
      {isEditing ? (
        <>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 flex items-center"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="mdi mdi-spin mr-2">sync</span>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </>
      ) : (
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
          >
            Edit Profile
          </button>
        </>
      )}
    </div>
  );
};