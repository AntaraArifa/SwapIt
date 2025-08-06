import Session from "../models/session.js";
import SkillListing from "../models/skillListing.js";
import Notification from "../models/notificationModel.js"


// Learner creates a session request
export const createSession = async (req, res) => {
  try {
    const learnerID = req.user.userId;
    const { teacherID, skillListingID, slotDate, slotTime, note } = req.body;

    const skillListing = await SkillListing.findById(skillListingID);
    if (!skillListing) {
      return res.status(404).json({ message: "Skill listing not found", success: false });
    }

    if (!slotTime || !skillListing.availableSlots.includes(slotTime)) {
      return res.status(400).json({ message: "Selected time slot is not available", success: false });
    }

    if (!slotDate) {
      return res.status(400).json({ message: "Date is required", success: false });
    }

    const scheduledTime = new Date(`${slotDate}T${slotTime}`);

    const existingSession = await Session.findOne({
      skillListingID,
      scheduledTime,
    });

    if (existingSession) {
      return res.status(400).json({ message: "This slot is already booked for the selected date.", success: false });
    }

    const newSession = new Session({
      learnerID,
      teacherID,
      skillListingID,
      scheduledTime,
      skillName: skillListing.title,
      price: skillListing.fee,
      note,
    });

    await newSession.save();

    // ✅ Create notification for the teacher
    const notification = new Notification({
      recipient: teacherID,
      sender: learnerID,
      message: `A session has been booked for "${skillListing.title}" on ${slotDate} at ${slotTime}.`,
    });

    await notification.save();

    res.status(201).json({
      message: "Session request sent",
      success: true,
      session: newSession,
    });
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


    // Remove date filtering since scheduledTime is now a string (time only)
    const sessions = await Session.find(filter)
      .populate("teacherID", "fullname profile.profilePhoto")
      .populate("learnerID", "fullname profile.profilePhoto")
      .populate("skillListingID", "title")
      .sort({ createdAt: 1 });

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
    const { newDate, newTime } = req.body;
    const userId = req.user.userId;

    if (!newTime || !newDate) {
      return res.status(400).json({ message: "New date and time required", success: false });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found", success: false });
    }

    if (session.teacherID.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to reschedule this session", success: false });
    }

    // Check for double-booking: is there already a session for this skillListing, date, and time?
    const rescheduleDateTime = new Date(`${newDate}T${newTime}`);
    const existingSession = await Session.findOne({
      skillListingID: session.skillListingID,
      scheduledTime: rescheduleDateTime,
      _id: { $ne: session._id },
    });
    if (existingSession) {
      return res.status(400).json({ message: "This slot is already booked for the selected date.", success: false });
    }

    session.rescheduleRequest = {
      newTime,
      newDate,
      requestedAt: new Date(),
    };
    session.status = "rescheduled";
    // Ensure required fields are not lost
    if (!session.skillName || !session.price) {
      // If not present, fetch from DB
      let skillListingDoc = null;
      if (session.skillListingID && typeof session.skillListingID === 'object' && session.skillListingID.title) {
        // Populated
        skillListingDoc = session.skillListingID;
      } else {
        // Not populated, fetch
        skillListingDoc = await SkillListing.findById(session.skillListingID);
      }
      if (skillListingDoc) {
        if (!session.skillName) session.skillName = skillListingDoc.title;
        if (!session.price) session.price = skillListingDoc.fee;
      }
    }

    await session.save();

    res.status(200).json({ message: "Reschedule proposed", success: true, session });
  } catch (err) {
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
      if (!session.rescheduleRequest.newTime || !session.rescheduleRequest.newDate) {
        return res.status(400).json({ message: "No new date/time provided in reschedule request", success: false });
      }
      // Check if the new time is available in the teacher's SkillListing (by time only)
      const skillListing = await SkillListing.findById(session.skillListingID);
      if (!skillListing) {
        return res.status(404).json({ message: "Skill listing not found", success: false });
      }
      if (!skillListing.availableSlots.includes(session.rescheduleRequest.newTime)) {
        return res.status(400).json({ message: "Selected time slot is no longer available", success: false });
      }
      // Remove the booked slot from availableSlots (by time only)
      skillListing.availableSlots = skillListing.availableSlots.filter(s => s !== session.rescheduleRequest.newTime);
      await skillListing.save();
      // Combine newDate and newTime into a Date object
      session.scheduledTime = new Date(`${session.rescheduleRequest.newDate}T${session.rescheduleRequest.newTime}`);
      session.status = "accepted";
    } else {
      session.status = "accepted"; // revert to accepted or original status
    }

    // Ensure required fields are present
    if (!session.skillName || !session.price) {
      let skillListingDoc = null;
      if (session.skillListingID && typeof session.skillListingID === 'object' && session.skillListingID.title) {
        skillListingDoc = session.skillListingID;
      } else {
        skillListingDoc = await SkillListing.findById(session.skillListingID);
      }
      if (skillListingDoc) {
        if (!session.skillName) session.skillName = skillListingDoc.title;
        if (!session.price) session.price = skillListingDoc.fee;
      }
    }

    session.rescheduleRequest = undefined;
    await session.save();

    res.status(200).json({ message: "Reschedule response recorded", success: true, session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Get sessions where user is learner
export const getLearnerSessions = async (req, res) => {
  try {
    const learnerID = req.user.userId;
    const sessions = await Session.find({ learnerID })
      .populate("teacherID", "fullname profile.profilePhoto")
      .populate("skillListingID", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "Learner sessions retrieved", success: true, sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Get sessions where user is teacher
export const getTeacherSessions = async (req, res) => {
  try {
    const teacherID = req.user.userId;
    const sessions = await Session.find({ teacherID })
      .populate("learnerID", "fullname profile.profilePhoto")
      .populate("skillListingID", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "Teacher sessions retrieved", success: true, sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
