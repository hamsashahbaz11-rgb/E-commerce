
'use client'

import React, { useState, useEffect } from 'react';
import {
  Package,
  User,
  MapPin,
  Clock,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const AdminOrderAssignment = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [deliveryMen, setDeliveryMen] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedArea, setSelectedArea] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');

    if (!userEmail) {
      router.push('/auth/login');
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/orders/unassigned?userEmail=${encodeURIComponent(userEmail)}`);
      const data = await response.json();

      if (data.success) { 
        const ordersFromApi = Array.isArray(data.orders) ? data.orders : [];
        const deliveryMenFromApi = Array.isArray(data.deliveryMen) ? data.deliveryMen : []
        
        setOrders(ordersFromApi);
        setDeliveryMen(deliveryMenFromApi);
        setFilteredOrders(ordersFromApi);
      } else {
        setError(data.error || 'Failed to fetch data');
        setOrders([]);
        setDeliveryMen([]);
        setFilteredOrders([]);
      }
    } catch (err) {
      setError('Failed to fetch data');
      setOrders([]);
      setDeliveryMen([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = orders;

    if (selectedArea !== 'all') {
      const sel = selectedArea?.trim().toLowerCase();
      filtered = filtered.filter(order => {
        const city = order?.shippingAddress?.city ?? '';
        return city.trim().toLowerCase() === sel;
      });
    }

    if (searchTerm) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(order => {
        const idMatch = order._id?.toLowerCase().includes(term);
        const userName = order.user?.name ?? '';
        const userMatch = userName.toLowerCase().includes(term);
        return idMatch || userMatch;
      });
    }

    setFilteredOrders(filtered);
  }, [orders, selectedArea, searchTerm]);

  const assignDeliveryMan = async (orderId, deliveryManEmail, deliveryManId) => {
    try {
      setError(null);
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setError('Unauthorized');
        router.push('/auth/login');
        return;
      }

        const response = await fetch(`/api/admin/orders/assign?userEmail=${userEmail}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, deliveryManEmail, newStatus: "assigned", deliveryManId }),
      });

      const data = await response.json();

      if (data.success) {
 
        await fetchData();
        setShowAssignModal(false);
        setSelectedOrder(null);
      } else {
        setError(data.error || 'Failed to assign delivery man');
      }
    } catch (err) {
      setError('Failed to assign delivery man');
    }
  };
 
  const getAvailableDeliveryMen = (orderArea) => {
    if (!Array.isArray(deliveryMen)) return [];

    const target = (orderArea ?? '').trim().toLowerCase();

    return deliveryMen.filter((dm) => {
      if (!dm || !dm.deliverymanInfo) return false;

      const dmArea = (dm.deliverymanInfo.area ?? '').trim().toLowerCase();
      const available = !!dm.deliverymanInfo.availableForDelivery;
      const assignedArr = Array.isArray(dm.deliverymanInfo.assignedOrders) ? dm.deliverymanInfo.assignedOrders : [];
      const assignedCount = assignedArr.length;




      return dmArea.includes(target) && available && assignedCount < 5;
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      unassigned: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      out_for_delivery: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

    const areas = [
    'all',
    ...Array.from(
      new Set(
        orders
          .map((order) => (order?.shippingAddress?.city ?? '').trim().toLowerCase())
          .filter((c) => c) 
      )
    ),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    
 
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-500 p-2 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Order Assignment</h1>
                <p className="text-sm text-slate-300">Assign orders to delivery personnel</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                >
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area === 'all' ? 'All Areas' : area.charAt(0).toUpperCase() + area.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-sm text-slate-300">Showing {filteredOrders.length} orders</div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 hover:bg-slate-750 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-slate-700 p-2 rounded-lg">
                    <Package className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Order #{String(order._id).slice(-6)}</h3>
                    <p className="text-sm text-slate-400">{order.user?.name ?? '—'}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.deliveryStatus)}`}>
                  {String(order.deliveryStatus ?? '').replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <MapPin className="h-4 w-4" />
                  <span>{`${order.shippingAddress?.street ?? ''}${order.shippingAddress?.city ? ', ' + order.shippingAddress.city : ''}`}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">
                    Area: <span className="font-medium capitalize text-slate-200">{order.shippingAddress?.city ?? '—'}</span>
                  </span>
                  <span className="text-white font-semibold">${order.totalPrice ?? 0}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <Clock className="h-4 w-4" />
                  <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</span>
                </div>
              </div>

              {order.deliveryMan ? (
                <div className="bg-emerald-900/30 border border-emerald-800 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-300">Assigned to {order.deliveryMan.name ?? '—'}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-amber-900/30 border border-amber-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-amber-400" />
                      <span className="text-sm font-medium text-amber-300">Awaiting Assignment</span>
                    </div>
                  </div>

                  {getAvailableDeliveryMen(order.shippingAddress?.city ?? '').length > 0 ? (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowAssignModal(true);
                      }}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm font-medium shadow-lg"
                    >
                      Assign Delivery Person
                    </button>
                  ) : (
                    <div className="text-sm text-red-300 bg-red-900/30 border border-red-800 p-3 rounded-lg">
                      No available delivery personnel in {order.shippingAddress?.city ?? 'this'} area
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Orders Found</h3>
            <p className="text-slate-400">No orders match your current filters.</p>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 max-w-md w-full">
            <div className="px-6 py-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Assign Delivery Person</h3>
              <p className="text-sm text-slate-400">Order #{String(selectedOrder._id).slice(-6)}</p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {getAvailableDeliveryMen(selectedOrder.shippingAddress?.city ?? '').map((deliveryMan) => (
                  <div key={deliveryMan._id} className="border border-slate-600 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{deliveryMan.name}</h4>
                        <p className="text-sm text-slate-300">{deliveryMan.email}</p>
                        <p className="text-sm text-slate-400">
                          Active Orders: {Array.isArray(deliveryMan.deliverymanInfo?.assignedOrders) ? deliveryMan.deliverymanInfo.assignedOrders.length : 0}/5
                        </p>
                        <p className="text-sm text-slate-400">Total Earnings: ${deliveryMan.deliverymanInfo?.earnings ?? 0}</p>
                      </div>
                      <button
                        onClick={() => assignDeliveryMan(selectedOrder._id, deliveryMan.email, deliveryMan._id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm shadow-lg"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                ))}

                {getAvailableDeliveryMen(selectedOrder.shippingAddress?.city ?? '').length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-white mb-2">No Available Delivery Personnel</h4>
                    <p className="text-slate-400">
                      All delivery personnel in the {selectedOrder.shippingAddress?.city ?? 'selected'} area are currently unavailable or at capacity.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-700">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedOrder(null);
                }}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  
  );
};

export default AdminOrderAssignment;
