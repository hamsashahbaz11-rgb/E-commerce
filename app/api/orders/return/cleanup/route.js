 
import connectDB from '@/lib/db';
import Order from '@/models/Order';



export default async function handler(req, res) {
  if (req.method !== 'GET') { // Use GET or a specific header for security
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Add a security check here to ensure only Vercel can run this job
  // E.g., check for a secret token in the request header

  try {
    await connectDB();

    const ordersToDelete = await Order.find({
      "returnRequest": { $in: ['pending', 'approved', 'rejected', 'completed']},
      scheduledDate: { $lte: new Date() },
    });

    const orderIds = ordersToDelete.map(order => order._id);
    const result = await Order.deleteMany({ _id: { $in: orderIds } });
 
    res.status(200).json({ message: `Deleted ${result.deletedCount} orders` });
  } catch (error) {
    console.error('Error in daily order cleanup job:', error);
    res.status(500).json({ error: 'Failed to run cleanup job' });
  }
}