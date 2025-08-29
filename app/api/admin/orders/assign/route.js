import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET() {
  await connectDB();

  try {
    // Find deliveryman by user email
    const deliveryman = await User.findOne({ email: session.user.email });
    if (!deliveryman) {
      return NextResponse.json({ message: "Deliveryman not found" }, { status: 404 });
    }

    const orders = await Order.find({
      deliveryStatus: "assigned",
      deliveryMan: deliveryman._id
    })
      .populate("user", "name email shippingAddress")
      .populate("deliveryMan", "name email");

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching assigned orders", error: error.message },
      { status: 500 }
    );
  }
}

// PATCH to update delivery status of an assigned order
export async function PATCH(req) {
  await connectDB();

  try {
    const url = new URL(req.url);
    const userEmail = url.searchParams.get("userEmail");

    if (!userEmail) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { orderId, newStatus, deliveryManEmail, deliveryManId } = await req.json();

    if (!orderId || !newStatus || !deliveryManEmail || !deliveryManId) {
      return NextResponse.json({ message: "Missing data" }, { status: 400 });
    }

    // Find deliveryman
    const deliveryman = await User.findOne({ email: deliveryManEmail });
    if (!deliveryman) {
      return NextResponse.json({ message: "Deliveryman not found" }, { status: 404 });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    order.deliveryMan = deliveryman._id;
    // Update status
    order.deliveryStatus = newStatus;
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      updatedBy: deliveryManId
    });

    if (newStatus === "delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    await order.save();
 
    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error) { 
    return NextResponse.json(
      { success: false, message: "Error updating order", error: error },
      { status: 500 }
    );
  }
}
