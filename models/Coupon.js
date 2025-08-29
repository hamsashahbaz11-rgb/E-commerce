  import mongoose from 'mongoose';

  const CouponSchema = new mongoose.Schema(
    {
      code: {
        type: String,
        required: [true, 'Please provide a coupon code'],
        unique: true, 
        trim: true,
        uppercase: true
      },
      description: {
        type: String,
        required: [true, 'Please provide a coupon description'],
      },
      discountType: {
        type: String,
        required: true,
        enum: ['percentage', 'fixed'],
        default: 'percentage',
      },
      discountAmount: {
        type: Number,
        required: [true, 'Please provide a discount amount'],
        min: [0, 'Discount amount must be positive'],
      },
      minimumPurchase: {
        type: Number,
        default: 0,
        min: [0, 'Minimum purchase amount must be positive'],
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
      usageLimit: {
        type: Number,
        default: null,
      },
      usedCount: {
        type: Number,
        default: 0,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      }],
      excludedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      }],
    },
    { timestamps: true }
  );

  // Add an index for faster coupon code lookups
  CouponSchema.index({ code: 1 });

  // Add validation to ensure endDate is after startDate
  CouponSchema.pre('save', function (next) {
    if (this.endDate <= this.startDate) {
      next(new Error('End date must be after start date'));
    }
    next();
  });

  const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
  export default Coupon;