"use client";
import React from "react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              About This ProJect
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
            {/* Left Column */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-blue-400">Built for Learning</h2>
                <p className="text-gray-300 leading-relaxed">
                  This e-commerce platform is a personal hobby project designed to explore modern web development practices. 
                  It serves as a practical playground for experimenting with React, Next.js, and full-stack development concepts.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4 text-purple-400">Technology Stack</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                    <span className="text-sm font-medium">Next.js</span>
                  </div>
                  <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                    <span className="text-sm font-medium">React</span>
                  </div>
                  <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                    <span className="text-sm font-medium">Tailwind CSS</span>
                  </div>
                  <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                    <span className="text-sm font-medium">MongoDB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-green-400">Made in Pakistan</h2>
                <p className="text-gray-300 leading-relaxed">
                  Proudly developed from Pakistan 🇵🇰, this project represents the growing tech community 
                  and innovation coming from the region. It`&apos;s a testament to the passion for technology 
                  and continuous learning that drives developers worldwide.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4 text-yellow-400">Purpose & Goals</h2>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start space-x-3">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>Practice modern React patterns and hooks</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>Explore responsive design principles</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>Implement full-stack functionality</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>Learn by building real-world features</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="text-center bg-gray-900 p-6 rounded-lg border border-gray-700">
              <div className="text-3xl font-bold text-blue-400 mb-2">2024</div>
              <div className="text-gray-400 text-sm">Year Started</div>
            </div>
            <div className="text-center bg-gray-900 p-6 rounded-lg border border-gray-700">
              <div className="text-3xl font-bold text-purple-400 mb-2">∞</div>
              <div className="text-gray-400 text-sm">Learning Hours</div>
            </div>
            <div className="text-center bg-gray-900 p-6 rounded-lg border border-gray-700">
              <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
              <div className="text-gray-400 text-sm">Open Source</div>
            </div>
            <div className="text-center bg-gray-900 p-6 rounded-lg border border-gray-700">
              <div className="text-3xl font-bold text-yellow-400 mb-2">1</div>
              <div className="text-gray-400 text-sm">Developer</div>
            </div>
          </div>

          {/* Links Section */}
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-8 ">
            <h2 className="text-2xl font-semibold mb-6 text-center">Connect & Explore</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4  ">
              <Link
                href="https://github.com/hamsashahbaz11-rgb"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-3 bg-gray-800 hover:bg-gray-700 p-4 rounded-lg border border-gray-600 transition-colors group"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-sm font-medium">GitHub</span>
              </Link>

              <Link
                href="/products"
                className="flex items-center justify-center space-x-3 bg-blue-900 hover:bg-blue-800 p-4 rounded-lg border border-blue-700 transition-colors group"
              >
                <svg className="w-5 h-5 text-blue-400 group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="text-sm font-medium">Products</span>
              </Link>
 

              <Link
                href="https://www.linkedin.com/in/hamza-shahbaz-hamza-a37637380/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-3 bg-green-900 hover:bg-green-800 p-4 rounded-lg border border-green-700 transition-colors group"
              >
                <svg className="w-5 h-5 text-green-400 group-hover:text-green-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-sm font-medium">LinkedIn</span>
              </Link>
            </div>
          </div>

          {/* Footer Message */}
          <div className="text-center mt-12 pt-8 border-t border-gray-800">
            <p className="text-gray-400">
              Thanks for taking the time to explore this project. Every line of code represents a step in the journey of continuous learning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}