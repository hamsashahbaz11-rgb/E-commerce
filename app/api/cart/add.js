import connectDB from '@/lib/db';
import Cart from '@/models/Cart';

export async function POST(req) {
  await connectDB();

  const { userId, productId, quantity, size, color, price } = await req.json();

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  cart.items.push({ product: productId, quantity, size, color, price });

  await cart.save();

  return Response.json({ cart }, { status: 201 });
} 