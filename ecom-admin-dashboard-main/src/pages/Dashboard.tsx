// import React from 'react';

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Dashboard</h1>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/20 rounded p-4 transition-colors duration-200">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-200">Total Products</h2>
          <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">120</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/20 rounded p-4 transition-colors duration-200">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-200">Total Orders</h2>
          <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">450</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/20 rounded p-4 transition-colors duration-200">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-200">Total Users</h2>
          <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">300</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/20 rounded p-4 transition-colors duration-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 transition-colors duration-200">Recent Activity</h2>
        <ul className="space-y-2">
          <li className="text-gray-700 dark:text-gray-300 transition-colors duration-200">User John placed an order (#12345).</li>
          <li className="text-gray-700 dark:text-gray-300 transition-colors duration-200">Product "Wireless Headphones" was added.</li>
          <li className="text-gray-700 dark:text-gray-300 transition-colors duration-200">User Jane updated her profile.</li>
        </ul>
      </div>

      {/* Data Table Section */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/20 rounded p-4 transition-colors duration-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 transition-colors duration-200">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 transition-colors duration-200">
                <th className="border border-gray-200 dark:border-gray-700 p-2 text-left text-gray-800 dark:text-gray-100 transition-colors duration-200">Order ID</th>
                <th className="border border-gray-200 dark:border-gray-700 p-2 text-left text-gray-800 dark:text-gray-100 transition-colors duration-200">Customer</th>
                <th className="border border-gray-200 dark:border-gray-700 p-2 text-left text-gray-800 dark:text-gray-100 transition-colors duration-200">Total</th>
                <th className="border border-gray-200 dark:border-gray-700 p-2 text-left text-gray-800 dark:text-gray-100 transition-colors duration-200">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200">
                <td className="border border-gray-200 dark:border-gray-700 p-2 text-gray-800 dark:text-gray-200 transition-colors duration-200">12345</td>
                <td className="border border-gray-200 dark:border-gray-700 p-2 text-gray-800 dark:text-gray-200 transition-colors duration-200">John Doe</td>
                <td className="border border-gray-200 dark:border-gray-700 p-2 text-gray-800 dark:text-gray-200 transition-colors duration-200">$120.00</td>
                <td className="border border-gray-200 dark:border-gray-700 p-2 text-green-600 dark:text-green-400 transition-colors duration-200">Completed</td>
              </tr>
              <tr className="dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200">
                <td className="border border-gray-200 dark:border-gray-700 p-2 text-gray-800 dark:text-gray-200 transition-colors duration-200">12346</td>
                <td className="border border-gray-200 dark:border-gray-700 p-2 text-gray-800 dark:text-gray-200 transition-colors duration-200">Jane Smith</td>
                <td className="border border-gray-200 dark:border-gray-700 p-2 text-gray-800 dark:text-gray-200 transition-colors duration-200">$80.00</td>
                <td className="border border-gray-200 dark:border-gray-700 p-2 text-yellow-600 dark:text-yellow-400 transition-colors duration-200">Pending</td>
              </tr>
              <tr className="dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200">
                <td className="border border-gray-200 dark:border-gray-700 p-2 text-gray-800 dark:text-gray-200 transition-colors duration-200">12347</td>
                <td className="border border-gray-200 dark:border-gray-700 p-2 text-gray-800 dark:text-gray-200 transition-colors duration-200">Alice Brown</td>
                <td className="border border-gray-200 dark:border-gray-700 p-2 text-gray-800 dark:text-gray-200 transition-colors duration-200">$150.00</td>
                <td className="border border-gray-200 dark:border-gray-700 p-2 text-red-600 dark:text-red-400 transition-colors duration-200">Cancelled</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}