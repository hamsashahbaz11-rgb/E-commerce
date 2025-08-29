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

// ruaooaewrqzthgho