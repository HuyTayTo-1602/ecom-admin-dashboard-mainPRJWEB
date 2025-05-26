import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axios';
import { useUser } from '../../hooks/useUser';
import { Category, CategoryField, CategoryFieldCreate } from '../../types/product.types';
import CategoryFieldForm from '../../components/category/CategoryFieldForm';
import useAutoSave from '../../hooks/useAutoSave';

type CategoryFormMode = 'create' | 'edit';

// Helper type for handling both existing and new fields
type CategoryFieldWithOptionalId = Partial<CategoryField> & Omit<CategoryFieldCreate, '_id'>;

// Type for the form state to be saved
interface CategoryFormState {
    category: Partial<Category>;
    validationErrors: Record<string, string>;
    draggedFieldIndex: number | null;
}

const CategoryForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const mode: CategoryFormMode = id ? 'edit' : 'create';
    const navigate = useNavigate();
    const { accessToken } = useUser();
    const initialLoadComplete = useRef(false);
    
    // Storage key that's unique per category
    const DRAFT_STORAGE_KEY = mode === 'edit' ? `category_draft_edit_${id}` : 'category_draft_new';

    // Create a partial Category for new category creation
    // Don't include _id or createdBy when creating a new category
    const [category, setCategory] = useState<Partial<Category>>({
        name: '',
        description: '',
        fields: []
    });
    const [initialCategory, setInitialCategory] = useState<string>('');
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(mode === 'edit');
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [draggedFieldIndex, setDraggedFieldIndex] = useState<number | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Get the complete form state for auto-save
    const formState: CategoryFormState = {
        category,
        validationErrors,
        draggedFieldIndex,
    };
    
    // Set up auto-save
    const { 
        hasSavedDraft, 
        isRestored, 
        lastSaved, 
        clearDraft,
    } = useAutoSave<CategoryFormState>(
        formState,
        DRAFT_STORAGE_KEY,
        { 
            interval: 1000,
            enabled: initialLoadComplete.current && hasChanges
        }
    );

    useEffect(() => {
        if (mode === 'edit' && id) {
            const fetchCategory = async () => {
                try {
                    setLoading(true);
                    const response = await axiosInstance.get(`/product/category/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Cache-Control': 'no-cache'
                        }
                    });

                    const categoryData = response.data;
                    
                    // Check for a draft that's newer than the server data
                    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
                    if (savedDraft) {
                        try {
                            const { timestamp, data: draftData } = JSON.parse(savedDraft);
                            const draftDate = new Date(timestamp);
                            const serverUpdateDate = new Date(categoryData.updatedAt || 0);
                            
                            // Only use draft if it's newer than server data
                            if (draftDate > serverUpdateDate && draftData.category) {
                                setCategory(draftData.category);
                                if (draftData.validationErrors) {
                                    setValidationErrors(draftData.validationErrors);
                                }
                            } else {
                                setCategory(categoryData);
                                // Clear outdated draft
                                localStorage.removeItem(DRAFT_STORAGE_KEY);
                            }
                        } catch (err) {
                            console.error('Error parsing saved draft:', err);
                            setCategory(categoryData);
                            localStorage.removeItem(DRAFT_STORAGE_KEY);
                        }
                    } else {
                        setCategory(categoryData);
                    }
                    
                    setInitialCategory(JSON.stringify(categoryData));
                    initialLoadComplete.current = true;
                } catch (err) {
                    console.error('Failed to fetch category:', err);
                    setError('Failed to load category data. Please try again.');
                } finally {
                    setLoading(false);
                }
            };
            
            fetchCategory();
        } else {
            // Check for a saved draft for new category
            const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (savedDraft) {
                try {
                    const { data: draftData } = JSON.parse(savedDraft);
                    if (draftData.category) {
                        setCategory(draftData.category);
                        if (draftData.validationErrors) {
                            setValidationErrors(draftData.validationErrors);
                        }
                    }
                } catch (err) {
                    console.error('Error parsing saved draft:', err);
                    localStorage.removeItem(DRAFT_STORAGE_KEY);
                }
            }
            
            initialLoadComplete.current = true;
        }
    }, [id, mode, accessToken, DRAFT_STORAGE_KEY]);

    // Existing effect for change tracking
    useEffect(() => {
        if (!initialLoadComplete.current) return;
        
        if (initialCategory) {
            const currentCategory = JSON.stringify(category);
            setHasChanges(initialCategory !== currentCategory);
        } else if (category.name || (category.fields && category.fields.length > 0)) {
            setHasChanges(true);
        }
    }, [category, initialCategory]);
    
    // Handle discarding a draft
    const handleDiscardDraft = async () => {
        if (!window.confirm('Are you sure you want to discard your draft? This action will reload the original data.')) {
            return;
        }
        
        clearDraft();
        
        if (mode === 'edit' && id) {
            // Reload from server for edit mode
            setLoading(true);
            try {
                const response = await axiosInstance.get(`/product/category/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Cache-Control': 'no-cache'
                    }
                });
                
                const categoryData = response.data;
                setCategory(categoryData);
                setInitialCategory(JSON.stringify(categoryData));
                setValidationErrors({});
            } catch (err) {
                console.error('Failed to reload category:', err);
                setError('Failed to reload category data.');
            } finally {
                setLoading(false);
            }
        } else {
            // Reset to empty for create mode
            setCategory({
                name: '',
                description: '',
                fields: []
            });
            setValidationErrors({});
        }
    };

    // Existing form submission handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setError('Please fix the validation errors before submitting.');
            document.querySelector('.error-message')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setSaving(true);
        setError(null);

        try {
            // Prepare fields for submission
            // For existing categories (edit mode):
            // - Keep _id for existing fields
            // - Don't send _id for new fields
            // For new categories (create mode):
            // - Don't send any _id fields
            const fieldsForSubmission = category.fields?.map(field => {
                // If we're in create mode or the field doesn't have an _id (new field)
                // then omit the _id property
                if (mode === 'create' || !('_id' in field)) {
                    const { ...fieldWithoutId } = field as CategoryField;
                    return fieldWithoutId;
                }
                return field;
            }) || [];

            let payload;

            if (mode === 'create') {
                // For create mode, only send: name, description, fields
                const { ...rest } = category;
                payload = { ...rest, fields: fieldsForSubmission };
            } else {
                // For edit mode, keep the category structure but update fields
                payload = { ...category, fields: fieldsForSubmission };
            }

            let response;

            if (mode === 'create') {
                response = await axiosInstance.post('/product/category', payload, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                setSuccess('Category created successfully!');
            } else {
                response = await axiosInstance.put(`/product/category/${id}`, payload, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                setSuccess('Category updated successfully!');
            }

            const updatedCategory = response.data;
            setCategory(updatedCategory);
            setInitialCategory(JSON.stringify(updatedCategory));
            setHasChanges(false);
            
            // Clear draft after successful submission
            clearDraft();

            setTimeout(() => {
                navigate('/admin/categories', { 
                    state: { message: mode === 'create' ? 'Category created successfully!' : 'Category updated successfully!' }
                });
            }, 1500);
        } catch (err) {
            console.error('Failed to save category:', err);
            setError('Failed to save category. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasChanges]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCategory(prev => ({ ...prev, [name]: value }));

        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleAddField = () => {
        if (category.fields && category.fields.length >= 20) {
            setError('Maximum of 20 fields allowed per category');
            return;
        }

        // Create a new field without an _id
        const newField: CategoryFieldCreate = {
            name: '',
            type: 'String',
            required: false
        };

        setCategory(prev => ({
            ...prev,
            fields: [...(prev.fields || []), newField as CategoryField]
        }));
    };

    const handleDuplicateField = (index: number) => {
        if (!category.fields) return;
        const fieldToDuplicate = category.fields[index];

        if (!fieldToDuplicate) return;

        // Create a new duplicated field
        // If it's an existing field (with _id), we'll mark it clearly as a new field
        const duplicatedField: CategoryFieldWithOptionalId = {
            name: `${fieldToDuplicate.name} (copy)`,
            type: fieldToDuplicate.type,
            required: fieldToDuplicate.required
        };

        setCategory(prev => {
            if (!prev.fields) return prev;
            const newFields = [...prev.fields];
            newFields.splice(index + 1, 0, duplicatedField as CategoryField);
            return { ...prev, fields: newFields };
        });
    };

    const handleFieldChange = (index: number, updatedField: CategoryFieldCreate) => {
        setCategory(prev => {
            if (!prev.fields) return prev;
            const newFields = [...prev.fields];

            // Preserve the _id if it exists in the original field
            const originalField = newFields[index];
            if ('_id' in originalField) {
                newFields[index] = {
                    ...updatedField,
                    _id: originalField._id
                } as CategoryField;
            } else {
                newFields[index] = updatedField as CategoryField;
            }

            return { ...prev, fields: newFields };
        });

        setValidationErrors(prev => {
            const updated = { ...prev };
            delete updated[`field-${index}`];
            return updated;
        });
    };

    const handleRemoveField = (index: number) => {
        setCategory(prev => {
            if (!prev.fields) return prev;
            const newFields = [...prev.fields];
            newFields.splice(index, 1);
            return { ...prev, fields: newFields };
        });
    };

    const handleDragStart = (index: number) => {
        setDraggedFieldIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedFieldIndex === null || draggedFieldIndex === index) return;

        setCategory(prev => {
            if (!prev.fields) return prev;
            const newFields = [...prev.fields];
            const draggedItem = newFields[draggedFieldIndex];

            newFields.splice(draggedFieldIndex, 1);
            newFields.splice(index, 0, draggedItem);

            setDraggedFieldIndex(index);

            return { ...prev, fields: newFields };
        });
    };

    const handleDragEnd = () => {
        setDraggedFieldIndex(null);
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!category.name?.trim()) {
            errors.name = 'Category name is required';
        }

        category.fields?.forEach((field, index) => {
            if (!field.name.trim()) {
                errors[`field-${index}`] = 'Field name is required';
            }
        });

        const fieldNames = category.fields?.map(f => f.name.trim().toLowerCase()) || [];
        const uniqueNames = new Set(fieldNames);

        if (uniqueNames.size !== fieldNames.length) {
            const duplicates = fieldNames.filter(
                (name, index) => fieldNames.indexOf(name) !== index
            );

            category.fields?.forEach((field, index) => {
                if (duplicates.includes(field.name.trim().toLowerCase())) {
                    errors[`field-${index}`] = 'Field name must be unique';
                }
            });
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCancel = () => {
        if (hasChanges && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
            return;
        }
        navigate('/admin/categories');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    {mode === 'create' ? 'Create Category' : `Edit Category: ${category.name}`}
                </h1>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md">
                    {success}
                </div>
            )}
            
            {isRestored && (
                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded text-blue-700">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold">Draft restored</p>
                            <p className="text-sm">We've restored your unsaved changes from {lastSaved?.toLocaleString()}</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleDiscardDraft}
                            className="px-3 py-1 bg-white text-blue-600 text-sm rounded border border-blue-300 hover:bg-blue-50"
                        >
                            Discard Changes
                        </button>
                    </div>
                </div>
            )}

            {hasSavedDraft && !isRestored && (
                <div className="mb-2 text-xs text-gray-500">
                    <span className="inline-flex items-center">
                        <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        Draft saved {lastSaved ? `at ${lastSaved.toLocaleTimeString()}` : ''}
                    </span>
                </div>
            )}
            
            {hasChanges && !isRestored && !hasSavedDraft && (
                <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-blue-700 text-sm">
                    You have unsaved changes
                </div>
            )}

            {hasChanges && (
                <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-blue-700 text-sm">
                    You have unsaved changes
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-6">
                    <div className="space-y-6 mb-8">
                        <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Name*
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={category.name || ''}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full border ${validationErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                />
                                {validationErrors.name && (
                                    <p className="mt-1 text-sm text-red-600 error-message">{validationErrors.name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    value={category.description || ''}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Provide a description for this category (optional)"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Custom Fields</h2>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleAddField}
                                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md border border-blue-200 hover:bg-blue-100 text-sm transition-colors"
                                >
                                    Add Field
                                </button>
                                {category.fields && category.fields.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to sort fields alphabetically?')) {
                                                setCategory(prev => ({
                                                    ...prev,
                                                    fields: [...(prev.fields || [])].sort((a, b) => a.name.localeCompare(b.name))
                                                }));
                                            }
                                        }}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 text-sm transition-colors"
                                    >
                                        Sort A-Z
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {!category.fields || category.fields.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300">
                                    <p className="text-gray-500">No custom fields defined for this category.</p>
                                    <button
                                        type="button"
                                        onClick={handleAddField}
                                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Add Your First Field
                                    </button>
                                </div>
                            ) : (
                                category.fields.map((field, index) => (
                                    <div
                                        key={field._id || `new-field-${index}`}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`${draggedFieldIndex === index ? 'border-2 border-blue-500' : ''}`}
                                    >
                                        <CategoryFieldForm
                                            field={field}
                                            error={validationErrors[`field-${index}`]}
                                            onChange={updatedField => handleFieldChange(index, updatedField)}
                                            onRemove={() => handleRemoveField(index)}
                                            onDuplicate={() => handleDuplicateField(index)}
                                            isDragging={draggedFieldIndex === index}
                                            index={index}
                                        />

                                    </div>
                                ))
                            )}
                            <button
                                type="button"
                                onClick={handleAddField}
                                className="w-full flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <span className="mdi h-full">add</span>
                                <span className='flex justify-center items-center h-full text-xl'>Add Field</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
                    <div>
                        <p className="text-xs text-gray-500">
                            {category.fields?.length || 0} field{(category.fields?.length || 0) !== 1 ? 's' : ''} defined
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : mode === 'create' ? 'Create Category' : 'Update Category'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CategoryForm;