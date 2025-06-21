import express from "express";
import { createSkill } from "../controllers/skillsController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/create", isAuthenticated, createSkill);

export default router;