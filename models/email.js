import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
    email: {
        type: String, 
        required: true
    }
})

const EmailSubcribe = mongoose.models.EmailSubcribe || mongoose.model("EmailSubcribe", emailSchema)

export default EmailSubcribe