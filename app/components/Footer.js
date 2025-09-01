
import { Github, X } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { FaGithub, FaGithubAlt, FaLinkedin, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-black via-gray-900 to-black border-t border-gray-800 overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-900/10 to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>

      {/* Subtle animated particles */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Top section with brand and links */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-4">
              E-COMMERCE
            </h3>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Curating exceptional experiences through premium quality and unmatched elegance.
            </p>
            {/* Social icons */}
            <div className="flex space-x-4 mt-6">

              <Link href={"https://github.com/hamsashahbaz11-rgb"}>
                <div className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/25">
                  <div className="w-4 h-4 bg-gray-400 rounded-sm">
                    <FaGithub />
                  </div>
                </div>

              </Link>

             <Link href={"https://www.linkedin.com/in/hamza-shahbaz-hamza-a37637380/"}>
                <div className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/25">
                  <div className="w-4 h-4 bg-gray-400 rounded-sm">
                    <FaLinkedin />
                  </div>
                </div>

              </Link>

            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {['About Us', 'Collections', 'Contact', 'Support'].map((link) => (
                <li key={link} href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">
                  {link}
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Customer Care</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Shipping Info', 'Returns'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>



        {/* Bottom section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>© {new Date().getFullYear()} E-Commerce. All rights reserved.</span>
            </div>

            <div className="flex items-center space-x-4 text-gray-400 flex-wrap flex-col md:flex-row">
              <span>Crafted with excellence by</span>
              <Link
                href="mailto:email@gmail.com"
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-300 hover:underline"
              >
                {process.env.NEXT_PUBLIC_EMAIL}@gmail.com
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
    </footer>
  );
};

export default Footer;