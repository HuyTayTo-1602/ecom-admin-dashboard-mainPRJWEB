import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axiosInstance from '../../services/axios';

interface ImageManagementSectionProps {
  productId: string;
  images: string[];
  accessToken: string;
  onImagesChange: (images: string[]) => void;
}

const ImageManagementSection: React.FC<ImageManagementSectionProps> = ({
  productId,
  images,
  accessToken,
  onImagesChange
}) => {
  // Add local state for images to ensure immediate UI updates
  const [localImages, setLocalImages] = useState<string[]>(images);
  const [uploadingStatus, setUploadingStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  // Sync local images with prop images whenever props change
  useEffect(() => {
    setLocalImages(images);
    console.log("ImageManagementSection received images:", images);
  }, [images]);

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    try {
      setUploadingStatus('uploading');
      setUploadProgress(0);
      setUploadError(null);

      const formData = new FormData();
      acceptedFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await axiosInstance.post(`/product/${productId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${accessToken}`
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      });

      console.log('Image upload response:', response.data);
      
      // Handle the nested response structure
      if (response.data.data && response.data.data.productImages) {
        // API returns the complete updated product with productImages array
        const updatedImages = response.data.data.productImages;
        setLocalImages(updatedImages);
        onImagesChange(updatedImages);
        setUploadingStatus('success');
      } else if (response.data.productImages) {
        // Direct productImages array
        const updatedImages = response.data.productImages;
        setLocalImages(updatedImages);
        onImagesChange(updatedImages);
        setUploadingStatus('success');
      } else {
        console.error('Unexpected API response format:', response.data);
        setUploadError('Received unexpected response format from server');
        setUploadingStatus('error');
      }
      
      // Reset status after a delay
      setTimeout(() => setUploadingStatus('idle'), 3000);
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadingStatus('error');
      setUploadError('Failed to upload images. Please try again.');
    }
  }, [productId, accessToken, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  // Delete an image
  const handleDeleteImage = async (imageUrl: string) => {
    // Extract the image ID from the URL
    const imageId = imageUrl.split('/').pop();
    if (!imageId) return;

    try {
      setDeletingImageId(imageId);
      await axiosInstance.delete(`/product/${productId}/images/${imageId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      // Immediately update local state for responsive UI
      const updatedImages = localImages.filter(img => !img.includes(imageId));
      setLocalImages(updatedImages);
      
      // Update parent component
      onImagesChange(updatedImages);
      
      console.log('Image deleted successfully, updated images:', updatedImages);
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    } finally {
      setDeletingImageId(null);
    }
  };

  // Get status classes
  const getStatusClasses = () => {
    if (uploadingStatus === 'uploading') return 'border-yellow-300 bg-yellow-50';
    if (uploadingStatus === 'success') return 'border-green-300 bg-green-50';
    if (uploadingStatus === 'error') return 'border-red-300 bg-red-50';
    return isDragActive ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Product Images</h3>
        <span className="text-sm text-gray-500">{localImages.length} / 10 images</span>
      </div>

      {/* Image Gallery - Use localImages instead of prop images */}
      {localImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {localImages.map((image, index) => (
            <div key={`${image}-${index}`} className="relative group border border-gray-200 rounded-md overflow-hidden">
              <img
                src={image}
                alt={`Product ${index + 1}`}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  console.error(`Failed to load image: ${image}`);
                  (e.target as HTMLImageElement).src = '/placeholder-product.png';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleDeleteImage(image)}
                  disabled={deletingImageId === image.split('/').pop()}
                  className="bg-red-600 text-white p-2 flex rounded-full hover:bg-red-700 transition-colors"
                  title="Delete image"
                >
                  {deletingImageId === image.split('/').pop() ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    // <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    //   <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    // </svg>
                    <span className="mdi">delete</span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rest of your dropzone code remains unchanged */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${getStatusClasses()}`}
      >
        <input {...getInputProps()} />
        {uploadingStatus === 'uploading' ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-sm">Uploading... {uploadProgress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        ) : uploadingStatus === 'success' ? (
          <div className="space-y-2">
            <div className="flex justify-center">
              <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="text-sm text-green-600">Images uploaded successfully!</p>
          </div>
        ) : uploadingStatus === 'error' ? (
          <div className="space-y-2">
            <div className="flex justify-center">
              <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <p className="text-sm text-red-600">{uploadError}</p>
            <p className="text-xs">Click or drag files to try again</p>
          </div>
        ) : isDragActive ? (
          <div className="space-y-2">
            <div className="flex justify-center">
              <svg className="h-10 w-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            <p className="text-blue-500 font-medium">Drop the files here ...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center">
              <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            <p className="text-gray-500">Drag 'n' drop images here, or click to select files</p>
            <em className="text-xs text-gray-400">
              (Max 10 images, 5MB each. Supported formats: JPG, PNG, WEBP)
            </em>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageManagementSection;