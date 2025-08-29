import React, { useState, useEffect } from 'react';
import { FaTimes, FaImage, FaCheck, FaStar, FaUpload, FaTrash } from 'react-icons/fa';
import Image from "next/image";
import Link from "next/link";



const ProductModal = ({ isOpen, onClose, product, onSubmit }) => {
  const [addCustomSize, setAddCustomSize] = useState(false);
  const [customSize, setCustomSize] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'men',
    subcategory: '',
    brand: '',
    stock: '',
    images: [],
    imageFiles: [],
    sizes: [],
    colors: [],
    discountPercentage: 0,
    featured: false,
    originalImages: []
  });

  // Available options for sizes and colors
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const [addCustomColor, setAddCustomColor] = useState(false)
  const [customColor, setCustomColor] = useState("")

  const availableColors = [
    { name: 'Red', value: 'Red', color: '#EF4444' },
    { name: 'Blue', value: 'Blue', color: '#3B82F6' },
    { name: 'Green', value: 'Green', color: '#10B981' },
    { name: 'Black', value: 'Black', color: '#1F2937' },
    { name: 'White', value: 'White', color: '#F9FAFB' },
    { name: 'Gray', value: 'Gray', color: '#6B7280' },
    { name: 'Navy', value: 'Navy', color: '#1E40AF' },
    { name: 'Brown', value: 'Brown', color: '#92400E' },
    { name: 'Pink', value: 'Pink', color: '#EC4899' },
    { name: 'Yellow', value: 'Yellow', color: '#F59E0B' }
  ];

  useEffect(() => {
    if (product) {
      const imageUrls = product.images ? product.images.map(img => img.url) : [];

      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || 'men',
        subcategory: product.subcategory || '',
        brand: product.brand || '',
        stock: product.stock || '',
        images: imageUrls,
        imageFiles: [],
        originalImages: product.images || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        discountPercentage: product.discountPercentage || 0,
        featured: product.featured || false
      });
    } else {
      // Reset form when adding a new product
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'men',
        subcategory: '',
        brand: '',
        stock: '',
        images: [],
        imageFiles: [],
        originalImages: [],
        sizes: [],
        colors: [],
        discountPercentage: 0,
        featured: false
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSizeChange = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleColorChange = (color) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }

    if (!formData.description.trim()) {
      alert('Product description is required');
      return;
    }

    if (!formData.price || formData.price <= 0) {
      alert('Valid price is required');
      return;
    }

    if (!formData.stock || formData.stock < 0) {
      alert('Valid stock quantity is required');
      return;
    }

    if (!formData.brand.trim()) {
      alert('Brand is required');
      return;
    }

    if (!formData.subcategory.trim()) {
      alert('Subcategory is required');
      return;
    }

    if (!formData.sizes || formData.sizes.length === 0) {
      alert('Please select at least one size');
      return;
    }

    if (!formData.colors || formData.colors.length === 0) {
      alert('Please select at least one color');
      return;
    }

    try {
      const form = new FormData();

      // Add all form fields
      form.append('name', formData.name.trim());
      form.append('description', formData.description.trim());
      form.append('price', formData.price.toString());
      form.append('category', formData.category);
      form.append('subcategory', formData.subcategory.trim());
      form.append('brand', formData.brand.trim());
      form.append('stock', formData.stock.toString());
      form.append('discountPercentage', formData.discountPercentage.toString());
      form.append('featured', formData.featured.toString());

      // Handle sizes and colors as JSON strings
      form.append('sizes', JSON.stringify(formData.sizes));
      form.append('colors', JSON.stringify(formData.colors));

      if (product && formData.originalImages && formData.originalImages.length > 0) {
        form.append('originalImages', JSON.stringify(formData.originalImages));
      }

      if (formData.imageFiles && formData.imageFiles.length > 0) {
        formData.imageFiles.forEach(file => {
          form.append('images', file);
        });
      }
      console.log(formData)

      await onSubmit(form);
    } catch (error) {
      console.error('Error preparing form data:', error);
      alert('Failed to prepare product data. Please try again.');
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      alert('Please upload only JPEG, PNG, or WebP images');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      alert('Image files must be less than 5MB each');
      return;
    }

    // Check total number of images (limit to 5)
    if (formData.images.length + files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    try {
      // Create preview URLs for display
      const imageUrls = files.map(file => URL.createObjectURL(file));

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls],
        imageFiles: [...(prev.imageFiles || []), ...files]
      }));
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Failed to process images. Please try again.');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      const removedImageUrl = newImages[index];
      newImages.splice(index, 1);

      // Clean up object URL to prevent memory leaks
      if (removedImageUrl && removedImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(removedImageUrl);
      }

      const newImageFiles = prev.imageFiles ? [...prev.imageFiles] : [];
      // Only splice from imageFiles if the removed image is a new upload (blob URL)
      if (removedImageUrl && removedImageUrl.startsWith('blob:')) {
        const blobIndex = prev.images.slice(0, index).filter(img => img.startsWith('blob:')).length;
        if (blobIndex < newImageFiles.length) {
          newImageFiles.splice(blobIndex, 1);
        }
      }

      // Update originalImages if we're editing a product
      let newOriginalImages = prev.originalImages ? [...prev.originalImages] : [];
      if (product && newOriginalImages.length > 0) {
        // Only remove from original images if it's not a blob URL (existing image)
        if (removedImageUrl && !removedImageUrl.startsWith('blob:')) {
          const originalIndex = prev.originalImages.findIndex(img => img.url === removedImageUrl);
          if (originalIndex !== -1) {
            newOriginalImages.splice(originalIndex, 1);
          }
        }
      }

      return {
        ...prev,
        images: newImages,
        imageFiles: newImageFiles,
        originalImages: newOriginalImages
      };
    });
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      formData.images.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [formData.images]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {product ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-gray-300 text-lg">
                {product ? 'Update your product information' : 'Create a new product listing'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full transform -translate-x-12 translate-y-12"></div>
        </div>

        {/* Form Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Brand *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="Enter brand name"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                  placeholder="Enter detailed product description"
                  required
                />
              </div>
            </div>

            {/* Pricing & Inventory Section */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-6 border border-gray-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                Pricing & Inventory
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Price ($) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-semibold">$</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Discount (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="discountPercentage"
                      value={formData.discountPercentage}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-150 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                Category Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white"
                    required
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="children">Children</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Subcategory *
                  </label>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="e.g., Shirts, Shoes, Accessories"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sizes & Colors Section */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-6 border border-gray-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">4</span>
                </div>
                Sizes & Colors
              </h3>

              {/* Sizes */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-800 mb-4">
                  Available Sizes *
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {availableSizes.map(size => (
                    <label
                      key={size}
                      className={`relative cursor-pointer p-4 border-2 rounded-xl text-center font-semibold transition-all duration-200 hover:scale-105 ${formData.sizes.includes(size)
                        ? 'border-gray-800 bg-gray-800 text-white shadow-lg'
                        : 'border-gray-400 bg-white text-gray-800 hover:border-gray-600'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.sizes.includes(size)}
                        onChange={() => handleSizeChange(size)}
                        className="sr-only"
                      />
                      <span className="text-lg">{size}</span>
                      {formData.sizes.includes(size) && (
                        <FaCheck className="absolute top-1 right-1 w-4 h-4" />
                      )}
                    </label>
                  ))}

                  <button
                    type="button"
                    className="px-3 py-1 border-2 border-gray-400 rounded-lg hover:bg-gray-100 text-sm text-gray-700 hover:border-gray-600"
                    onClick={() => setAddCustomSize(true)}
                  >
                    + Add Custom Size
                  </button>

                  {addCustomSize && (
                    <div className="flex items-center gap-2 mt-3">
                      <input
                        type="text"
                        placeholder="Enter custom size (e.g. 3XL, 7.5)"
                        value={customSize}
                        onChange={(e) => setCustomSize(e.target.value)}
                        className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customSize.trim() && !formData.sizes.includes(customSize.trim())) {
                            setFormData(prev => ({
                              ...prev,
                              sizes: [...prev.sizes, customSize.trim()]
                            }));
                          }
                          setCustomSize("");
                          setAddCustomSize(false);
                        }}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                      >
                        Add
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-4">
                  Available Colors *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {availableColors.map(color => (
                    <label
                      key={color.value}
                      className={`relative cursor-pointer p-4 border-2 rounded-xl flex items-center gap-3 font-medium transition-all duration-200 hover:scale-105 ${formData.colors.includes(color.value)
                        ? 'border-gray-800 bg-gray-100 text-gray-900 shadow-lg'
                        : 'border-gray-400 bg-white text-gray-800 hover:border-gray-600'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.colors.includes(color.value)}
                        onChange={() => handleColorChange(color.value)}
                        className="sr-only"
                      />
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-400 shadow-sm"
                        style={{ backgroundColor: color.color }}
                      ></div>
                      <span>{color.name}</span>
                      {formData.colors.includes(color.value) && (
                        <FaCheck className="absolute top-2 right-2 w-4 h-4 text-gray-800" />
                      )}
                    </label>
                  ))}

                  <button
                    type="button"
                    className="px-3 py-1 border-2 border-gray-400 rounded-lg hover:bg-gray-100 text-sm text-gray-700 hover:border-gray-600"
                    onClick={() => setAddCustomColor(true)}
                  >
                    + Add Custom Color
                  </button>

                  {addCustomColor && (
                    <div className="flex items-center gap-2 mt-3">
                      <input
                        type="text"
                        placeholder="Enter custom color name"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customColor.trim() && !formData.colors.includes(customColor.trim())) {
                            setFormData(prev => ({
                              ...prev,
                              colors: [...prev.colors, customColor.trim()]
                            }));
                          }
                          setCustomColor("");
                          setAddCustomColor(false);
                        }}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                      >
                        Add
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">5</span>
                </div>
                Product Images
              </h3>

              <div className="space-y-6">
                {/* Upload Area */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-400 rounded-2xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all duration-200 hover:border-gray-600"
                  >
                    <FaUpload className="w-12 h-12 text-gray-600 mb-4" />
                    <p className="text-lg font-semibold text-gray-800 mb-2">
                      Click to upload images
                    </p>
                    <p className="text-sm text-gray-600">
                      JPEG, PNG, or WebP (max 5MB each, up to 5 images)
                    </p>
                  </label>
                </div>

                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <FaImage className="text-gray-700 w-5 h-5" />
                      <span className="font-semibold text-gray-800">
                        Images ({formData.images.length}/5)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="relative w-full h-32 border-2 border-gray-300 rounded-2xl overflow-hidden bg-gray-200">
                            <Image
                              src={image}
                              alt={"Image"}
                              width={200}
                              height={200}
                              className="rounded-lg object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="bg-gray-800 hover:bg-black text-white p-2 rounded-full transition-colors duration-200 hover:scale-110"
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Featured Product */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-6 border border-gray-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                    <FaStar className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Featured Product</h4>
                    <p className="text-gray-700">Mark this product as featured to highlight it</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-400 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-gray-700 peer-checked:to-gray-900"></div>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-8 py-6 border-t border-gray-300 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 text-gray-700 hover:text-gray-900 font-semibold border-2 border-gray-400 rounded-xl hover:bg-gray-200 transition-all duration-200 hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-gradient-to-r from-gray-800 via-black to-gray-800 hover:from-black hover:via-gray-900 hover:to-black text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            {product ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </div>

      <style jsx>{`
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #6b7280 #f9fafb;
      }
      
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f9fafb;
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #6b7280 0%, #374151 100%);
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #4b5563 0%, #1f2937 100%);
      }
    `}</style>
    </div>
  );
};

export default ProductModal;