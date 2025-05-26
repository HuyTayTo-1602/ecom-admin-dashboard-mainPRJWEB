import React, { useState, useEffect, useCallback } from 'react';
import { ProductVariation } from '../../types/variation.types';
import { getProductVariations, deleteProductVariation } from '../../services/variationService';
import VariationForm from './VariationForm';
import { useUser } from '../../hooks/useUser';

interface VariationsListProps {
  productId: string;
  productName: string;
  onUpdate: () => void;
}

const VariationsList: React.FC<VariationsListProps> = ({
  productId,
  productName,
  onUpdate
}) => {
  const { accessToken } = useUser();
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingVariation, setEditingVariation] = useState<ProductVariation | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const loadVariations = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getProductVariations(productId, accessToken);
      setVariations(data);
    } catch (err) {
      console.error('Error loading variations:', err);
      setError('Failed to load variations');
    } finally {
      setLoading(false);
    }
  }, [productId, accessToken]);

  useEffect(() => {
    if (accessToken) {
      loadVariations();
    }
  }, [loadVariations, accessToken]);

  const handleDelete = async (variationId: string) => {
    if (!accessToken) return;
    if (!window.confirm('Are you sure you want to delete this variation?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteProductVariation(variationId, accessToken);
      await loadVariations(); // Reload the list
      onUpdate(); // Notify parent of change
    } catch (err) {
      console.error('Error deleting variation:', err);
      setError('Failed to delete variation');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = () => {
    loadVariations(); // Reload after form submission
    setEditingVariation(null);
    setShowAddForm(false);
    onUpdate(); // Notify parent of change
  };

  if (!accessToken) {
    return <div className="text-center py-6 text-red-600">You must be logged in to manage variations.</div>;
  }

  if (loading && !variations.length) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 transition-colors duration-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">
          Variations for {productName}
        </h2>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-1 rounded transition-colors duration-200"
          disabled={loading}
        >
          Add Variation
        </button>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 transition-colors duration-200">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Add New Variation</h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          </div>
          <VariationForm
            productId={productId}
            onSubmitSuccess={handleFormSubmit}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {editingVariation && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Edit Variation: {editingVariation.name}</h3>
            <button
              type="button"
              onClick={() => setEditingVariation(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          </div>
          <VariationForm
            productId={productId}
            variation={editingVariation}
            onSubmitSuccess={handleFormSubmit}
            onCancel={() => setEditingVariation(null)}
          />
        </div>
      )}

      {variations.length === 0 && !loading ? (
        <div className="text-center py-8 text-gray-500">
          No variations found for this product.
          <div className="mt-2 text-sm">
            Add variations to offer different options like sizes, colors, etc.
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attributes</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {variations.map((variation) => (
                <tr key={variation._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{variation.name}</td>
                  <td className="px-4 py-3">{variation.sku || '—'}</td>
                  <td className="px-4 py-3">{variation.price.toLocaleString("vi-VN")}</td>
                  <td className="px-4 py-3">{variation.stock}</td>
                  <td className="px-4 py-3">
                    {Array.isArray(variation.attributes) ? (
                      variation.attributes.map((attr, i) => (
                        <span key={i} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                          <span className="font-medium">{attr.name}</span>
                          <span className="text-xs text-gray-500 ml-1">({attr.type})</span>: {attr.value}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">No attributes</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex h-full items-center">
                      <button
                        type="button"
                        onClick={() => setEditingVariation(variation)}
                        className="text-blue-500 hover:text-blue-700 mr-3 mdi"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(variation._id)}
                        className="text-red-500 hover:text-red-700 mdi"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VariationsList;