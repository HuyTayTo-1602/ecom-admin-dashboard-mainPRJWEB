import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../../services/axios';
import { useUser } from '../../hooks/useUser';
import useAutoSave from '../../hooks/useAutoSave';
import { Product, Category, FieldValues } from '../../types/product.types';
import ProductFormHeader from '../../components/product/ProductFormHeader';
import BasicInfoSection from '../../components/product/BasicInfoSection';
import PricingInventorySection from '../../components/product/PricingInventorySection';
import OrganizationSection from '../../components/product/OrganizationSection';
import DynamicFieldsSection from '../../components/product/DynamicFieldsSection';
import ImageManagementSection from '../../components/product/ImageManagementSection';
import ProductFormActions from '../../components/product/ProductFormActions';
import VariationsList from '../../components/product/VariationsList';

// Use the provided FieldValues type
type DynamicFieldValue = FieldValues;

// Type for the API payload, adjusting for the fields format
type UpdateProductPayload = Omit<Product, '_id' | 'fields' | 'createdAt' | 'updatedAt'> & {
    // Keep fields as either Record<string,string> or undefined for API
    fields?: Record<string, string | number> | undefined;
};

// Type representing the entire form state
interface ProductFormState {
    product: Product | null;
    categoryId: string | null;
    dynamicFields: DynamicFieldValue[];
}

const EditProduct: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { accessToken } = useUser();
    const DRAFT_STORAGE_KEY = `product_draft_edit_${id}`;
    const initialLoadCompleteRef = React.useRef(false);

    // Add tab state
    const [activeTab, setActiveTab] = useState<'general' | 'variations'>('general');
    
    const [product, setProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    // Store field values as array for component usage
    const [dynamicFieldValues, setDynamicFieldValues] = useState<DynamicFieldValue[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // Get the complete form state for auto-save
    const formState: ProductFormState = {
        product,
        categoryId: selectedCategory?._id || null,
        dynamicFields: dynamicFieldValues
    };
    
    // Set up auto-save, but only enable after initial data load
    const { hasSavedDraft, isRestored, lastSaved, clearDraft } = useAutoSave<ProductFormState>(
        formState,
        DRAFT_STORAGE_KEY,
        { 
            interval: 1000,
            enabled: initialLoadCompleteRef.current
        }
    );
    
    // --- Data Fetching ---
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [productResponse, categoriesResponse] = await Promise.all([
                    axiosInstance.get(`/product/${id}`, {
                        headers: { 'cache-control': 'no-cache' }
                    }),
                    axiosInstance.get('/product/category')
                ]);

                if (!isMounted) return;

                const productData = productResponse.data;
                console.log("Product response:", productData);

                const categoriesData = categoriesResponse.data?.categories || categoriesResponse.data || [];
                const categoriesList = Array.isArray(categoriesData) ? categoriesData : [];

                // Handle case where category is either ID string or object
                const categoryId = typeof productData.category === 'string' ? 
                    productData.category : productData.category?._id;
                    
                // Find the full category object from the categories list
                let foundCategory = null;
                if (categoryId) {
                    foundCategory = categoriesList.find((cat: Category) => cat._id === categoryId);
                    
                    if (!foundCategory) {
                        console.warn(`Product's category (${categoryId}) not found in categories list.`);
                    }
                }
                
                // Initialize dynamic fields from product.fields
                const initialDynamicFields: DynamicFieldValue[] = [];
                if (productData.fields) {
                    if (typeof productData.fields === 'object' && !Array.isArray(productData.fields)) {
                        Object.entries(productData.fields).forEach(([name, value]) => {
                            initialDynamicFields.push({ name, value: value as string });
                        });
                    }
                }
                
                // Update the product with the full category object
                const updatedProduct = {
                    ...productData,
                    // If we found the full category, use it; otherwise use what came from the API
                    category: foundCategory || productData.category
                };
                
                // Check for a draft after loading server data
                const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
                if (savedDraft) {
                    try {
                        const { data: draftData, timestamp } = JSON.parse(savedDraft);
                        const draftDate = new Date(timestamp);
                        const serverUpdateDate = new Date(productData.updatedAt);
                        
                        // Only use the draft if it's newer than the server data
                        if (draftDate > serverUpdateDate) {
                            if (draftData.product) {
                                setProduct(draftData.product);
                            } else {
                                setProduct(updatedProduct);
                            }
                            
                            if (draftData.dynamicFields) {
                                setDynamicFieldValues(draftData.dynamicFields);
                            } else {
                                setDynamicFieldValues(initialDynamicFields);
                            }
                            
                            if (draftData.categoryId) {
                                const draftCategory = categoriesList.find(
                                    (cat: Category) => cat._id === draftData.categoryId
                                );
                                setSelectedCategory(draftCategory || foundCategory);
                            } else {
                                setSelectedCategory(foundCategory);
                            }
                        } else {
                            // Draft is older than server data, use server data
                            setProduct(updatedProduct);
                            setDynamicFieldValues(initialDynamicFields);
                            setSelectedCategory(foundCategory);
                            // Clear outdated draft
                            localStorage.removeItem(DRAFT_STORAGE_KEY);
                        }
                    } catch (err) {
                        console.error('Error parsing draft:', err);
                        // Use server data if draft parsing fails
                        setProduct(updatedProduct);
                        setDynamicFieldValues(initialDynamicFields);
                        setSelectedCategory(foundCategory);
                        localStorage.removeItem(DRAFT_STORAGE_KEY);
                    }
                } else {
                    // No draft, use server data
                    setProduct(updatedProduct);
                    setDynamicFieldValues(initialDynamicFields);
                    setSelectedCategory(foundCategory);
                }
                
                setCategories(categoriesList);
                
                // Mark initial load as complete to enable auto-save
                initialLoadCompleteRef.current = true;

            } catch (err) {
                console.error('Error fetching product data:', err);
                if (isMounted) setError('Failed to load product data');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [id, DRAFT_STORAGE_KEY]);

    // Add this useEffect to check for the tab query parameter
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tab = searchParams.get('tab');
        if (tab === 'variations') {
            setActiveTab('variations');
        }
    }, [location]);

    // Add this function to reload product data when variations change
    const handleVariationsUpdate = useCallback(async () => {
        if (!id) return;
        
        try {
            const response = await axiosInstance.get(`/product/${id}`, {
                headers: { 'cache-control': 'no-cache' }
            });
            
            if (response.data) {
                // Just update the hasVariations flag
                setProduct(prevProduct => {
                    if (!prevProduct) return null;
                    return {
                        ...prevProduct,
                        hasVariations: response.data.hasVariations
                    };
                });
            }
        } catch (err) {
            console.error('Error refreshing product after variation change:', err);
        }
    }, [id]);

    // Handle discarding the draft
    const handleDiscardDraft = useCallback(async () => {
        if (!window.confirm('Are you sure you want to discard your draft? This action will reload the original data from the server.')) {
            return;
        }
        
        try {
            clearDraft();
            setLoading(true);
            
            // Refetch the product from server
            const response = await axiosInstance.get(`/product/${id}`, {
                headers: { 'cache-control': 'no-cache' }
            });
            
            const productData = response.data;
            setProduct(productData);
            
            // Reinitialize dynamic fields
            const initialDynamicFields: DynamicFieldValue[] = [];
            if (productData.fields) {
                if (typeof productData.fields === 'object' && !Array.isArray(productData.fields)) {
                    Object.entries(productData.fields).forEach(([name, value]) => {
                        initialDynamicFields.push({ name, value: value as string });
                    });
                }
            }
            setDynamicFieldValues(initialDynamicFields);
            
            // Get category
            if (productData.category) {
                const categoryId = typeof productData.category === 'string' ? 
                    productData.category : productData.category?._id;
                const foundCategory = categories.find((cat: Category) => cat._id === categoryId);
                setSelectedCategory(foundCategory || null);
            } else {
                setSelectedCategory(null);
            }
        } catch (err) {
            console.error('Error reloading product:', err);
            setError('Failed to reload product data');
        } finally {
            setLoading(false);
        }
    }, [id, clearDraft, categories]);
    
    // --- Form Handlers ---
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProduct(prev => {
            if (!prev) return null;
            let processedValue: string | number | undefined = value;
            if (name === 'price') processedValue = parseFloat(value) || 0;
            else if (name === 'stock') {
                processedValue = parseInt(value, 10);
                if (isNaN(processedValue)) processedValue = undefined;
            } else if (name === 'status' && !['active', 'inactive', 'draft'].includes(value)) {
                processedValue = 'draft';
            }
            return { ...prev, [name]: processedValue };
        });
    }, []);

    const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const categoryId = e.target.value;
        // Find the complete category object
        const newSelectedCategory = categories.find(c => c._id === categoryId) || null;
        setSelectedCategory(newSelectedCategory);
        
        // Update product with the complete category object
        setProduct(prev => {
            if (!prev) return null;
            
            // If category is selected, update with full object, otherwise set to null
            return { 
                ...prev, 
                category: newSelectedCategory || null as unknown as Category // Cast to Category to satisfy type checker
            };
        });

        // Update dynamic fields based on the category
        if (newSelectedCategory) {
            // Keep existing field values when changing categories
            const newDynamicFields = newSelectedCategory.fields.map(categoryField => {
                const existingField = dynamicFieldValues.find(df => df.name === categoryField.name);
                return { 
                    name: categoryField.name, 
                    value: existingField?.value || '' 
                };
            });
            setDynamicFieldValues(newDynamicFields);
        } else {
            setDynamicFieldValues([]);
        }
    }, [categories, dynamicFieldValues]);

    const handleDynamicFieldChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // Get the field definition from the selected category
        const fieldDefinition = selectedCategory?.fields.find(field => field.name === name);
        
        setDynamicFieldValues(prevFields => {
            const fieldIndex = prevFields.findIndex(field => field.name === name);
            
            // Process the value based on field type
            let processedValue: string | number = value;
            
            if (fieldDefinition?.type === 'Number') {
                // For number fields, always use 0 instead of empty string
                processedValue = value === '' ? 0 : Number(value);
                if (isNaN(processedValue as number)) {
                    processedValue = 0;
                }
                console.log(`Converting field "${name}" value to number: ${processedValue}`);
            }
            
            if (fieldIndex !== -1) {
                const updatedFields = [...prevFields];
                updatedFields[fieldIndex] = { ...updatedFields[fieldIndex], value: processedValue };
                return updatedFields;
            }
            
            return [...prevFields, { name, value: processedValue }];
        });
    }, [selectedCategory]);

    // Handle image changes from the ImageManagementSection
    const handleImagesChange = useCallback((updatedImages: string[]) => {
        console.log('Images updated:', updatedImages);
        setProduct(prev => {
            if (!prev) return null;
            return { 
                ...prev, 
                productImages: updatedImages // Use productImages instead of images
            };
        });
    }, []);

    // --- Form Submission ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const productId = product._id;
            if (!productId) throw new Error('Product ID is missing');
            
            // Convert the dynamic field values from array format to object format for API
            const fieldValues: Record<string, string | number> = {};
            dynamicFieldValues.forEach(field => {
                fieldValues[field.name] = field.value;
            });
            
            const payload: UpdateProductPayload = {
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                sku: product.sku,
                status: product.status,
                productImages: product.productImages,
                category: product.category, // Send full category object as per type definition
                fields: Object.keys(fieldValues).length > 0 ? fieldValues : undefined,
                createdBy: product.createdBy,
            };
            
            // Remove undefined optional fields
            (Object.keys(payload) as Array<keyof UpdateProductPayload>).forEach(key => {
                if (payload[key] === undefined) delete payload[key];
            });
            
            console.log(`Updating product with ID: ${productId}`, payload);
            
            const response = await axiosInstance.put(`/product/${productId}`, payload, {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
            });
            
            if (response.status >= 200 && response.status < 300) {
                const updatedProductData = response.data as Product;
                setProduct(updatedProductData);
                
                // Update the selected category
                if (updatedProductData.category?._id) {
                    const foundCategory = categories.find((cat: Category) => cat._id === updatedProductData.category._id);
                    setSelectedCategory(foundCategory || updatedProductData.category);
                } else {
                    setSelectedCategory(null);
                }
                
                // Update dynamic fields based on response
                // Convert from API's Record<string,string> format to array format for UI
                const updatedFields: DynamicFieldValue[] = [];
                if (updatedProductData.fields && typeof updatedProductData.fields === 'object' && !Array.isArray(updatedProductData.fields)) {
                    Object.entries(updatedProductData.fields).forEach(([name, value]) => {
                        updatedFields.push({ name, value });
                    });
                }
                setDynamicFieldValues(updatedFields);
                
                // Clear draft after successful submission
                clearDraft();
                
                setSuccess('Product updated successfully!');
                setTimeout(() => {
                     navigate(`/admin/products/${productId}`, { state: { message: 'Product updated successfully!' } });
                }, 1500);
            } else {
                throw new Error(response.statusText || `Update failed with status ${response.status}`);
            }
        } catch (err: unknown) {
            console.error('Error updating product:', err);
            let errorMessage = 'Failed to update product.';
            if (axios.isAxiosError(err)) errorMessage = err.response?.data?.message || `Server error: ${err.response?.status}` || err.message;
            else if (err instanceof Error) errorMessage = err.message;
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    // --- Render Logic ---
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400 transition-colors duration-200"></div>
            </div>
        );
    }
    if (error && !product) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800 text-center max-w-lg mx-auto transition-colors duration-200">
                <p className="text-red-600 dark:text-red-400 mb-4 transition-colors duration-200">{error}</p>
                <Link to="/admin/products" className="text-blue-500 dark:text-blue-400 hover:underline transition-colors duration-200">Return to Products</Link>
            </div>
        );
    }
    if (!product) {
        return (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800 text-center max-w-lg mx-auto transition-colors duration-200">
                <p className="text-yellow-700 dark:text-yellow-400 mb-4 transition-colors duration-200">Product not found.</p>
                <Link to="/admin/products" className="text-blue-500 dark:text-blue-400 hover:underline transition-colors duration-200">Return to Products</Link>
            </div>
        );
    }

    // --- Form JSX ---
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-4xl mx-auto transition-colors duration-200">
            <ProductFormHeader
                productId={id}
                productName={product?.name}
                isEditMode={true}
            />

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg transition-colors duration-200">
                    <p className="text-red-600 dark:text-red-400 transition-colors duration-200">{error}</p>
                </div>
            )}
            
            {success && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg transition-colors duration-200">
                    <p className="text-green-600 dark:text-green-400 transition-colors duration-200">{success}</p>
                </div>
            )}
            
            {isRestored && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex justify-between items-center transition-colors duration-200">
                    <div>
                        <p className="text-blue-700 dark:text-blue-400 transition-colors duration-200">
                            <span className="font-semibold">Draft restored</span> - We've restored your unsaved changes from {lastSaved?.toLocaleString()}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 transition-colors duration-200">Your work is automatically saved as you type</p>
                    </div>
                    <button 
                        onClick={handleDiscardDraft}
                        className="px-3 py-1 bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-400 text-sm border border-blue-300 dark:border-blue-700 rounded hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                        Discard Changes
                    </button>
                </div>
            )}
            
            {hasSavedDraft && !isRestored && (
                <div className="mb-4 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                    <span className="inline-flex items-center">
                        <svg className="w-3 h-3 mr-1 text-green-500 dark:text-green-400 transition-colors duration-200" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        Draft saved {lastSaved ? `at ${lastSaved.toLocaleTimeString()}` : ''}
                    </span>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="mt-6 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <nav className="flex -mb-px">
                    <button 
                        type="button"
                        onClick={() => setActiveTab('general')} 
                        className={`inline-block py-4 px-6 font-medium text-sm border-b-2 ${
                            activeTab === 'general'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        } transition-colors duration-200`}
                    >
                        General Information
                    </button>
                    <button 
                        type="button"
                        onClick={() => setActiveTab('variations')} 
                        className={`py-4 px-6 font-medium text-sm border-b-2 flex items-center ${
                            activeTab === 'variations'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        } transition-colors duration-200`}
                    >
                        Variations
                        {product?.hasVariations && (
                            <span className="ml-2 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full transition-colors duration-200">
                                ✓
                            </span>
                        )}
                    </button>
                </nav>
            </div>

            {/* Conditional rendering based on active tab */}
            {activeTab === 'general' ? (
                <form onSubmit={handleSubmit} className="mt-6">
                    {/* Your existing form content */}
                    <div className="grid grid-cols-1 gap-8">
                        {/* Image Management Section (full width) */}
                        <div className="col-span-full">
                            <ImageManagementSection 
                                productId={product._id}
                                images={product.productImages || []}
                                accessToken={accessToken || ''}
                                onImagesChange={handleImagesChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Column 1 */}
                            <div className="space-y-6">
                                <BasicInfoSection product={product} onChange={handleInputChange} />
                                <PricingInventorySection product={product} onChange={handleInputChange} />
                            </div>

                            {/* Column 2 */}
                            <div className="space-y-6">
                                <OrganizationSection
                                    product={product}
                                    categories={categories}
                                    selectedCategory={selectedCategory}
                                    onCategoryChange={handleCategoryChange}
                                    onStatusChange={handleInputChange}
                                />
                                <DynamicFieldsSection
                                    selectedCategory={selectedCategory}
                                    dynamicFieldValues={dynamicFieldValues}
                                    onChange={handleDynamicFieldChange}
                                />
                            </div>
                        </div>
                    </div>

                    <ProductFormActions isSaving={saving} isLoading={loading} />
                </form>
            ) : (
                <div className="mt-6">
                    {product && (
                        <VariationsList
                            productId={product._id}
                            productName={product.name}
                            onUpdate={handleVariationsUpdate}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default EditProduct;