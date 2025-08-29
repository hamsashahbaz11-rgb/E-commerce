import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { isDileveryMan } from "@/lib/auth";
import { NextResponse } from "next/server";



const getScheduledDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + process.env.RETURNINGSCHEDULEDDATE);
    return date;
};


export async function GET(request) {
    try {
        await connectDB();
        const isAuth = isDileveryMan(request);
        if (!isAuth) {
            return NextResponse.json({ error: "Unauthenticated User" }, { status: 404 })
        }

        const orders = await Order.find({
            user: isAuth.id,
            deliveryStatus: "delivered",
            "returnRequest.status": {
                $nin: ["none", "completed"]
            },
            $exists: true
        })
        if (!orders) {
            return NextResponse.json({ message: "Nothing to return" }, { status: 404 })
        }

        return NextResponse.json({ message: "Orders Got successfully", orders }, { status: 200 })



    } catch (err) {
        return NextResponse.json({ error: "Could get Returning orders", err }, { status: 404 })
    }
}

export async function PATCH(request) {
    try {
        await connectDB();
        const isAuth = isDileveryMan(request);
        if (!isAuth) {
            return NextResponse.json({ error: "Unauthenticated User" }, { status: 404 })
        }

        const { newStatus, _id } = request.json();
        if (!newStatus) {
            return NextResponse.json({ error: "New Status is missing!" }, { status: 404 })
        }

     

        const orders = await Order.findByIdAndUpdate(_id, {
            "returnRequest.status": newStatus,
            "returnRequest.processedDate": new Date(),
            "returnRequest.scheduledDate": getScheduledDate(),
            "returnRequest.processedBy": isAuth.id
        })

        if(!orders){
            return NextResponse.json({error: "Nothing to return"},{status: 200})
        }

        return NextResponse.json({message: "Orders updated successfully"}, {status: 200})
    } catch (error) {
         return NextResponse.json({error: "Could not get orders"},{status: 200})
    }
}
   //   returnRequest: {
        //       status: {
        //         type: String,
        //         enum: ['none', 'pending', 'approved', 'rejected', 'completed'],
        //         default: 'none'
        //       },
        //       requestDate: Date,
        //       reason: String,
        //       processedDate: Date,
        //       scheduledDate: Date,
        //       processedBy: {
        //         type: mongoose.Schema.Types.ObjectId,
        //         ref: 'User'
        //       }
        // }, 