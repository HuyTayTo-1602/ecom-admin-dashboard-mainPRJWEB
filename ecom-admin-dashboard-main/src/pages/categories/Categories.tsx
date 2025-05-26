import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../services/axios';
import { useUser } from '../../hooks/useUser';
import { Category } from '../../types/product.types';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import Pagination from '../../components/common/Pagination';
import CategoryFieldsList from '../../components/category/CategoryFieldsList';
import { PageHeader } from '../../components/ui/PageHeader';

const Categories: React.FC = () => {
    const { accessToken } = useUser();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalCategories, setTotalCategories] = useState<number>(0);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const itemsPerPage = 10;

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axiosInstance.get(`/product/category`, {
                params: {
                    page: currentPage,
                    limit: itemsPerPage
                },
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            // Handle different API response structures
            const categoryData = response.data?.categories || response.data || [];
            const total = response.data?.total || categoryData.length;
            
            setCategories(categoryData);
            setTotalCategories(total);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            setError('Failed to load categories. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [accessToken, currentPage]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Handle category deletion
    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!categoryToDelete) return;
        
        try {
            await axiosInstance.delete(`/product/category/${categoryToDelete._id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            setSuccess(`Category "${categoryToDelete.name}" deleted successfully`);
            setCategories(prev => prev.filter(cat => cat._id !== categoryToDelete._id));
            setDeleteModalOpen(false);
            setCategoryToDelete(null);
            
            // Recalculate pagination if needed
            if (categories.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            } else {
                fetchCategories();
            }
        } catch (err) {
            console.error('Failed to delete category:', err);
            setError('Failed to delete category. It may be in use by products.');
            setDeleteModalOpen(false);
        }
    };

    // Toggle category details view
    const toggleCategoryExpand = (categoryId: string) => {
        setExpandedCategory(prev => prev === categoryId ? null : categoryId);
    };

    // Handle pagination changes
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    return (
        <div className="p-4 sm:p-6 w-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                {/* <h1 className="text-2xl font-semibold text-gray-800 dark:text-white transition-colors duration-200">
                    Product Categories
                </h1> */}
                <PageHeader title="Product Categories" />
                <Link 
                    to="/admin/categories/new" 
                    className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-200"
                >
                    Add New Category
                </Link>
            </div>
            
            {/* Alerts */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded-md mb-4 transition-colors duration-200">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-400 p-4 rounded-md mb-4 transition-colors duration-200">
                    {success}
                </div>
            )}
            
            {/* Categories List */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors duration-200">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400 transition-colors duration-200"></div>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400 transition-colors duration-200">
                        <p>No categories found.</p>
                        <Link to="/admin/categories/new" className="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block transition-colors duration-200">
                            Create your first category
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto overflow-y-hidden">
                        <table className="w-full table-auto">
                            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
                                <tr>
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Name</th>
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200 hidden sm:table-cell">Description</th>
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200 hidden md:table-cell">Fields</th>
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
                                {categories.map(category => (
                                    <React.Fragment key={category._id}>
                                        <tr className="dark:hover:bg-gray-750 hover:bg-gray-50 cursor-pointer transition-colors duration-200" onClick={() => toggleCategoryExpand(category._id)}>
                                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                                                {category.name}
                                            </td>
                                            <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate hidden sm:table-cell transition-colors duration-200">
                                                {category.description || 'No description'}
                                            </td>
                                            <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell transition-colors duration-200">
                                                {category.fields?.length || 0} fields
                                            </td>
                                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2" onClick={e => e.stopPropagation()}>
                                                    <Link 
                                                        to={`/admin/categories/${category._id}`} 
                                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 mdi"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button 
                                                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200 mdi"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(category);
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedCategory === category._id && (
                                            <tr>
                                                <td colSpan={4} className="px-3 sm:px-6 py-4 bg-gray-50 dark:bg-gray-700/50 transition-colors duration-200">
                                                    <div className="mb-4">
                                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200">Category Details</h3>
                                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">{category.description || 'No description provided.'}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2 transition-colors duration-200">Custom Fields</h4>
                                                        <CategoryFieldsList fields={category.fields || []} />
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalCategories > itemsPerPage && (
                    <div className="py-3 px-4 sm:px-6 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalCategories}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Category"
                message={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This action cannot be undone and may affect products using this category.`}
            />
        </div>
    );
};

export default Categories;