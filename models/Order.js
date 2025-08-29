import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
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
        name: String,
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        size: String,
        color: String,
        price: {
          type: Number,
          required: true,
        },
        images: [
          {
            url: {
              type: String,
              required: true
            },
            public_id: {
              type: String, 
              required: true
            }
          }

        ]
        ,
        sellerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          requied: true
        }
      },
    ],
    shippingAddress: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Credit Card', 'Cash on Delivery'],
      default: 'Credit Card'
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 15.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    deliveryMan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveryStatus: {
      type: String,
      enum: ['unassigned', 'assigned', 'processing', 'out_for_delivery', 'delivered'],
      default: 'unassigned'
    },
    statusHistory: [{
      status: String,
      timestamp: Date,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    deliveryEarnings: {
      type: Number,
      default: 0
    },
    isReturned: {
      type: Boolean,
      default: false
    },
    returnRequest: {
      status: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected', 'completed'],
        default: 'none'
      },
      requestDate: Date,
      reason: String,
      processedDate: Date,
      scheduledDate: Date,
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }, 
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    couponDiscount: {
      type: Number,
      default: 0,
    },
    reviewStatus: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema)
export default Order;