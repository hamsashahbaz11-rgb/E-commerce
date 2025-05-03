import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function POST(req) {
  await connectDB();

  const productData = await req.json();

  const product = await Product.create(productData);

  return Response.json({ product }, { status: 201 });
} 