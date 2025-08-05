import mongoose from "mongoose";

const registeredCourseSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SkillListing",
        required: true
    }, 
    contactNo:{
        type: String,
        required: true,
    },
    paymentMethod:{
        type: String,
        required: true,
    },
    transactionID:{
        type: String,
        required: true,
    },
    courseStatus:{
        type: String,
        enum: ["pending", "registered", "completed"],
        default: "pending"
    }

});

const RegisteredCourse = mongoose.model("RegisteredCourse", registeredCourseSchema);

export default RegisteredCourse;