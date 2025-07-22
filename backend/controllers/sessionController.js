import Session from "../models/session.js";
import SkillListing from "../models/skillListing.js";

// Learner creates a session request
export const createSession = async (req, res) => {
  try {
    const learnerID = req.user.userId;
    const { teacherID, skillListingID, scheduledDate, duration, price, timeZone, note } = req.body;

    const skillListing = await SkillListing.findById(skillListingID);
    if (!skillListing) {
      return res.status(404).json({ message: "Skill listing not found", success: false });
    }

    const newSession = new Session({
      learnerID,
      teacherID,
      skillListingID,
      scheduledDate,
      duration,
      price,
      timeZone,
      note,
    });

    await newSession.save();

    res.status(201).json({ message: "Session request sent", success: true, session: newSession });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Get all sessions of a user (learner or teacher), with optional filtering by status and date range
export const getUserSessions = async (req, res) => {
  try {
    const userID = req.user.userId;
    const { status, startDate, endDate } = req.query;

    const filter = {
      $or: [{ learnerID: userID }, { teacherID: userID }],
    };

    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.scheduledDate = {};
      if (startDate) filter.scheduledDate.$gte = new Date(startDate);
      if (endDate) filter.scheduledDate.$lte = new Date(endDate);
    }

    const sessions = await Session.find(filter)
      .populate("teacherID", "fullname profile.profilePhoto")
      .populate("learnerID", "fullname profile.profilePhoto")
      .populate("skillListingID", "title")
      .sort({ scheduledDate: 1 });

    res.status(200).json({ message: "Sessions retrieved", success: true, sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Teacher updates session status (accept/reject/cancel/complete)
export const updateSessionStatus = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const { status } = req.body;
    const userId = req.user.userId;

    const validStatus = ["accepted", "rejected", "cancelled", "completed"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status", success: false });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found", success: false });
    }

    if (session.teacherID.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to update this session", success: false });
    }

    session.status = status;
    await session.save();

    res.status(200).json({ message: "Session status updated", success: true, session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Teacher proposes reschedule
export const proposeReschedule = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const { newDate, newDuration, newTimeZone } = req.body;
    const userId = req.user.userId;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found", success: false });
    }

    if (session.teacherID.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to reschedule this session", success: false });
    }

    session.rescheduleRequest = {
      newDate,
      newDuration,
      newTimeZone,
      requestedAt: new Date(),
    };
    session.status = "rescheduled";

    await session.save();

    res.status(200).json({ message: "Reschedule proposed", success: true, session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Learner responds to reschedule request (accept or reject)
export const respondReschedule = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const { accept } = req.body;
    const userId = req.user.userId;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found", success: false });
    }

    if (session.learnerID.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to respond to this reschedule", success: false });
    }

    if (!session.rescheduleRequest) {
      return res.status(400).json({ message: "No reschedule request pending", success: false });
    }

    if (accept) {
      session.scheduledDate = session.rescheduleRequest.newDate;
      session.duration = session.rescheduleRequest.newDuration || session.duration;
      session.timeZone = session.rescheduleRequest.newTimeZone || session.timeZone;
      session.status = "accepted";
    } else {
      session.status = "accepted"; // revert to accepted or original status
    }

    session.rescheduleRequest = undefined;
    await session.save();

    res.status(200).json({ message: "Reschedule response recorded", success: true, session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
