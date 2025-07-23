import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  learnerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  teacherID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  skillListingID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SkillListing",
    required: true,
  },
  scheduledTime: {
    type: String, // e.g. '14:00'
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "rescheduled", "cancelled", "completed"],
    default: "pending",
  },
  note: {
    type: String,
  },
  rescheduleRequest: {
    newDate: Date,
    newDuration: Number,
    newTimeZone: String,
    requestedAt: Date,
  },
}, { timestamps: true });

const Session = mongoose.model("Session", sessionSchema);

export default Session;