import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import * as registeredCoursesController from '../controllers/registeredCoursesController.js';

const router = express.Router();

// register a course
router.post('/register', isAuthenticated, registeredCoursesController.registerCourse);

// check if a student is registered for a course (changed to POST)
router.post('/check', isAuthenticated, registeredCoursesController.isStudentRegisteredForCourse);

export default router;