"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  MapPin,
  Bell,
  User,
  DollarSign,
  Eye,
  RotateCcw,
  Truck,
} from "lucide-react";

export default function DeliverymanDashboard() {
  const [activeTab, setActiveTab] = useState("normal"); // "normal" or "returns"
  const [activeOrders, setActiveOrders] = useState([]);
  const [returnOrders, setReturnOrders] = useState([]);
  const [deliveryStats, setDeliveryStats] = useState({
    totalEarnings: 0,
    todayDeliveries: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDeliveryData = async () => {
      try {
        const response = await fetch("/api/delivery", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch delivery data");
        }

        const data = await response.json();
        setActiveOrders(data.activeOrders);
        setDeliveryStats({
          totalEarnings: data.stats.totalEarnings,
          todayDeliveries: data.stats.todayDeliveries,
          pendingOrders: data.stats.pendingOrders,
          completedOrders: data.stats.completedOrders,
        });
      } catch (err) {
        console.error("Error fetching delivery data:", err);
        setError("Failed to load delivery data");
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryData();
  }, []);

  const fetchReturnOrders = async () => {
    try {
      const response = await fetch("/api/delivery/return-orders", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch return orders");
      }

      const data = await response.json();
      setReturnOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching return orders:", error);
      setError("Failed to load return orders");
    }
  };

  useEffect(() => {
    if (activeTab === "returns") {
      fetchReturnOrders();
    }
  }, [activeTab]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch("/api/delivery/return-orders", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update order status");
      }

      const data = await response.json();
      setActiveOrders(data.activeOrders);
      setDeliveryStats({
        totalEarnings: data.stats.totalEarnings,
        todayDeliveries: data.stats.todayDeliveries,
        pendingOrders: data.stats.pendingOrders,
        completedOrders: data.stats.completedOrders,
      });
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert(err.message);
    }
  };

  const handleReturnStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch("/api/delivery/return-orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ newStatus, _id: orderId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update return order status");
      }

      // Refresh return orders after update
      fetchReturnOrders();
    } catch (error) {
      console.error("Error updating return status:", error);
      alert("Error updating return status");
    }
  };

  const renderStatusButtons = (order) => {
    const statusActions = {
      assigned: { label: "Start Processing", next: "processing", color: "bg-blue-600 hover:bg-blue-700" },
      processing: { label: "Out for Delivery", next: "out_for_delivery", color: "bg-purple-600 hover:bg-purple-700" },
      out_for_delivery: { label: "Mark as Delivered", next: "delivered", color: "bg-green-600 hover:bg-green-700" },
    };

    const action = statusActions[order.deliveryStatus];
    if (!action) return null;

    return (
      <button
        onClick={() => updateOrderStatus(order._id, action.next)}
        className={`px-4 py-2 text-white rounded-lg transition-colors text-sm ${action.color}`}
      >
        {action.label}
      </button>
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      picked_up: "bg-blue-100 text-blue-800",
      out_for_delivery: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      assigned: "bg-gray-100 text-gray-800",
      processing: "bg-orange-100 text-orange-800",
      // Return status colors
      requested: "bg-red-100 text-red-800",
      approved: "bg-yellow-100 text-yellow-800",
      in_transit: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Pending Pickup",
      picked_up: "Picked Up",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      assigned: "Assigned",
      processing: "Processing",
      // Return status texts
      requested: "Return Requested",
      approved: "Return Approved",
      in_transit: "Return In Transit",
      completed: "Return Completed",
    };
    return texts[status] || status;
  };

  const renderReturnStatusSelect = (order) => {
    const returnStatus = order.returnRequest?.status || "requested";
    
    return (
      <select
        value={returnStatus}
        onChange={(e) => handleReturnStatusChange(order._id, e.target.value)}
        className={`px-2 py-1 rounded-full text-xs font-semibold border outline-none ${
          returnStatus === "requested"
            ? "bg-red-500 text-white"
            : returnStatus === "approved"
            ? "bg-yellow-500 text-white"
            : returnStatus === "in_transit"
            ? "bg-blue-500 text-white"
            : returnStatus === "completed"
            ? "bg-green-500 text-white"
            : "bg-gray-400 text-black"
        }`}
      >
        <option value="requested">Return Requested</option>
        <option value="approved">Approved</option>
        <option value="in_transit">In Transit</option>
        <option value="completed">Completed</option>
      </select>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-slate-700 p-3 rounded-xl">
              <Package className="h-7 w-7 text-slate-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Delivery Dashboard</h1>
              <p className="text-slate-400 mt-1">Manage deliveries & track your earnings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Earnings", value: `$${deliveryStats.totalEarnings}`, icon: DollarSign, bg: "bg-green-900/30", color: "text-green-400", iconBg: "bg-green-900/50" },
          { label: "Today's Deliveries", value: deliveryStats.todayDeliveries, icon: TrendingUp, bg: "bg-blue-900/30", color: "text-blue-400", iconBg: "bg-blue-900/50" },
          { label: "Pending Orders", value: deliveryStats.pendingOrders, icon: Clock, bg: "bg-yellow-900/30", color: "text-yellow-400", iconBg: "bg-yellow-900/50" },
          { label: "Completed Orders", value: deliveryStats.completedOrders, icon: CheckCircle, bg: "bg-emerald-900/30", color: "text-emerald-400", iconBg: "bg-emerald-900/50" },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} backdrop-blur-sm rounded-xl border border-slate-700 p-6 flex justify-between items-center hover:border-slate-600 transition-colors duration-200`}>
            <div>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
            </div>
            <div className={`${stat.iconBg} p-4 rounded-xl`}>
              <stat.icon className={`h-7 w-7 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-2 flex space-x-2 w-fit">
          <button
            onClick={() => setActiveTab("normal")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === "normal"
                ? "bg-slate-700 text-white border border-slate-600"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Normal Deliveries</span>
          </button>
          <button
            onClick={() => setActiveTab("returns")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === "returns"
                ? "bg-slate-700 text-white border border-slate-600"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <RotateCcw className="h-4 w-4" />
            <span>Return Orders</span>
          </button>
        </div>
      </div>

      {/* Orders Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-slate-800 p-2 rounded-lg">
              {activeTab === "normal" ? (
                <Package className="h-5 w-5 text-slate-400" />
              ) : (
                <RotateCcw className="h-5 w-5 text-slate-400" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-white">
              {activeTab === "normal" ? "Active Deliveries" : "Return Orders"}
            </h2>
          </div>

          {/* Normal Orders Tab */}
          {activeTab === "normal" && (
            <>
              {activeOrders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-slate-800 p-4 rounded-full w-fit mx-auto mb-4">
                    <Package className="h-12 w-12 text-slate-500 mx-auto" />
                  </div>
                  <p className="text-slate-400 text-lg">No active deliveries right now</p>
                  <p className="text-slate-500 text-sm mt-2">New orders will appear here when available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <div key={order._id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-slate-700 p-2 rounded-lg">
                            <Package className="h-5 w-5 text-slate-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-lg">{order.user.name}</h3>
                            <p className="text-slate-400 text-sm">{order.user.email}</p>
                          </div>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-xs font-semibold ${getStatusColor(order.deliveryStatus)}`}>
                          {getStatusText(order.deliveryStatus)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm mb-4">
                        <div className="flex items-center space-x-2 text-slate-300">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span>{order.shippingAddress?.street || "No address provided"}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-green-400 font-semibold">
                          <DollarSign className="h-4 w-4" />
                          <span>{order.totalPrice?.toFixed(2) || "0.00"}</span>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        {renderStatusButtons(order)}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Return Orders Tab */}
          {activeTab === "returns" && (
            <>
              {returnOrders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-slate-800 p-4 rounded-full w-fit mx-auto mb-4">
                    <RotateCcw className="h-12 w-12 text-slate-500 mx-auto" />
                  </div>
                  <p className="text-slate-400 text-lg">No return orders right now</p>
                  <p className="text-slate-500 text-sm mt-2">Return requests will appear here when available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {returnOrders.map((order) => (
                    <div key={order._id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-slate-700 p-2 rounded-lg">
                            <RotateCcw className="h-5 w-5 text-slate-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-lg">{order.user?.name || "Unknown Customer"}</h3>
                            <p className="text-slate-400 text-sm">{order.user?.email || "No email"}</p>
                          </div>
                        </div>
                        {renderReturnStatusSelect(order)}
                      </div>

                      <div className="flex justify-between items-center text-sm mb-4">
                        <div className="flex items-center space-x-2 text-slate-300">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span>{order.shippingAddress?.street || "No address provided"}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-green-400 font-semibold">
                          <DollarSign className="h-4 w-4" />
                          <span>{order.totalPrice?.toFixed(2) || "0.00"}</span>
                        </div>
                      </div>

                      <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-300">Return Reason:</span>
                          <span className="text-white">{order.returnRequest?.reason || "Not specified"}</span>
                        </div>
                        {order.returnRequest?.scheduledDate && (
                          <div className="flex justify-between items-center text-sm mt-2">
                            <span className="text-slate-300">Scheduled Date:</span>
                            <span className="text-white">
                              {new Date(order.returnRequest.scheduledDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="bg-slate-800 p-2 rounded-lg">
                  {activeTab === "normal" ? (
                    <Package className="h-5 w-5 text-slate-400" />
                  ) : (
                    <RotateCcw className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {activeTab === "normal" ? "Order Details" : "Return Order Details"}
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Customer:</span>
                  <span className="text-white">{selectedOrder.user?.name || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Email:</span>
                  <span className="text-white text-sm">{selectedOrder.user?.email || "No email"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Address:</span>
                  <span className="text-white text-sm text-right">{selectedOrder.shippingAddress?.street || "No address"}</span>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <div className="mb-3">
                  <span className="text-slate-400 font-medium">Items:</span>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-300">{item.product?.name || "Unknown Item"} x{item.quantity || 1}</span>
                      <span className="text-white font-medium">${item.price?.toFixed(2) || "0.00"}</span>
                    </div>
                  )) || <p className="text-slate-400 text-sm">No items found</p>}
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4 flex justify-between">
                <span className="text-slate-300">Payment Status:</span>
                <span className="text-white font-medium">{selectedOrder.isPaid ? 'Paid' : 'Not Paid'}</span>
              </div>

              {activeTab === "returns" && selectedOrder.returnRequest && (
                <div className="border-t border-slate-700 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">Return Reason:</span>
                    <span className="text-white font-medium">{selectedOrder.returnRequest.reason || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Return Status:</span>
                    <span className="text-white font-medium">{getStatusText(selectedOrder.returnRequest.status)}</span>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium text-lg">Total Amount:</span>
                  <span className="text-green-400 text-xl font-bold">${selectedOrder.totalPrice?.toFixed(2) || "0.00"}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-700">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors duration-200"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}