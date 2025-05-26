// src/components/MobileNav.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const MobileNav: React.FC = () => {
  const navLinks = [
    { to: '/admin/dashboard', icon: "home", label: 'Dashboard' },
    { to: '/admin/products', icon: "shopping_bag", label: 'Products' },
    { to: '/admin/categories', icon: "category", label: 'Categories' },
    { to: '/admin/orders', icon: "shopping_cart", label: 'Orders' },
    { to: '/admin/users', icon: "person", label: 'Users' },
    { to: '/admin/settings', icon: "settings", label: 'Settings' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <nav className="flex justify-around">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 text-xs ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300'
              }`
            }
          >
            <span className="mdi text-lg mb-1">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default MobileNav;