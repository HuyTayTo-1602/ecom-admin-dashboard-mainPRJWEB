import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { UserHeader } from './DetailView/UserHeader';
import { UserStatusBar } from './DetailView/UserStatusBar';
import { UserBasicInfo } from './DetailView/UserBasicInfo';
import { UserAddressInfo } from './DetailView/UserAddressInfo';
import { UserActivityTab } from './DetailView/UserActivityTab';
import { UserSecurityTab } from './DetailView/UserSecurityTab';
import { UserDetailFooter } from './DetailView/UserDetailFooter';

type UserStatus = 'active' | 'inactive' | 'pending';
type UserRole = 'admin' | "customer" | "anon";

interface UserDetailViewProps {
  user: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    avatar?: string | null;
    createdAt: string;
    lastLogin?: string | null;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
  };
  onClose: () => void;
  onStatusChange: (newStatus: UserStatus) => void;
  onUserUpdate?: (userId: string, userData: Partial<UserUpdateData>) => Promise<void>;
  isUpdating: boolean;
}

interface UserUpdateData {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

const UserDetailView: React.FC<UserDetailViewProps> = ({
  user,
  onClose,
  onStatusChange,
  onUserUpdate,
  isUpdating
}) => {
  // State to track if we're in edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state for editable fields
  const [formData, setFormData] = useState<UserUpdateData>({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    address: {
      street: user.address?.street || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      zipCode: user.address?.zipCode || '',
      country: user.address?.country || '',
    }
  });

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      // Handle address fields
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      // Handle top-level fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle save action
  const handleSave = async () => {
    if (!onUserUpdate) return;
    
    // Add logging and validation
    if (!user._id) {
      console.error('User ID is undefined:', user);
      return;
    }
    
    try {
      setIsSaving(true);
      console.log('Updating user with ID:', user._id);
      
      // Make sure we're passing the string ID, not an object
      await onUserUpdate(user._id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update user', error);
      // Here you could add error handling, like showing a toast notification
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || '',
      }
    });
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full">
      <UserHeader
        name={user.name}
        email={user.email}
        avatar={user.avatar}
        isEditing={isEditing}
        formName={formData.name}
        formEmail={formData.email}
        onClose={onClose}
      />
      
      <UserStatusBar
        status={user.status}
        onStatusChange={onStatusChange}
        isUpdating={isUpdating}
        isEditing={isEditing}
      />
      
      <div className="flex-grow overflow-auto p-6 bg-white dark:bg-gray-800 transition-colors duration-200">
        <Tabs.Root defaultValue="profile" className="w-full">
          <Tabs.List className="flex border-b border-gray-200 dark:border-gray-700 mb-4 transition-colors duration-200">
            <Tabs.Trigger
              value="profile"
              className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-b-2 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 transition-colors duration-200"
            >
              Profile
            </Tabs.Trigger>
            <Tabs.Trigger
              value="activity"
              className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-b-2 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 transition-colors duration-200"
              disabled={isEditing}
            >
              Activity
            </Tabs.Trigger>
            <Tabs.Trigger
              value="security"
              className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-b-2 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 transition-colors duration-200"
              disabled={isEditing}
            >
              Security
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="profile" className="focus:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <UserBasicInfo
                  user={user}
                  isEditing={isEditing}
                  formData={formData}
                  handleChange={handleChange}
                />
              </div>

              <div className="space-y-4">
                <UserAddressInfo
                  address={user.address}
                  isEditing={isEditing}
                  formAddress={formData.address || {}}
                  handleChange={handleChange}
                />
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="activity" className="focus:outline-none">
            <UserActivityTab lastLogin={user.lastLogin} />
          </Tabs.Content>

          <Tabs.Content value="security" className="focus:outline-none">
            <UserSecurityTab />
          </Tabs.Content>
        </Tabs.Root>
      </div>

      <UserDetailFooter
        isEditing={isEditing}
        isSaving={isSaving}
        onSave={handleSave}
        onCancel={handleCancel}
        onClose={onClose}
        onEdit={() => setIsEditing(true)}
      />
    </div>
  );
};

export default UserDetailView;