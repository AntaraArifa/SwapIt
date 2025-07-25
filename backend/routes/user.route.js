// routes/user.js (or wherever your user routes are defined)
import express from 'express';
import { register, login, logout, updateProfile, getUserById } from '../controllers/user.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js'; // Your auth middleware
import { singleUpload } from '../middlewares/multer.js'; // Your multer middleware

const router = express.Router();

router.route('/register').post(singleUpload, register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/profile/update').post(isAuthenticated, singleUpload, updateProfile);
router.route('/:id').get(isAuthenticated, getUserById);

export default router;