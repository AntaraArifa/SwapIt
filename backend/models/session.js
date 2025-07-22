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
  scheduledDate: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  timeZone: {
    type: String,
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