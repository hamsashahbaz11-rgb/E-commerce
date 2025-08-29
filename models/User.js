import mongoose, { mongo } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['customer', 'seller', 'admin', 'deliveryman'],
    required: true,
    default: 'customer',
  },
  deliverymanInfo: {
    assignedOrders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }],
    earnings: {
      type: Number,
      default: 0
    },
    availableForDelivery: {
      type: Boolean,
      default: true
    },
    area: {
      type: String,
      required: function () { return this.role === 'deliveryman' }
    },
    deliveryHistory: [{
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      },
      earnedAmount: Number,
      deliveryDate: Date,
      status: String
    }]
  },
  isSeller: {
    type: Boolean,
    default: false
  },
  sellerInfo: {
    shopName: String,
    description: String,
    businessType: String,
    productsToSell: String,
    approved: {
      type: Boolean,
      default: true
    },
    createdAt: Date,
    products: {
      type: Array,
      default: []
    },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        }, review: String,
        date: {
          type: Date,
          default: Date.now
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0
    }
  },
  cart: {
    type: Array,
    default: [],
  },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
  ],
  orders: [
{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Order'
}
  ],
   
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});


UserSchema.pre('save', async function (next) {
  if (this.role === 'seller') {
    this.isSeller = true
  }
  next()
});
// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Check if the model already exists to prevent overwriting
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;