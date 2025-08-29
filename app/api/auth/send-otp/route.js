import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import Otp from '@/models/Otp';
import connectDB from '@/lib/db';


export async function POST(request) {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const otpString = Math.floor(100000 + Math.random() * 900000).toString(); 


  await connectDB()
  console.log(otpString)
  const otp = new Otp({
    email,
    otp : otpString,
    expiresAt : new Date(Date.now() + 5 * 60 * 1000)
  })
  otp.save()
   


  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: 'H-eccomerce',
    to: email,
    subject: 'Your OTP Code',
    text: `Hello!\n\nYour One-Time Password (OTP) for accessing your account is: ${email} with the OTP code:
       ${otpString}
  \n\nThis code is valid for the next 10 minutes. Please do not share this OTP with anyone to keep your account secure.\n\nIf you did not request this code, please ignore this email or contact our support team immediately.\n\nThank you for choosing our service!\n\nBest regards,\nThe H-eccomerce Team`
  };

  try {
    await transporter.sendMail(mailOptions);
    
    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}