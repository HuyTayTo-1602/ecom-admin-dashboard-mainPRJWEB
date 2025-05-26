import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const attemptedLoginRef = useRef(false);
  
  const { 
    login, 
    refreshAccessToken, 
    isRefreshing,
    isAuthenticated
  } = useUser();
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip completely if we're already refreshing
    if (isRefreshing) return;
    
    // Use ref instead of state to truly run only once
    if (attemptedLoginRef.current) return;

    const attemptLogin = async () => {
      console.log("Attempting silent login...");
      attemptedLoginRef.current = true;
      
      try {
        await refreshAccessToken();
        // Navigation now happens in the next effect
      } catch (error) {
        console.error('Silent login failed:', error);
        // Stay on login page
      }
    };

    attemptLogin();
  }, [refreshAccessToken, isRefreshing]);
  
  // Separate effect for navigation to break the dependency loop
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated, navigating...");
      const redirectTo = (location.state as { from?: string })?.from || '/admin/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      console.log('Login form submitted:', email);
      await login(email, password);
      
      // Login successful - don't navigate here, let the authentication effect handle it
      console.log('Login successful');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password');
    }
  };

  // Show loading state while trying to refresh the session
  if (isRefreshing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center transition-colors duration-200">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400 mx-auto mb-4 transition-colors duration-200"></div>
          <p className="text-lg text-gray-800 dark:text-gray-200 transition-colors duration-200">Trying to refresh your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 w-full transition-colors duration-200">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-200">Sign in to access your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg w-full transition-colors duration-200"
        >
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white text-center transition-colors duration-200">Login</h2>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 transition-colors duration-200">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
              placeholder="your.email@example.com"
              required
            />
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Password</label>
              <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">Forgot password?</a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 font-medium transition-colors duration-200"
          >
            Sign in
          </button>
          
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
            <p>Secure login powered by your organization</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;