import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['teacher', 'learner'],
        required: true
    },
    profile: {
        type: {
            bio: { type: String, default: "" },
            skills: { type: [String], default: [] },
            profilePhoto: { type: String, default: "" },
            resume: { type: String, default: "" },
            resumeOriginalName: { type: String, default: "" }
        },
        default: {}
    }

}, { timestamps: true });
export const User = mongoose.model('User', userSchema);