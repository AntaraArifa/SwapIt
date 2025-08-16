import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    message: { type: String, required: true },
    meetingLink:{type:String},
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "RegisteredCourse"},
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
    type:{ type: String, enum: ["message", "meeting", "course_status","course_registration","book_session","session_rescheduled","session_status"], default: "message" },
});

export default mongoose.model("Notification", notificationSchema);
