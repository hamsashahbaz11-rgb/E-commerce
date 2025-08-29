import mongoose from 'mongoose'
import bcrypt from 'bcryptjs';

const otpSchema = new mongoose.Schema({
    email: String,
    otp: String, // store hashed OTP
    expiresAt: Date,
    used: { 
        type: Boolean, default: false 
    },
})

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 600 });

otpSchema.pre('save', async function (next) {
    if (!this.isModified('otp')) {
        return next();
    }
    this.otp = await bcrypt.hash(this.otp, 10);
    next();
})

const Otp  = mongoose.models.Otp || mongoose.model('Otp', otpSchema);
export default Otp;