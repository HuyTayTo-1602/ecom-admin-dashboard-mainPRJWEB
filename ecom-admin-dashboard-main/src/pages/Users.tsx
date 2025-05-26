import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { useUser } from '../hooks/useUser';
import axiosInstance from '../services/axios';
import { 
  createColumnHelper,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { DataTable } from '../components/ui/data-table/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchFilters } from '../components/ui/SearchFilters';
import { TabFilter, TabItem } from '../components/ui/TabFilter';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Pagination } from '../components/ui/Pagination';
import { ActionsDropdown } from '../components/ui/ActionsDropdown';
import UserDetailView from '../components/user/UserDetailView';

// User status types
type UserStatus = 'active' | 'inactive' | 'pending';

// User role types
type UserRole = 'admin' | 'customer' | 'anon';

// User interface
interface User {
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
}

// Add this type alias near your other type definitions
type UserColumn = ColumnDef<User, UserRole>;

export default function Users() {
  const { accessToken } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(parseInt(searchParams.get('page') || '1'));
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(null);
  
  // Filter states
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('status') || 'all');
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
  const [roleFilter, setRoleFilter] = useState<string>(searchParams.get('role') || '');
  
  // Table sorting state
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const usersPerPage = 10;
  
  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle view details
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };
  
  // Handle status change
  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    if (!accessToken) return;
    
    setStatusUpdateLoading(userId);
    
    try {
      await axiosInstance.patch(`/user/${userId}/status`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, status: newStatus } : user
        )
      );
      
      // If the current user is being viewed in detail, update it
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
      }
      
    } catch (err) {
      console.error('Failed to update user status:', err);
      setError('Failed to update user status. Please try again.');
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  // In your Users.tsx file, modify the user update function
  const handleUserUpdate = async (userId: string, userData: Partial<User>) => {
    if (!accessToken) return;
    if (!userId) {
      console.error('Cannot update user: User ID is undefined');
      setError('Failed to update user: Missing user ID');
      return;
    }
    
    setStatusUpdateLoading(userId);
    
    try {
      console.log(`Making PUT request to /user/${userId}`);
      await axiosInstance.put(`/user/${userId}`, userData, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      // Update local state with new user data
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, ...userData } : user
        )
      );
      
      // If the current user is being viewed in detail, update it
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prev => prev ? { ...prev, ...userData } : null);
      }
      
    } catch (err) {
      console.error('Failed to update user:', err);
      setError('Failed to update user. Please try again.');
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  // Define columns with TanStack's column helper
  const columnHelper = createColumnHelper<User>();
  
  const columns = [
    columnHelper.accessor('avatar', {
      id: 'avatar',
      header: '',
      cell: info => {
        const user = info.row.original;
        return (
          <div className="flex items-center">
            <img 
              src={user.avatar || 'https://via.placeholder.com/40'} 
              alt={`${user.name}'s avatar`}
              className="w-8 h-8 rounded-full object-cover mr-2"
            />
          </div>
        );
      },
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => <span className="font-medium text-gray-900">{info.getValue()}</span>,
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => <span className="text-gray-500">{info.getValue()}</span>,
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: info => (
        <span className="capitalize px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-800">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor('lastLogin', {
      header: 'Last Login',
      cell: info => formatDate(info.getValue()),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: info => formatDate(info.getValue()),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: info => {
        const user = info.row.original;
        
        const actionGroups = [
          {
            groupLabel: 'Manage User',
            items: [
              {
                label: 'Edit User',
                icon: 'edit',
                onClick: () => {/* Edit functionality */}
              }
            ]
          },
          {
            groupLabel: 'Status',
            items: [
              ...(user.status !== 'active' ? [{
                label: 'Activate',
                icon: 'check_circle',
                onClick: () => handleStatusChange(user._id, 'active'),
                disabled: statusUpdateLoading === user._id
              }] : []),
              ...(user.status !== 'inactive' ? [{
                label: 'Deactivate',
                icon: 'cancel',
                onClick: () => handleStatusChange(user._id, 'inactive'),
                disabled: statusUpdateLoading === user._id
              }] : []),
              ...(user.status !== 'pending' ? [{
                label: 'Mark as Pending',
                icon: 'hourglass_empty',
                onClick: () => handleStatusChange(user._id, 'pending'),
                disabled: statusUpdateLoading === user._id
              }] : [])
            ]
          },
          {
            items: [
              {
                label: 'Reset Password',
                icon: 'key',
                onClick: () => {/* Reset password functionality */}
              }
            ]
          }
        ];
        
        return (
          <div className="flex justify-end items-center space-x-2">
            <button 
              onClick={() => handleViewDetails(user)} 
              className="text-blue-600 hover:text-blue-900"
            >
              <span className="mdi">visibility</span>
            </button>
            <ActionsDropdown 
              groups={actionGroups}
              isLoading={statusUpdateLoading === user._id}
            />
          </div>
        );
      },
    }),
  ];
  
  // Fetch users with filters
  const fetchUsers = useCallback(async () => {
    if (!accessToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', usersPerPage.toString());
      
      if (activeTab !== 'all') {
        params.append('status', activeTab);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (roleFilter) {
        params.append('role', roleFilter);
      }
      
      // Update URL search params
      setSearchParams(params);
      
      const response = await axiosInstance.get(`/user?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      setUsers(response.data.users);
      setTotalUsers(response.data.total);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, currentPage, activeTab, searchTerm, roleFilter, setSearchParams]);
  
  // Initial load and when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // The fetchUsers effect will trigger due to currentPage dependency
  };
  
  // Create status tabs
  const statusTabs: TabItem[] = [
    { value: 'all', label: 'All Users' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'inactive', label: 'Inactive' },
  ];
  
  // Define page actions
  const pageActions = [
    {
      label: 'Refresh',
      icon: 'refresh',
      onClick: fetchUsers,
      variant: 'secondary' as const,
    },
    {
      label: 'Add User',
      icon: 'person_add',
      onClick: () => {/* Add user functionality */},
      variant: 'primary' as const,
    },
  ];

  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 1280);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1280);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="p-4 sm:p-6 w-full overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <PageHeader 
        title="Users" 
        actions={pageActions} 
        className="flex-col sm:flex-row items-start sm:items-center gap-4 mb-6"
      />
      
      <SearchFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onApplyFilters={fetchUsers}
        onClearFilters={() => {
          setSearchTerm('');
          setActiveTab('all');
          setRoleFilter('');
        }}
        placeholder="Search users by name or email"
        className="mb-4"
      />
      
      <TabFilter 
        tabs={statusTabs} 
        activeTab={activeTab} 
        onTabChange={(value) => {
          setActiveTab(value);
          setCurrentPage(1);
        }}
        className="mb-4"
      />
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 transition-colors duration-200">
          {error}
        </div>
      )}
      
      {isMobile ? (
        // Mobile view: A simplified list of users
        <div className="mt-4 w-full max-w-screen-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/10 p-4 transition-colors duration-200">
            {users.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between border-b last:border-b-0 border-gray-200 dark:border-gray-700 pb-4 mb-4 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <img
                    src={user.avatar || 'https://via.placeholder.com/40'}
                    alt={`${user.name}'s avatar`}
                    className="w-10 h-10 rounded-full object-cover mr-4"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white transition-colors duration-200">{user.name}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-200">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleViewDetails(user)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  More
                </button>
              </div>
            ))}
          </div>
          {!loading && users && users.length > 0 && (
            <div className="mt-4 px-4">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalUsers / usersPerPage)}
                onPageChange={handlePageChange}
                totalItems={totalUsers}
                itemsPerPage={usersPerPage}
              />
            </div>
          )}
        </div>
      ) : (
        // Desktop view: Use the full DataTable
        <div className="mt-4 w-full max-w-screen-md lg:max-w-screen-xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/10 overflow-hidden transition-colors duration-200">
            <div
              className="overflow-x-auto overflow-y-auto"
              style={{ maxHeight: 'calc(100vh - 300px)', WebkitOverflowScrolling: 'touch' }}
            >
              <DataTable
                data={users}
                columns={columns as UserColumn[]}
                sorting={sorting}
                onSortingChange={setSorting}
                isLoading={loading}
                emptyStateMessage="No users found"
                emptyStateDescription="Try adjusting your filters or search terms"
              />
            </div>
            {!loading && users && users.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <div className="px-4 py-4 overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalUsers / usersPerPage)}
                    onPageChange={handlePageChange}
                    totalItems={totalUsers}
                    itemsPerPage={usersPerPage}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <Dialog.Root open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/20 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto transition-colors duration-200">
            {selectedUser && (
              <UserDetailView 
                user={selectedUser}
                onClose={() => setIsDetailModalOpen(false)}
                onStatusChange={(newStatus) => {
                  handleStatusChange(selectedUser._id, newStatus);
                }}
                onUserUpdate={(userId, userData) => {
                  // Explicitly log the userId to verify it's being passed correctly
                  console.log('Updating user ID:', userId);
                  return handleUserUpdate(userId, userData);
                }}
                isUpdating={statusUpdateLoading === selectedUser?._id}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}