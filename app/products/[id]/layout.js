
async function getProduct(id) {
  const url = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL
  const res = await fetch(`${url}/api/products/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }) {
  const id = (await params).id; // no await
  const objProduct = await getProduct(id);
  const product = objProduct.product

  if (!product) {
    return {
      title: 'Product Not Found - H-ecommerce',
      description: 'The requested product could not be found.',
    };
  }

  return {
    title: `${product.name} - H-ecommerce`,
    description: product.description,
    keywords: `${product.category}, ${product.subcategory}, ${product.brand}, online shopping`,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://h-eccomerce.vercel.app'),

    openGraph: {

      title: product.name,
      description: product.description,
      images: Array.isArray(product.images)
        ? product.images.map(img => ({
          url: img.url,
          width: 800,
          height: 600,
          alt: product.name,
        }))
        : [],
      type: 'website',
      website: {
        price: {
          amount: product.price,
          currency: 'USD',
        },
        availability: product.stock > 0 ? 'in stock' : 'out of stock',
      },
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: Array.isArray(product.images) && product.images.length > 0
        ? product.images[0].url
        : null,
    },
    other: {
      'og:type': 'product',
      'product:price:amount': product.price,
      'product:price:currency': 'USD',
      'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
      'product:brand': product.brand,
      'product:category': product.category,
      'product:images': Array.isArray(product.images) && product.images.length > 0
        ? product.images[0].url
        : null,
    },
  };
}

export default function ProductLayout({ children }) {
  return children;
}

// async function getProduct(id) {
//   const url = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://default-url.com';
//   console.log('Fetching URL:', `${url}/api/products/${id}`); // Log URL
//   const res = await fetch(`${url}/api/products/${id}`);
//   if (!res.ok) {
//     console.error(`Fetch failed with status: ${res.status}, ${res.statusText}`);
//     return null;
//   }
//   const data = await res.json();
//   console.log('API Response:', data); // Log response
//   return data;
// }

// export async function generateMetadata({ params }) {
//   const id = (await params).id;
//   const objProduct = await getProduct(id);
//   const product = objProduct?.product;

//   if (!product || !objProduct) {
//     return {
//       title: 'Product Not Found - H-ecommerce',
//       description: 'The requested product could not be found.',
//     };
//   }

//   const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://default-url.com';
//   const images = Array.isArray(product.images)
//     ? product.images
//         .filter(img => img && img.url && img.url.startsWith('http')) // Filter valid URLs
//         .map(img => ({
//           url: img.url,
//           width: 800,
//           height: 600,
//           alt: product.name || 'Product Image',
//         }))
//     : [];

//   return {
//     title: `${product.name || 'Untitled Product'} - H-ecommerce`,
//     description: product.description || 'No description available',
//     keywords: `${product.category || ''}, ${product.subcategory || ''}, ${product.brand || ''}, online shopping`,
//     metadataBase: new URL(baseUrl),

//     openGraph: {
//       title: product.name || 'Untitled Product',
//       description: product.description || 'No description available',
//       images,
//       type: 'website',
//       website: {
//         price: {
//           amount: product.price || 0,
//           currency: 'USD',
//         },
//         availability: product.stock > 0 ? 'in stock' : 'out of stock',
//       },
//     },
//     twitter: {
//       card: 'summary_large_image',
//       title: product.name || 'Untitled Product',
//       description: product.description || 'No description available',
//       images: images.length > 0 ? images[0].url : null,
//     },
//     other: {
//       'og:type': 'product',
//       'product:price:amount': product.price || 0,
//       'product:price:currency': 'USD',
//       'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
//       'product:brand': product.brand || 'Unknown',
//       'product:category': product.category || 'Unknown',
//       'product:images': images.length > 0 ? images[0].url : null,
//     },
//   };
// }

// export default function ProductLayout({ children }) {
//   return children;
// }