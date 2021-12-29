import express from 'express';

import isUserLogged from '../utils/isUserLogged.js';

// Create Router
const router = express.Router();

router.get('/', (req, res) => {
    res.send("Home page");
})

router.get('/login', isUserLogged, (req, res) => {
    res.send("Login");
})

export default router;