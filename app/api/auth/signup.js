import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
  await connectDB();
  const { name, email, password } = await req.json();

  const userExists = await User.findOne({ email });

  if (userExists) {
    return Response.json({ message: 'User already exists' }, { status: 400 });
  }

  const user = await User.create({ name, email, password });

  return Response.json({ user }, { status: 201 });
} 