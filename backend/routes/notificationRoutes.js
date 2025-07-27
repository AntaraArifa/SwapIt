import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getNotifications, markAllAsRead, sendSessionMeetingLink } from "../controllers/notificationController.js";


const router = express.Router();

router.route("/send").post(isAuthenticated, sendSessionMeetingLink);
router.route("/get").get(isAuthenticated, getNotifications);
router.route("/mark-as-read").patch(isAuthenticated,markAllAsRead)

export default router;
