import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Avatar } from '@radix-ui/themes';
import { useUser } from '../hooks/useUser';

const Navbar: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/30 p-4 flex justify-between items-center transition-colors duration-200">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">E-Com Admin</h1>
      <div className="flex items-center gap-4">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="focus:outline-none" aria-label="User menu">
              <Avatar
                className="w-8 h-8 rounded-full cursor-pointer ring-2 ring-gray-200 dark:ring-gray-700"
                src={user?.avatar || 'https://via.placeholder.com/150'}
                alt="User Avatar"
                fallback={user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[220px] bg-white dark:bg-gray-800 rounded-md p-2 shadow-md dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 transition-colors duration-200"
              sideOffset={5}
              align="end"
            >
              <DropdownMenu.Item className="text-sm cursor-default select-none outline-none px-2 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-150">
                <Link to="/admin/profile" className="block w-full">Profile</Link>
              </DropdownMenu.Item>
              
              <DropdownMenu.Item className="text-sm cursor-default select-none outline-none px-2 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-150">
                <Link to="/admin/settings" className="block w-full">Settings</Link>
              </DropdownMenu.Item>
              
              <DropdownMenu.Separator className="h-px my-1 bg-gray-200 dark:bg-gray-700" />
              
              <DropdownMenu.Item 
                className="text-sm cursor-default select-none outline-none px-2 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-150"
                onSelect={handleLogout}
              >
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
};

export default Navbar;