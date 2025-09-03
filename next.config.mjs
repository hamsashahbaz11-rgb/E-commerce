/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    // This allows Next.js's Image component to optimize images from specified remote domains.
    remotePatterns: [
      {
        protocol: 'https', // Specifies the protocol (e.g., 'http', 'https')
        hostname: 'res.cloudinary.com', // The hostname of your image source
        // The pathname allows you to specify a path prefix.
        // '/**' means any path under the hostname is allowed.
        pathname: '/**',
      },
    ],
  },
};

// Export the configuration object
export default nextConfig;


// next.config.js
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: false, // Temporarily disable for debugging
//   swcMinify: true,
 
//   experimental: {
//     serverComponentsExternalPackages: [], // Add problematic packages here if needed
//   },
//   // Enable detailed errors in production (remove after debugging)
//   productionBrowserSourceMaps: true,
//   compiler: {
//     removeConsole: false, // Keep console logs for debugging
//   },
//   // Add this to see detailed errors temporarily
//   env: {
//     CUSTOM_KEY: process.env.NODE_ENV,
//   },
//    images: {
//     // This allows Next.js's Image component to optimize images from specified remote domains.
//     remotePatterns: [
//       {
//         protocol: 'https', // Specifies the protocol (e.g., 'http', 'https')
//         hostname: 'res.cloudinary.com', // The hostname of your image source
//         // The pathname allows you to specify a path prefix.
//         // '/**' means any path under the hostname is allowed.
//         pathname: '/**',
//       },
//     ],
//   },

// }

// export default nextConfig