import express from 'express';

// Import routers
import { getLogin, postLogin } from './login.js'

// Import interceptors
import isUserLogged from '../interceptors/isUserLogged.js';

// Create Router
const router = express.Router();

//===================== HOME PAGE =====================//
router.get('/', (req, res) => {
    res.send("Home page");
})

//===================== LOGIN PAGE =====================//
router.get('/login', isUserLogged, getLogin);

router.post('/login', isUserLogged, postLogin);

// Export router
export default router;