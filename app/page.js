'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaArrowRight, FaStar, FaShoppingBag, FaTruck, FaShieldAlt, FaHeart, FaFire } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const [email, setEmail] = useState("")

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const categories = [
    {
      name: 'Men',
      href: '/products?category=men',
      gradient: 'from-blue-600 to-purple-600',
      hoverGradient: 'hover:from-blue-700 hover:to-purple-700',
      icon: '👔',
      description: 'Stylish & Professional',
      bgPattern: 'bg-gradient-to-br from-blue-50 to-purple-50'
    },
    {
      name: 'Women',
      href: '/products?category=women',
      gradient: 'from-pink-500 to-rose-500',
      hoverGradient: 'hover:from-pink-600 hover:to-rose-600',
      icon: '👗',
      description: 'Elegant & Trendy',
      bgPattern: 'bg-gradient-to-br from-pink-50 to-rose-50'
    },
    {
      name: 'Children',
      href: '/products?category=children',
      gradient: 'from-green-500 to-emerald-500',
      hoverGradient: 'hover:from-green-600 hover:to-emerald-600',
      icon: '🧸',
      description: 'Fun & Comfortable',
      bgPattern: 'bg-gradient-to-br from-green-50 to-emerald-50'
    }
  ];

  const features = [
    {
      icon: <FaTruck className="text-3xl" />,
      title: 'Free Shipping',
      description: 'Free delivery on orders over $15'
    },
    {
      icon: <FaShieldAlt className="text-3xl" />,
      title: 'Cash on Delivery',
      description: '100% secure payment methods'
    },
    {
      icon: <FaHeart className="text-3xl" />,
      title: 'Quality Products',
      description: 'Premium quality guaranteed'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Happy Customers' },
    { number: '500+', label: 'Products' },
    { number: '50+', label: 'Brands' },
    { number: '99%', label: 'Satisfaction' }
  ];

  const handleSubmitEmail = async()=>{
    try {
      const response = await fetch("/api/EmailSubcribe",{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(email)
      })
      if(response.status === 200)
       toast.success('Subscribed successfully!');

      console.log(response)

    } catch (error) {
      toast.error("Could not Subscibe, Try again")
    }
  }
return (
    <main className="overflow-hidden bg-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-20 -left-4 w-72 h-72 bg-slate-700 rounded-full mix-blend-multiply filter blur-xl opacity-30"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute top-40 -right-4 w-72 h-72 bg-slate-600 rounded-full mix-blend-multiply filter blur-xl opacity-30"
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute -bottom-8 left-20 w-72 h-72 bg-slate-800 rounded-full mix-blend-multiply filter blur-xl opacity-30"
            animate={{
              x: [0, -100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <motion.span 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 border border-slate-600 text-slate-200 px-6 py-3 rounded-full text-sm font-semibold mb-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaFire className="text-slate-400" />
              New Collection Available
            </motion.span>
          </motion.div>

          <motion.h1 
            className="text-6xl md:text-8xl font-black  mb-6 leading-tight  bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"  
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Fashion
            <span className="bg-gradient-to-r from-slate-400 to-slate-300 bg-clip-text text-transparent">
              {" "}Forward
            </span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover the latest trends in fashion. From elegant shirts to comfortable pants, 
            find everything you need to express your unique style.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link href="/products">
              <motion.button 
                className="group relative px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 border border-slate-600 text-slate-200 rounded-full font-bold text-lg shadow-2xl hover:shadow-slate-800/50 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-3">
                  Shop Now
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 blur opacity-0 group-hover:opacity-75 transition-opacity duration-300 -z-10"></div>
              </motion.button>
            </Link>

            <motion.button 
              className="px-8 py-4 border-2 border-slate-600 text-slate-300 rounded-full font-bold text-lg backdrop-blur-sm hover:bg-slate-800/30 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Watch Collection
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="backdrop-blur-sm bg-slate-800/30 rounded-2xl p-6 border border-slate-700"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl font-black text-slate-200 mb-2">{stat.number}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-slate-400 rounded-full mt-2 animate-bounce"></div>
          </div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black text-slate-100 mb-6">
              Shop by 
              <span className="bg-gradient-to-r from-slate-400 to-slate-300 bg-clip-text text-transparent">
                {" "}Category
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Explore our carefully curated collections designed for every style and occasion
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group cursor-pointer"
              >
                <Link href={category.href}>
                  <div className="relative h-80 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 overflow-hidden shadow-xl group-hover:shadow-2xl group-hover:border-slate-600 transition-all duration-500">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 right-4 text-6xl text-slate-600">
                        {category.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div>
                        <div className="text-4xl mb-4 text-slate-400">{category.icon}</div>
                        <h3 className="text-3xl font-black text-slate-100 mb-2">
                          {category.name}
                        </h3>
                        <p className="text-slate-400 text-lg">
                          {category.description}
                        </p>
                      </div>

                      <motion.button 
                        className="self-start px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 border border-slate-600 text-slate-200 rounded-full font-bold shadow-lg transform transition-all duration-300 group-hover:shadow-xl hover:from-slate-600 hover:to-slate-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Explore for {category.name}
                      </motion.button>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-800/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black text-slate-100 mb-6">
              Why Choose
              <span className="bg-gradient-to-r from-slate-400 to-slate-300 bg-clip-text text-transparent">
                {" "}Us?
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="text-center p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-lg hover:shadow-xl hover:border-slate-600 transition-all duration-300"
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-slate-700 to-slate-800 border border-slate-600 text-slate-300 rounded-2xl mb-6"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-2xl font-bold text-slate-200 mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-lg">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-100 mb-6">
              Stay Updated with Latest Trends
            </h2>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
              Subscribe to our newsletter and be the first to know about new collections and exclusive offers
            </p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                onChange={(e)=> setEmail(e.target.value)}
                className="flex-1 px-6 py-4 bg-slate-800 border border-slate-600 rounded-full text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              />
              <motion.button 
                className="px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 border border-slate-600 text-slate-200 rounded-full font-bold hover:from-slate-600 hover:to-slate-700 transition-all duration-300 whitespace-nowrap"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmitEmail}
              >
                Subscribe
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          style={{ y: y1 }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-slate-800/20 to-slate-700/20"></div>
        </motion.div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-black text-slate-100 mb-6">
              Ready to Start Shopping?
            </h2>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
              Join thousands of satisfied customers and discover your perfect style today
            </p>
            
            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <motion.button 
                  className="group px-8 py-4 bg-slate-200 text-slate-900 rounded-full font-bold text-lg shadow-2xl hover:shadow-slate-200/25 transition-all duration-300 hover:bg-slate-100"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center gap-3">
                    <FaShoppingBag />
                    Start Shopping
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Home;
