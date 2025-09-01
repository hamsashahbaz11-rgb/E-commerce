import { NextResponse } from 'next/server';
import User from '@/models/User';
import Product from '@/models/Product';
import connectDB from '@/lib/db';

export async function POST(req, { params }) {
    try {
        const { sellerId } = await req.json();
 

        await connectDB();

        const user  = await User.findById(sellerId)

        if(!user) {
             return NextResponse.json(
            { error: 'User not found' },
            { status: 500 }
        );
        }
        const updatedSeller = await User.findByIdAndUpdate(
            sellerId,
            {
                "sellerInfo.approved": true
            },
            { new: true }); 
        if(!updatedSeller) {
             return NextResponse.json({ error: "Could  not update Approve Status" }, { status: 404 });
        }

        return NextResponse.json({ message: "Seller approved Successfully" });
    } catch (error) {
        console.error('Failed to approve seller:', error);
        return NextResponse.json(
            { error: 'Failed to approve sellers' },
            { status: 500 }
        );
    }
}