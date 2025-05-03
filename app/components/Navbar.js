"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { FaSearch, FaShoppingCart, FaUser } from 'react-icons/fa';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-blue-600 p-4 shadow-md sticky top-0 z-50 px-32">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-lg font-bold">E-Commerce 
        </Link>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              Categories
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
                <Link href="/products?category=men" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                  Men
                </Link>
                <Link href="/products?category=women"  className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Women 
                </Link>
                <Link href="/products?category=children" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Children 
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center bg-white rounded-full px-2">
            <input
              type="text"
              placeholder="Search"
              className="p-2 rounded-l-full focus:outline-none"
            />
            <button className="p-2">
              <FaSearch className="text-gray-600" />
            </button>
          </div>
          <Link href="/cart"  className="text-white hover:text-gray-200 flex items-center">
              <FaShoppingCart className="mr-1" /> Cart
             
          </Link>
          <Link href="/auth/login"  className="text-white hover:text-gray-200 flex items-center">
              <FaUser className="mr-1" /> Login
            
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 