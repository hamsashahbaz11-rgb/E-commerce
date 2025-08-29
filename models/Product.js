import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price must be a positive number'],
    },
 
    category: {
      type: String,
      required: [true, 'Please provide a product category'],
      enum: {
        values: ['men', 'women', 'children'],
        message: 'Category must be men, women, or children',
      },
    },
    subcategory: {
      type: String,
      required: [true, 'Please provide a product subcategory'],
    },
    images: [
      {
     url: {
         type: String,
        required: [true, 'Please provide at least one product image'],
     },
     public_id: {
      type: String,
      required: true,
     }
     },
    ],
    brand: {
      type: String,
      required: [true, 'Please provide a product brand'],
    },
    stock: {
      type: Number,
      required: [true, 'Please provide product stock'],
      min: [0, 'Stock must be a positive number'],
      default: 0,
    },
    sizes: [
      {
        type: String,
      },
    ],
    colors: [
      {
        type: String,
      },
    ],
      ratings: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
          },
          review: String,
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    averageRating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
     discountPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Discount percentage must be between 0 and 100'],
      max: [100, 'Discount percentage must be between 0 and 100'],
    },
    discountStartDate: {
      type: Date,
      default: null
    },
    discountEndDate: {
      type: Date,
      default: null
    },
    featured: {
      type: Boolean,
      default: false,
    },
    realprice: {
      type: Number,
      required: false,
      default: 0
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a seller'],
    },
  },
  { timestamps: true }
);
 

// Calculate average rating when ratings are modified
ProductSchema.pre('save', function (next) {
  if (this.ratings && this.ratings.length > 0) {
    this.averageRating =
      this.ratings.reduce((sum, item) => sum + item.rating, 0) /
      this.ratings.length;
    this.numReviews = this.ratings.length;
  }
  next();
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema); 