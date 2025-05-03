import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
          default: 1,
        },
        size: {
          type: String,
        },
        color: {
          type: String,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalItems: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Calculate total items and price before saving
CartSchema.pre('save', function (next) {
  if (this.items && this.items.length > 0) {
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    this.totalPrice = this.items.reduce(
      (total, item) => total + item.price * item.quantity,
       0
      );
  } else {
    this.totalItems = 0;
    this.totalPrice = 0;
  }
  next();
});

export default mongoose.models.Cart || mongoose.model('Cart', CartSchema); 