import express from 'express';
import { registerUser, loginUser, logout } from '../controllers/authController.js';
import { userAuth } from '../middleware/userAuth.js';

const router = express.Router();

//registration route
router.post('/register', registerUser);

//login route
router.post('/login', loginUser);

//logout
router.post('/logout', userAuth, logout)






export default router