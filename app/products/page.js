"use client";
import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("");  
  const [inStock, setInStock] = useState(false);
  const [minRating, setMinRating] = useState(0);

  // Mobile filter toggle
  const [showFilters, setShowFilters] = useState(false);

  // Subcategory options based on category
  const subcategories = {
    men: ["shirts", "pants", "shoes", "accessories"],
    women: ["dresses", "tops", "pants", "shoes", "accessories"],
    children: ["boys", "girls", "shoes", "accessories"]
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        
        if (selectedCategory !== "all") {
          queryParams.append("category", selectedCategory);
        }
        if (selectedSubcategory !== "all") {
          queryParams.append("subcategory", selectedSubcategory);
        }
        if (inStock) {
          queryParams.append("inStock", "true");
        }
        if (minRating > 0) {
          queryParams.append("minRating", minRating);
        }

        const res = await fetch(`/api/products?${queryParams}`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data.products || []);
        setFilteredProducts(data.products || []);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, selectedSubcategory, inStock, minRating]);

  // Apply search and sort filters
  useEffect(() => {
    let updated = [...products];

    // Search filter
    if (searchTerm) {
      updated = updated.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sorting
    if (sortOrder === "lowToHigh") {
      updated.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "highToLow") {
      updated.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(updated);
  }, [searchTerm, sortOrder, products]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Search Bar */}
        <div className="mb-4 lg:mb-6">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 flex items-center justify-center space-x-2 hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            <span>Filters & Sort</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className={`
            ${showFilters ? 'block' : 'hidden lg:block'} 
            w-full lg:w-80 lg:flex-shrink-0
          `}>
            <div className="bg-gray-900 p-4 lg:p-6 rounded-lg shadow-lg space-y-4 lg:space-y-6 sticky top-4">
              <div className="flex items-center justify-between lg:block">
                <h2 className="text-lg lg:text-xl font-bold">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="font-semibold mb-2 text-sm lg:text-base">Category</h3>
                <select
                  className="w-full p-2 lg:p-3 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory("all");
                  }}
                >
                  <option value="all">All Categories</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="children">Children</option>
                </select>
              </div>

              {/* Subcategory Filter */}
              {selectedCategory !== "all" && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm lg:text-base">Subcategory</h3>
                  <select
                    className="w-full p-2 lg:p-3 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                  >
                    <option value="all">All Subcategories</option>
                    {subcategories[selectedCategory].map(sub => (
                      <option key={sub} value={sub}>
                        {sub.charAt(0).toUpperCase() + sub.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort by Price */}
              <div>
                <h3 className="font-semibold mb-2 text-sm lg:text-base">Sort by Price</h3>
                <select
                  className="w-full p-2 lg:p-3 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="">Default</option>
                  <option value="lowToHigh">Low to High</option>
                  <option value="highToLow">High to Low</option>
                </select>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm lg:text-base">In Stock Only</span>
                </label>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="font-semibold mb-2 text-sm lg:text-base">Minimum Rating</h3>
                <select
                  className="w-full p-2 lg:p-3 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                >
                  <option value={0}>All Ratings</option>
                  <option value={4}>4★ & Above</option>
                  <option value={3}>3★ & Above</option>
                  <option value={2}>2★ & Above</option>
                </select>
              </div>

              {/* Apply Filters Button (Mobile) */}
              <div className="lg:hidden pt-4">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
            {/* Results Count */}
            {!loading && !error && (
              <div className="mb-4 text-sm text-gray-400">
                Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </div>
            )}

            {loading && (
              <div className="text-center py-12 lg:py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading products...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {!loading && !error && filteredProducts.length === 0 && (
              <div className="text-center py-12 lg:py-16">
                <div className="text-6xl lg:text-8xl mb-4">🔍</div>
                <h3 className="text-lg lg:text-xl font-semibold mb-2">No products found</h3>
                <p className="text-gray-400 text-sm lg:text-base">
                  Try adjusting your search criteria or filters.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
              {!loading &&
                !error &&
                filteredProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}