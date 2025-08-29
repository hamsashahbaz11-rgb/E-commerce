import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';

// GET handler - Get all sales for a seller
export async function GET(req) {
  try {
    await connectDB();

    // Get sellerId from the URL search params
    const url = new URL(req.url);
    const sellerId = url.searchParams.get('sellerId');

    if(!sellerId){
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      );
    }

    // Verify seller exists
    const seller = await User.findById(sellerId);
    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }


    if (!seller.isSeller) {
      return NextResponse.json(
        { error: 'User is not a seller' },
        { status: 403 }
      );
    }

    

    const user = await User.findById(sellerId);
    const sales = []
    const customersOfSeller = []
  for(let i = 0; i < user.orders.length; i++) {
     const ordersFromSeller = await Order.findById(user.orders[i]);
     sales.push(ordersFromSeller)
     const customerOfSeller = await User.findById(ordersFromSeller.user);
     customersOfSeller.push(customerOfSeller)
     }   
    sales.reverse();
    customersOfSeller.reverse();
  
  async function fetchCustomersInfo(){
    const customers = []
    for(let i = 0; i < sales?.sales?.length; i++){ 
    const customer = await User.findById(sales.sales[i].user);
      customers.push(customer)
    }
    return customers;
    
  } 


    return NextResponse.json(
      {
        success: true,
        count: sales.length,
        sales: sales,
        user: fetchCustomersInfo
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/seller/sales:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales', details: error.message },
      { status: 500 }
    );
  }
}