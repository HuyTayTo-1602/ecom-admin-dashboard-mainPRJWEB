import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { ProductVariation, CreateVariationPayload, UpdateVariationPayload, VariationAttribute } from '../../types/variation.types';
import { createProductVariation, updateProductVariation } from '../../services/variationService';
import { useUser } from '../../hooks/useUser';

interface VariationFormProps {
  productId: string;
  variation?: ProductVariation;
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

const VariationForm: React.FC<VariationFormProps> = ({
  productId,
  variation,
  onSubmitSuccess,
  onCancel
}) => {
  const { accessToken } = useUser();
  const [formData, setFormData] = useState<CreateVariationPayload>({
    name: '',
    sku: '',
    price: 0,
    stock: 0,
    attributes: [], // Initialize as an array instead of an object
  });
  
  // State for the new attribute inputs
  const [attributeName, setAttributeName] = useState<string>('');
  const [attributeType, setAttributeType] = useState<string>('');
  const [attributeValue, setAttributeValue] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!variation;

  // Load existing variation data if in edit mode
  useEffect(() => {
    if (variation) {
      try {
        // Ensure we properly handle different attribute formats 
        // (could be an array or an object depending on API response)
        let attributesArray: VariationAttribute[] = [];
        
        if (Array.isArray(variation.attributes)) {
          attributesArray = [...variation.attributes];
        } else if (typeof variation.attributes === 'object' && variation.attributes !== null) {
          // Convert object structure to array structure if needed
          attributesArray = Object.entries(variation.attributes).map(([name, value]) => ({
            name,
            type: 'Specification', // Default type if not specified
            value: typeof value === 'string' ? value : String(value),
          }));
        }
        
        setFormData({
          name: variation.name,
          sku: variation.sku || '',
          price: variation.price,
          stock: variation.stock,
          attributes: attributesArray,
          images: variation.images
        });
      } catch (err) {
        console.error('Error parsing variation data:', err);
        setError('Failed to load variation data correctly');
      }
    }
  }, [variation]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value
    }));
  };

  const addAttribute = (): void => {
    if (!attributeName.trim() || !attributeType.trim()) return;
    
    const newAttribute: VariationAttribute = {
      name: attributeName.trim(),
      type: attributeType.trim(),
      value: attributeValue.trim()
    };
    
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, newAttribute]
    }));
    
    // Reset inputs for next attribute
    setAttributeName('');
    setAttributeType('');
    setAttributeValue('');
  };

  const removeAttribute = (index: number): void => {
    setFormData(prev => {
      const newAttributes = [...prev.attributes];
      newAttributes.splice(index, 1);
      return { ...prev, attributes: newAttributes };
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!accessToken) {
      setError("Authentication required");
      return;
    }
    
    setError(null);
    setLoading(true);

    try {
      if (isEditMode && variation) {
        const updatePayload: UpdateVariationPayload = {
          name: formData.name,
          sku: formData.sku || undefined,
          price: formData.price,
          stock: formData.stock,
          attributes: formData.attributes,
        };
        await updateProductVariation(variation._id, updatePayload, accessToken);
      } else {
        await createProductVariation(productId, formData, accessToken);
      }
      onSubmitSuccess();
    } catch (err: unknown) {
      console.error('Error saving variation:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        setError(String(err.message));
      } else {
        setError('Failed to save variation');
      }
    } finally {
      setLoading(false);
    }
  };

  // Common attribute types for electronic products
  const electronicsAttributeTypes: ReadonlyArray<string> = [
    'Color',
    'Storage',
    'Memory',
    'Processor',
    'Screen Size',
    'Resolution',
    'Connectivity',
    'Battery',
    'Operating System',
    'Model'
  ] as const;

  // Helper function to suggest placeholder based on attribute type
  const getAttributePlaceholder = (type: string): string => {
    switch(type) {
      case 'Color': return 'e.g., Space Gray, Midnight Black';
      case 'Storage': return 'e.g., 256GB, 1TB';
      case 'Memory': return 'e.g., 8GB, 16GB DDR4';
      case 'Processor': return 'e.g., Intel Core i7, Apple M2';
      case 'Screen Size': return 'e.g., 15.6", 27"';
      case 'Resolution': return 'e.g., 1920x1080, 4K';
      case 'Connectivity': return 'e.g., Wi-Fi 6, Bluetooth 5.0';
      case 'Battery': return 'e.g., 6000mAh, 100Wh';
      case 'Operating System': return 'e.g., Windows 11, macOS';
      case 'Model': return 'e.g., XPS 15 9520, MacBook Pro M2';
      default: return 'Enter value';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 transition-colors duration-200">
      {error && (
        <div className="p-2 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 text-red-700 dark:text-red-400 transition-colors duration-200">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="variation-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
            Variation Name*
          </label>
          <input
            id="variation-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
            placeholder="e.g., MacBook Pro 16 M2 - 1TB SSD, Space Gray"
          />
        </div>
        
        <div>
          <label htmlFor="variation-sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
            SKU
          </label>
          <input
            id="variation-sku"
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
            placeholder="e.g., MBP-M2-1TB-SG"
          />
        </div>
        
        <div>
          <label htmlFor="variation-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
            Price*
          </label>
          <input
            id="variation-price"
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
            placeholder="1999.99"
          />
        </div>
        
        <div>
          <label htmlFor="variation-stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
            Stock*
          </label>
          <input
            id="variation-stock"
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            required
            min="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
            placeholder="10"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
          Technical Specifications
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label htmlFor="attribute-name" className="block text-xs text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-200">Spec Name*</label>
            <input
              id="attribute-name"
              type="text"
              value={attributeName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAttributeName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
              placeholder="e.g., storage, processor"
            />
          </div>
          <div>
            <label htmlFor="attribute-type" className="block text-xs text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-200">Category*</label>
            <select
              id="attribute-type"
              value={attributeType}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setAttributeType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
            >
              <option value="">Select specification type</option>
              {electronicsAttributeTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
              <option value="Custom">Other (custom)</option>
            </select>
            {attributeType === 'Custom' && (
              <input
                type="text"
                className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                placeholder="Enter custom type"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAttributeType(e.target.value)}
              />
            )}
          </div>
          <div>
            <label htmlFor="attribute-value" className="block text-xs text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-200">Value*</label>
            <input
              id="attribute-value"
              type="text"
              value={attributeValue}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAttributeValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
              placeholder={getAttributePlaceholder(attributeType)}
            />
          </div>
        </div>
        
        <button
          type="button"
          onClick={addAttribute}
          disabled={!attributeName.trim() || !attributeType.trim()}
          className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-blue-300 dark:disabled:bg-blue-500/50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Add Specification
        </button>
        
        {formData.attributes.length > 0 ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3 bg-gray-50 dark:bg-gray-800 mt-3 transition-colors duration-200">
            <h4 className="font-medium text-sm mb-2 text-gray-800 dark:text-gray-200 transition-colors duration-200">Product Specifications:</h4>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
              {formData.attributes.map((attr, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div>
                    <span className="font-medium text-gray-800 dark:text-gray-200 transition-colors duration-200">{attr.name}</span>
                    <span className="text-gray-500 dark:text-gray-400 transition-colors duration-200"> ({attr.type}): </span>
                    <span className="text-gray-700 dark:text-gray-300 transition-colors duration-200">{attr.value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttribute(index)}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm transition-colors duration-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic border border-dashed border-gray-300 dark:border-gray-600 p-4 mt-3 text-center bg-gray-50 dark:bg-gray-800 rounded transition-colors duration-200">
            <p>No specifications added yet</p>
            <p className="text-xs mt-1">Add technical details like storage, RAM, processor, etc.</p>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 mt-4 transition-colors duration-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400 dark:text-blue-300 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700 dark:text-blue-300 transition-colors duration-200">
              Detailed specifications help customers make informed purchase decisions about your electronic products. 
              Include important technical details that differentiate this variation from others.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-500/50 disabled:cursor-not-allowed transition-colors duration-200"
          disabled={loading || !accessToken}
        >
          {loading ? 'Saving...' : isEditMode ? 'Update Variation' : 'Create Variation'}
        </button>
      </div>
    </form>
  );
};

export default VariationForm;