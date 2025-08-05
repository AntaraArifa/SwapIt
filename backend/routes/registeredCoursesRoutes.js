import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import * as registeredCoursesController from '../controllers/registeredCoursesController.js';

const router = express.Router();

// register a course
router.post('/register', isAuthenticated, registeredCoursesController.registerCourse);

// check course registration status for a student
router.post('/check', isAuthenticated, registeredCoursesController.checkCourseStatus);

export default router;