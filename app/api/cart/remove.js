import connectDB from '@/lib/db';
import Cart from '@/models/Cart';

export async function POST(req) {
  await connectDB();

  const { userId, productId } = await req.json();

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return Response.json({ message: 'Cart not found' }, { status: 404 });
  }

  cart.items = cart.items.filter(item => item.product.toString() !== productId);

  await cart.save();

  return Response.json({ cart });
} 