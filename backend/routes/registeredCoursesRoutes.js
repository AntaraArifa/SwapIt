import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import * as registeredCoursesController from '../controllers/registeredCoursesController.js';

const router = express.Router();

// register a course
router.post('/register', isAuthenticated, registeredCoursesController.registerCourse);

// check course registration status for a student
router.post('/check', isAuthenticated, registeredCoursesController.checkCourseStatus);

// Get all students registered for a course
router.post('/students/:courseId', isAuthenticated, registeredCoursesController.getStudentsRegisteredForCourse);

export default router;