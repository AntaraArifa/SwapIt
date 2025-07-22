import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import * as sessionController from "../controllers/sessionController.js";

const router = express.Router();

router.post("/create", isAuthenticated, sessionController.createSession);
router.get("/my", isAuthenticated, sessionController.getUserSessions);
router.patch("/:sessionId/status", isAuthenticated, sessionController.updateSessionStatus);
router.patch("/:sessionId/propose-reschedule", isAuthenticated, sessionController.proposeReschedule);
router.patch("/:sessionId/respond-reschedule", isAuthenticated, sessionController.respondReschedule);

export default router;
