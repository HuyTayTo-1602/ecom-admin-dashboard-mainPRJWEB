import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../components/ui/PageHeader';

export default function Settings() {
  // Initialize dark mode from localStorage or system preference
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // First check localStorage
    const savedPreference = localStorage.getItem('darkMode');
    if (savedPreference !== null) {
      return savedPreference === 'true';
    }
    // Otherwise check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [notifications, setNotifications] = useState(true);

  // Create a stable reference to the function that applies theme changes
  const applyTheme = useCallback((isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Enhanced toggle function with immediate DOM updates
  const handleToggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', String(newValue));
      applyTheme(newValue);
      return newValue;
    });
  }, [applyTheme]);
  
  const handleToggleNotifications = () => setNotifications(prev => !prev);

  // Ensure the DOM reflects the current state on mount
  useEffect(() => {
    applyTheme(darkMode);
  }, [darkMode, applyTheme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      // Only update if user hasn't set their own preference
      if (localStorage.getItem('darkMode') === null) {
        const newValue = e.matches;
        setDarkMode(newValue);
        applyTheme(newValue);
      }
    };
    
    // Add event listener (with compatibility fallback)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } 
    // else {
    //   // @ts-ignore - For older browsers
    //   mediaQuery.addListener(handleChange);
    // }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } 
      // else {
      //   // @ts-ignore - For older browsers
      //   mediaQuery.removeListener(handleChange);
      // }
    };
  }, [applyTheme]);

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
      <PageHeader title="Settings" className="mb-6" />
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-8 transition-colors duration-200">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Appearance</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg text-gray-900 dark:text-gray-100">Dark Mode</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Switch to {darkMode ? 'light' : 'dark'} theme
              </p>
            </div>
            
            {/* Tailwind-styled toggle switch with sun/moon indicators */}
            <button
              onClick={handleToggleDarkMode}
              className={`relative inline-flex h-6 w-12 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                darkMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={darkMode}
              aria-label="Toggle dark mode"
            >
              <span className="sr-only">Toggle dark mode</span>
              <span 
                className={`${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out`}
              />
              <span 
                className={`absolute ${
                  darkMode ? 'left-1 opacity-0' : 'left-1.5 opacity-100'
                } text-xs text-yellow-500 transition-opacity`}
                aria-hidden="true"
              >
                ☀️
              </span>
              <span 
                className={`absolute ${
                  darkMode ? 'right-1.5 opacity-100' : 'right-1 opacity-0'
                } text-xs text-blue-100 transition-opacity`}
                aria-hidden="true"
              >
                🌙
              </span>
            </button>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Notifications</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg text-gray-900 dark:text-gray-100">Email Notifications</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive email notifications about system updates
              </p>
            </div>
            
            <button
              onClick={handleToggleNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                notifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={notifications}
            >
              <span className="sr-only">Enable notifications</span>
              <span 
                className={`${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}