'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

// Minimal version to isolate the hydration issue
const ProductDetailDebug = () => {
    const params = useParams();
    const [isMounted, setIsMounted] = useState(false);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    console.log('=== PRODUCT COMPONENT RENDER ===');
    console.log('isMounted:', isMounted);
    console.log('params:', params);
    console.log('product:', product);
    console.log('===============================');

    useEffect(() => {
        console.log('Setting isMounted to true');
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted || !params?.id) return;

        console.log('Fetching product with ID:', params.id);

        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('Making API request to:', `/api/products/${params.id}`);

                const res = await fetch(`/api/products/${params.id}`);

                console.log('API Response status:', res.status);
                console.log('API Response ok:', res.ok);

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                console.log('API Response data:', data);

                if (!data.success || !data.product) {
                    throw new Error(data.error || 'Product not found');
                }

                setProduct(data.product);
                console.log('Product set successfully:', data.product);

            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
                console.log('Loading set to false');
            }
        };

        fetchProduct();
    }, [isMounted, params?.id]);

    // Don't render anything until mounted
    if (!isMounted) {
        console.log('Not mounted yet, showing loading...');
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div>Loading (Not Mounted)...</div>
            </div>
        );
    }

    if (loading) {
        console.log('Still loading, showing loading state...');
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div>Loading Product...</div>
            </div>
        );
    }

    if (error) {
        console.log('Error state:', error);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-600">
                    <h1>Error</h1>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!product) {
        console.log('No product found');
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div>No product found</div>
            </div>
        );
    }

    console.log('Rendering product successfully');

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto py-8 px-4">
                <div className="bg-white rounded-lg p-8">
                    <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                    <Image
                        src={product.images[0]?.url || product.images[0]?.url}
                        alt={`${product.name} - View ${0 + 1}`}
                        fill={true}
                        priority={false}
                        className="object-cover hover:scale-105 transition-transform duration-700 absolute"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="text-2xl font-bold text-green-600">
                        ${product.price}
                    </div>

                    {/* Debug info */}
                    <div className="mt-8 p-4 bg-gray-100 rounded">
                        <h3 className="font-bold">Debug Info:</h3>
                        <p>Product ID: {product._id}</p>
                        <p>Params ID: {params.id}</p>
                        <p>Is Mounted: {String(isMounted)}</p>
                        <p>Loading: {String(loading)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailDebug;