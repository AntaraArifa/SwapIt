import express from 'express';
import * as skillListingController from '../controllers/skillListingController.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

// Create a new skill listing
router.post('/create', isAuthenticated, skillListingController.createSkillListing);
// Update an existing skill listing
router.put('/update/:id', isAuthenticated, skillListingController.updateSkillListing);
// Delete a skill listing
router.delete('/delete/:id', isAuthenticated, skillListingController.deleteSkillListing);
// Get All listings
router.get('/all', isAuthenticated, skillListingController.getAllSkillListings);
// Get a single skill listing by ID
router.get('/single/:id', isAuthenticated, skillListingController.getSkillListingById);
// Get skill listings by teacher ID
router.get('/teacher/:teacherId', isAuthenticated, skillListingController.getSkillListingsByTeacherId);
// Get skill listings by tag
router.get('/:tag', isAuthenticated, skillListingController.getSkillListingsByTag);




export default router;
