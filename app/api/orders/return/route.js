import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { isAuthenticated } from '@/lib/auth';

// export async function POST(request) {
//   try {
//     await connectDB();
//     const isAuth = await isAuthenticated(request);

//     if (!isAuth) {
//       return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
//     }

//     const { orderId, reason } = await request.json();

//     const order = await Order.findById(orderId);
//     if (!order) {
//       return NextResponse.json({ error: 'Order not found' }, { status: 404 });
//     }

//     // Check if return is within 30 days
//     const orderDate = new Date(order.deliveredAt);
//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

//     if (orderDate < thirtyDaysAgo) {
//       return NextResponse.json(
//         { error: 'Return period has expired (30 days)' },
//         { status: 400 }
//       );
//     }

//     // Update order with return request
//     order.returnRequest = {
//       status: 'pending',
//       requestDate: new Date(),
//       reason: reason
//     };

//     await order.save();

//     return NextResponse.json({
//       message: 'Return request submitted successfully',
//       order: order
//     });
//   } catch (error) {
//     console.error('Error processing return request:', error);
//     return NextResponse.json(
//       { error: 'Failed to process return request' },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request){
//   try {
//     const {orderId} = request.json();
//     await connectDB();
//     if(!orderId){
//     return NextResponse.json({message: "Order id is required"}, {status: 500})
//     }
//     const order = await Order.findByIdAndDelete(orderId)

//     if(!order){
//       return NextResponse.json({message: "Order could not be cancelled!"}, {status: 500})
//     }

//     return NextResponse.json({message: "Order Cancelled Successfully"}, {status: 200})

//   } catch (error) {

//   }
// }

const getScheduledDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + process.env.RETURNINGSCHEDULEDDATE);
  return date;
};

export async function POST(request) {
  try {
    await connectDB();
    const isAuth = await isAuthenticated(request);

    if (!isAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.log(isAuth.id)
    const { orderId, reason } = await request.json();
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    // Check if return is within 30 days
    const orderDate = new Date(order.deliveredAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (orderDate < thirtyDaysAgo) {
      return NextResponse.json(
        { error: 'Return period has expired (30 days)' },
        { status: 400 }
      );
    }
    // Update order with return request
    order.returnRequest.status = 'pending';
    order.returnRequest.requestDate = new Date();
    order.returnRequest.scheduledDate = getScheduledDate() 
    order.returnRequest.reason = reason;

    await order.save();

    console.log(order)
    return NextResponse.json({
      message: 'Return request submitted successfully',
      order: order
    });
  } catch (error) {
    console.error('Error processing return request:', error);
    return NextResponse.json(
      { error: 'Failed to process return request' },
      { status: 500 }
    );
  }
}

// export async function DELETE(request) {
//   try {
//     await connectDB();
//     const isAuth = await isAuthenticated(request);

//     if (!isAuth) {
//       return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
//     }

//     const { orderId } = await request.json(); // Added await here

//     if (!orderId) {
//       return NextResponse.json({ error: "Order Id is required" }, { status: 400 }); // Changed to 400
//     }

//     const order = await Order.findByIdAndDelete(orderId);
//     if (!order) {
//       return NextResponse.json({ error: "Order could not be cancelled!" }, { status: 404 }); // Changed to 404
//     }

//     return NextResponse.json({ message: "Order Cancelled Successfully" }, { status: 200 });
//   } catch (error) {
//     console.error('Error cancelling order:', error);
//     return NextResponse.json(
//       { error: 'Failed to cancel order' },
//       { status: 500 }
//     );
//   }
// }

export async function GET(request) {
  try {
    await connectDB();
    const isAuth = await isAuthenticated(request);
    console.log(isAuth.id)

    if (!isAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const orders = await Order.find(
      { user: isAuth.id,
         "returnRequest.status":{ 
          $nin: "none", 
          $exists: true
         } 
        })

        if(!orders){
          return NextResponse.json({error: "No return request found"}, {status: 404})
        }

        return NextResponse.json({message: "Return request found", orders }, {status: 200})


} catch (error) {
     return NextResponse.json({error: "Something went wrong!"}, {status: 500})
}
  
}