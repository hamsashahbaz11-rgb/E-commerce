import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import EmailSubcribe from "@/models/email";

export async function POST(request) {
    try {
        const { email } = await req.json();
        await connectDB();
        await EmailSubcribe.create({
            email
        })
        return NextResponse.json({message: "Successfully subscribed!"}, {status: 200})
    } catch (error) {
        return NextResponse.json({message: "Something went wrong"},{status: 500})
    }
} 