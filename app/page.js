import React from 'react';
import Layout from './components/Layout';
import Link from 'next/link'; 

const Home = () => {
  return (
    <Layout>
      <div className="relative text-center my-3 py-20 bg-gradient-to-br from-blue-100 to-blue-300 rounded-3xl shadow-2xl mx-4 md:mx-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-blue-400 opacity-30 rounded-3xl animate-pulse"></div>
        <h1 className="text-4xl font-extrabold text-blue-900 mb-6 animate-slide-up">Welcome to Our E-Commerce Store</h1>
        <p className="text-lg text-gray-700 mb-10 animate-slide-up delay-200 mx-72">
    Here , you can find all kinds of Clothes like pent , shirt and other. Discover this . And find you liky things.
        </p>
        <div className="flex justify-center space-x-8 mb-10 animate-fade-in delay-400">
          <Link href="/products?category=men">
            <button className="px-4  py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition duration-300 shadow-lg transform hover:scale-105">
              Men
            </button>
          </Link>
          <Link href="/products?category=women">
            <button className="px-4  py-2 rounded-full bg-gradient-to-r from-pink-500 to-pink-700 hover:from-pink-600 hover:to-pink-800 transition duration-300 shadow-lg transform hover:scale-105">
              Women
            </button>
          </Link>
          <Link href="/products?category=children">
            <button className="px-4  py-2 rounded-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition duration-300 shadow-lg transform hover:scale-105">
              Children
            </button>
          </Link>
        </div>
        <button className="px-8 py-3 text-2xl rounded-full bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 transition duration-300 shadow-2xl transform hover:scale-110 animate-bounce delay-600">
          Shop Now
        </button>
      </div>
    </Layout>
  );
};

export default Home;
