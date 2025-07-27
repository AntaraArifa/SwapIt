import Notification from '../models/notificationModel.js';

export const sendSessionMeetingLink = async (req, res) => {
    try {
        const { recipient, message, meetingLink } = req.body;

        if (!recipient || !message ||!meetingLink ) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const notification = new Notification({
            recipient,
            sender: req.user.userId, 
            message,
            meetingLink,
            isRead: false,
        });

        await notification.save();

        res.status(201).json({
            success: true,
            message: "Interview invitation sent successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to send interview invitation" });
    }
};
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.userId; 
        const notifications = await Notification.find({ recipient: userId }).populate("sender","fullname").sort({ createdAt: -1 }); // Sort by timestamp, descending
       
        res.json({ success: true, notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update" });
  }
};

