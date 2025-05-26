import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import ProductFormActions from '../../components/product/ProductFormActions';

// Use the provided FieldValues type
type DynamicFieldValue = FieldValues;
const DRAFT_STORAGE_KEY = 'product_draft_new';

// Type representing the entire form state
interface ProductFormState {
    product: Partial<Product>;
    category: string | null; // Category ID
    dynamicFields: DynamicFieldValue[];
}

const NewProduct: React.FC = () => {
    const navigate = useNavigate();
    const { accessToken, user } = useUser();
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    const [product, setProduct] = useState<Partial<Omit<Product, "createdBy">>>({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        sku: '',
        status: 'draft',
        productImages: [],
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [dynamicFieldValues, setDynamicFieldValues] = useState<DynamicFieldValue[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Get the complete form state for auto-save
    const formState: ProductFormState = useMemo(() => ({
        product,
        category: selectedCategory?._id || null,
        dynamicFields: dynamicFieldValues
    }), [product, selectedCategory, dynamicFieldValues]);

    // Set up auto-save
    const { 
        hasSavedDraft, 
        isRestored, 
        lastSavedFormatted, 
        clearDraft, 
        restoredData 
    } = useAutoSave<ProductFormState>(
        formState,
        DRAFT_STORAGE_KEY,
        { 
            interval: 1000,
            enabled: initialLoadComplete // Only start auto-saving after initial load
        }
    );

    // Load categories and initialize the form
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/product/category');
                const categoriesData = response.data?.categories || response.data || [];
                const loadedCategories = Array.isArray(categoriesData) ? categoriesData : [];
                setCategories(loadedCategories);
                
                // Check if we have restored data from localStorage
                if (restoredData) {
                    console.log('Restoring draft from localStorage:', restoredData);
                    
                    // Restore product data
                    if (restoredData.product) {
                        setProduct(restoredData.product);
                    }
                    
                    // Restore category selection
                    if (restoredData.category) {
                        const foundCategory = loadedCategories.find(c => c._id === restoredData.category);
                        if (foundCategory) {
                            setSelectedCategory(foundCategory);
                        }
                    }
                    
                    // Restore dynamic fields
                    if (restoredData.dynamicFields) {
                        setDynamicFieldValues(restoredData.dynamicFields);
                    }
                }
                
                // Mark initial load as complete to enable auto-saving
                setInitialLoadComplete(true);
                
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Failed to load categories');
                setInitialLoadComplete(true); // Still mark as complete even if there's an error
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [restoredData]); // Only depend on restoredData

    // --- Form Handlers ---
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setProduct(prev => {
            let processedValue: string | number | undefined = value;

            if (name === 'price') {
                processedValue = parseFloat(value) || 0;
            }
            else if (name === 'stock') {
                processedValue = parseInt(value, 10);
                if (isNaN(processedValue)) processedValue = undefined;
            }

            return { ...prev, [name]: processedValue };
        });
    }, []);

    const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const categoryId = e.target.value;
        const newSelectedCategory = categories.find(c => c._id === categoryId) || null;

        setSelectedCategory(newSelectedCategory);
        setProduct(prev => ({ ...prev, category: newSelectedCategory || undefined }));

        // Initialize fields based on selected category
        if (newSelectedCategory) {
            const newFields = newSelectedCategory.fields.map(field => ({
                name: field.name,
                value: ''
            }));

            setDynamicFieldValues(newFields);
        } else {
            setDynamicFieldValues([]);
        }
    }, [categories]);

    const handleDynamicFieldChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // Get the field definition from the selected category to determine its type
        const fieldDefinition = selectedCategory?.fields.find(field => field.name === name);
        
        setDynamicFieldValues(prev => {
            const fieldIndex = prev.findIndex(field => field.name === name);
            
            // Process the value based on the field type
            let processedValue: string | number = value;
            
            if (fieldDefinition?.type === 'Number') {
                // For number fields, convert to a number or use 0 if empty
                processedValue = value === '' ? 0 : Number(value);
                if (isNaN(processedValue as number)) {
                    processedValue = 0;
                }
                console.log(`Converting field "${name}" value to number: ${processedValue}`);
            }
            
            if (fieldIndex !== -1) {
                const updatedFields = [...prev];
                updatedFields[fieldIndex] = { ...updatedFields[fieldIndex], value: processedValue };
                return updatedFields;
            }
            
            return [...prev, { name, value: processedValue }];
        });
    }, [selectedCategory]);

    // Handle discarding the draft
    const handleDiscardDraft = useCallback(() => {
        if (window.confirm('Are you sure you want to discard your draft? This cannot be undone.')) {
            clearDraft();
            setProduct({
                name: '',
                description: '',
                price: 0,
                stock: 0,
                sku: '',
                status: 'draft',
                productImages: [],
            });
            setSelectedCategory(null);
            setDynamicFieldValues([]);
        }
    }, [clearDraft]);

    // --- Form Submission ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Convert dynamic fields to object format
            const fieldValues: Record<string, string | number> = {};
            dynamicFieldValues.forEach(field => {
                fieldValues[field.name] = field.value;
            });

            // Prepare payload
            const payload = {
                ...product,
                fields: Object.keys(fieldValues).length > 0 ? fieldValues : undefined,
                createdBy: user?.id
            };

            // Remove any undefined or null values
            Object.keys(payload).forEach(key => {
                if (payload[key as keyof typeof payload] === undefined || payload[key as keyof typeof payload] === null) {
                    delete payload[key as keyof typeof payload];
                }
            });

            // Create product
            const response = await axiosInstance.post('/product', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const newProduct = response.data;
            setSuccess('Product created successfully!');

            // Clear draft after successful submission
            clearDraft();

            // Redirect to the new product page after creation
            setTimeout(() => {
                navigate(`/admin/products/${newProduct._id}`, {
                    state: { message: 'Product created successfully!' }
                });
            }, 1500);

        } catch (err) {
            console.error('Error creating product:', err);
            let errorMessage = 'Failed to create product.';

            if (axios.isAxiosError(err)) {
                errorMessage = err.response?.data?.message ||
                    `Server error: ${err.response?.status}` || err.message;
            }
            else if (err instanceof Error) {
                errorMessage = err.message;
            }

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

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-4xl mx-auto transition-colors duration-200">
            <ProductFormHeader
                productName="New Product"
                isEditMode={false}
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
                            <span className="font-semibold">Draft restored</span> - We've restored your unsaved draft from {lastSavedFormatted}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 transition-colors duration-200">Your work is automatically saved as you type</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleDiscardDraft}
                        className="px-3 py-1 bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-400 text-sm border border-blue-300 dark:border-blue-700 rounded hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                        Discard Draft
                    </button>
                </div>
            )}

            {hasSavedDraft && !isRestored && (
                <div className="mb-4 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                    <span className="inline-flex items-center">
                        <svg className="w-3 h-3 mr-1 text-green-500 dark:text-green-400 transition-colors duration-200" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        Draft saved {lastSavedFormatted}
                    </span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6">
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

                <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-200">
                        Once the product is created, you'll be able to upload images on the edit page.
                    </p>
                </div>

                <ProductFormActions isSaving={saving} isLoading={loading} />
            </form>
        </div>
    );
};

export default NewProduct;