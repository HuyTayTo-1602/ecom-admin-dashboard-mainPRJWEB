import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/products/Products';
import Orders from '../pages/Orders';
import Users from '../pages/Users';
import ProductDetails from '../pages/products/ProductDetails';
import EditProduct from '../pages/products/EditProduct';
import Categories from '../pages/categories/Categories';
import CategoryForm from '../pages/categories/CategoryForm';
import NewProduct from '../pages/products/NewProduct';
import Settings from '../pages/Settings';

const AdminRoutes: React.FC = () => (
  <Routes>
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="products" element={<Products />} />
    <Route path="products/new" element={<NewProduct />} />
    <Route path="orders" element={<Orders />} />
    <Route path="users" element={<Users />} />
    <Route path="products/:id" element={<ProductDetails />} />
    <Route path="products/edit/:id" element={<EditProduct />} />
    <Route path="categories" element={<Categories />} />
    <Route path="categories/new" element={<CategoryForm />} />
    <Route path="categories/:id" element={<CategoryForm />} />
    <Route path="settings" element={<Settings />} />
  </Routes>
);

export default AdminRoutes;