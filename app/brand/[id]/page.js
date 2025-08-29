// "use client"
// import ProductCard from '@/app/components/ProductCard'
// import React, { useEffect, useState } from 'react'
// import { FaTrash } from 'react-icons/fa'
// import { useParams } from 'next/navigation'
// import toast from 'react-hot-toast'


// const BrandingPage = () => {
//     const [loading, setLoading] = useState(false)
//     const [error, setError] = useState(false)
//     const [sales, setSales] = useState(0)
//     const [products, setProducts] = useState([])
//     const params = useParams()
//     const [userInfo, setUserInfo] = useState({})

//     useEffect(() => {
//         const fetchSellerData = async () => {
//             try {

//                 // Fetch products
//                 const productsResponse = await fetch(`/api/seller/products?sellerId=${params.id}`);
//                 const productsData = await productsResponse.json();

//                 if (!productsResponse.ok) {
//                     throw new Error(productsData.error || 'Failed to fetch products');
//                 }

//                 setProducts(productsData.products || []);

//                 // Fetch sales data
//                 const salesResponse = await fetch(`/api/seller/sales?sellerId=${params.id}`);
//                 const salesData = await salesResponse.json();

//                 if (!salesResponse.ok) {
//                     throw new Error(salesData.error || 'Failed to fetch sales data');
//                 }

//                 setSales(salesData.sales.length || 0);

//             } catch (err) {
//                 console.error('Error fetching seller data:', err);
//                 setError(err.message);
//                 // toast.error(err.message); // Uncomment if you have toast
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchSellerData()
//     }, []);
//     useEffect(() => {

//         const getSellerInfo = async () => {
//             setLoading(true);
//             setError(null);

//             try {
//                 const userResponse = await fetch(`/api/users/${params.id}`, {
//                     headers: {
//                         'Authorization': `Bearer ${localStorage.getItem("token")}`,
//                     }
//                 });

//                 if (!userResponse.ok) {
//                     toast.error("Could not fetch data")
//                 }
//                 const userData = await userResponse.json();
//                 setUser(userData.user);
              



//             } catch (error) {

//             }
//         }

//         getSellerInfo()
//     }, [])



//     if (loading) {
//         return (
//             <div className="min-h-screen bg-black flex items-center justify-center px-4">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-16 sm:h-32 w-16 sm:w-32 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
//                     <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Loading Dashboard...</h2>
//                     <p className="text-gray-400 text-sm sm:text-base">Please wait while we fetch your data</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="min-h-screen bg-black flex items-center justify-center px-4">
//                 <div className="bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-700 max-w-md mx-auto">
//                     <div className="text-center">
//                         <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
//                             <FaTrash className="text-white text-lg sm:text-2xl" />
//                         </div>
//                         <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Error</h2>
//                         <p className="text-gray-400 mb-4 text-sm sm:text-base">{error}</p>
//                         <p className="text-gray-500 text-xs sm:text-sm">Please try again later or contact support if the problem persists.</p>
//                         <button
//                             onClick={() => window.location.reload()}
//                             className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200 text-sm sm:text-base"
//                         >
//                             Retry
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     }
//     return (
//         <div>
//             user.name
//             user.email
//             user.isSeller
//             user.sellerInfo.isApproved
//             user.sellerInfo.averageRating
//             user.sellerInfo?.shopName
//             user.sellerInfo?.businessType
//             user.sellerInfo?.productsToSell
//             user.sellerInfo?.description

//             {products.map((product) => (
//                 <ProductCard key={product._id} product={product} />
//             ))}
//         </div>
//     )
// }

// export default BrandingPage

"use client"
import ProductCard from '@/app/components/ProductCard'
import React, { useEffect, useState } from 'react'
import { FaTrash, FaStar, FaStore, FaChartLine, FaBox, FaUser, FaEnvelope, FaShieldAlt, FaTags, FaBuilding, FaFileAlt } from 'react-icons/fa'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
const BrandingPage = () => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [sales, setSales] = useState(0)
    const [products, setProducts] = useState([])
    const [user, setUser] = useState({})
    const params = useParams()

  
    
    useEffect(() => {
        const fetchSellerData = async () => {
            try {
                // Fetch products
                const productsResponse = await fetch(`/api/seller/products?sellerId=${params.id}`);
                const productsData = await productsResponse.json();

                if (!productsResponse.ok) {
                    throw new Error(productsData.error || 'Failed to fetch products');
                }

                setProducts(productsData.products || []);

                // Fetch sales data
                const salesResponse = await fetch(`/api/seller/sales?sellerId=${params.id}`);
                const salesData = await salesResponse.json();

                if (!salesResponse.ok) {
                    throw new Error(salesData.error || 'Failed to fetch sales data');
                }

                setSales(salesData.sales.length || 0);

            } catch (err) {
                console.error('Error fetching seller data:', err);
                setError(err.message);
            }
        };

        const getSellerInfo = async () => {
            try {
                const userResponse = await fetch(`/api/users/${params.id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    }
                });

                if (!userResponse.ok) {
                    toast.error("Could not fetch data")
                    throw new Error("Could not fetch user data");
                }
                const userData = await userResponse.json();
                setUser(userData.user);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        Promise.all([fetchSellerData(), getSellerInfo()]);
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-gradient-to-r from-purple-400 to-pink-400 mx-auto mb-6"></div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-xl animate-pulse"></div>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                        Loading Dashboard
                    </h2>
                    <p className="text-gray-400 text-lg">Preparing your seller profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4">
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 max-w-md mx-auto shadow-2xl">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-red-500/30">
                            <FaTrash className="text-red-400 text-2xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
                        <p className="text-gray-400 mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const StatCard = ({ icon, title, value, subtitle, gradient }) => (
        <div className={`relative group overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 hover:scale-105 transition-all duration-500 shadow-xl hover:shadow-2xl`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-white/80 text-2xl">{icon}</div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">{value}</div>
                        <div className="text-white/70 text-sm">{subtitle}</div>
                    </div>
                </div>
                <div className="text-white/90 font-medium">{title}</div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
        </div>
    );

    const InfoCard = ({ icon, title, value, accent = false }) => (
        <div className={`relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] ${accent ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30' : 'bg-gray-800/50 border border-gray-700/50'} backdrop-blur-sm`}>
            <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${accent ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700/50 text-gray-400'}`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <div className="text-sm text-gray-400 font-medium">{title}</div>
                    <div className={`font-semibold ${accent ? 'text-purple-300' : 'text-white'}`}>{value || 'Not provided'}</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden">
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
                <div className="absolute top-1/2 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
            </div>

            <div className="relative z-10 px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-12 animate-fade-in">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
                            Seller Profile
                        </h1>
                        <p className="text-gray-400 text-lg">Complete seller profile and performance metrics</p>
                        <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mt-4 rounded-full"></div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <StatCard 
                            icon={<FaChartLine />}
                            title="Total Sales"
                            value={sales}
                            subtitle="Orders"
                            gradient="from-green-500 to-emerald-600"
                        />
                        <StatCard 
                            icon={<FaBox />}
                            title="Products Listed"
                            value={products.length}
                            subtitle="Items"
                            gradient="from-blue-500 to-indigo-600"
                        />
                        <StatCard 
                            icon={<FaStar />}
                            title="Average Rating"
                            value={user.sellerInfo?.averageRating || 'NON'}
                            subtitle="Stars"
                            gradient="from-yellow-500 to-orange-600"
                        />
                    </div>

                    {/* Profile Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        {/* Main Profile Card */}
                        <div className="lg:col-span-2">
                            <div className="bg-gray-800/30 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
                                <div className="flex items-center space-x-6 mb-8">
                                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                                        {user.name?.charAt(0).toUpperCase() || 'S'}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2">{user.name || 'Seller Name'}</h2>
                                        <div className="flex items-center space-x-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user.sellerInfo?.isApproved ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                                                <FaShieldAlt className="inline mr-1" />
                                                {user.sellerInfo?.isApproved ? 'Verified' : 'Pending'}
                                            </span>
                                            {user.isSeller && (
                                                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-sm font-semibold">
                                                    <FaStore className="inline mr-1" />
                                                    Seller Account
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Shop Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoCard 
                                        icon={<FaUser />}
                                        title="Full Name"
                                        value={user.name}
                                    />
                                    <InfoCard 
                                        icon={<FaEnvelope />}
                                        title="Email Address"
                                        value={user.email}
                                    />
                                    <InfoCard 
                                        icon={<FaStore />}
                                        title="Shop Name"
                                        value={user.sellerInfo?.shopName}
                                        accent={true}
                                    />
                                    <InfoCard 
                                        icon={<FaBuilding />}
                                        title="Business Type"
                                        value={user.sellerInfo?.businessType}
                                    />
                                    <InfoCard 
                                        icon={<FaTags />}
                                        title="Products Category"
                                        value={user.sellerInfo?.productsToSell}
                                    />
                                    <InfoCard 
                                        icon={<FaStar />}
                                        title="Rating"
                                        value={user.sellerInfo?.averageRating ? `${user.sellerInfo.averageRating} ★` : 'No ratings yet'}
                                        accent={true}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description Card */}
                        <div className="bg-gray-800/30 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl h-fit">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-gray-700/50 rounded-lg">
                                    <FaFileAlt className="text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Shop Description</h3>
                            </div>
                            <p className="text-gray-300 leading-relaxed">
                                {user.sellerInfo?.description || 'No description provided by the seller yet.'}
                            </p>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="bg-gray-800/30 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-3xl font-bold text-white mb-2">Products Catalog</h3>
                                <p className="text-gray-400">Browse all products from this seller</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    {products.length}
                                </div>
                                <div className="text-gray-400 text-sm">Total Products</div>
                            </div>
                        </div>

                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <div key={product._id} className="transform hover:scale-105 transition-all duration-300">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FaBox className="text-4xl text-gray-500" />
                                </div>
                                <h4 className="text-2xl font-bold text-gray-400 mb-2">No Products Yet</h4>
                                <p className="text-gray-500">This seller hasn&apos;t listed any products yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

export default BrandingPage;