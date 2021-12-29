import express from 'express';

import isUserLogged from '../utils/isUserLogged.js';

// Create Router
const router = express.Router();

router.get('/', (req, res) => {
    res.send("Home page");
})

router.get('/login', isUserLogged, (req, res) => {
        
    res.render('login', {
        errorCredential: false,
        notVerified: false,
        confirmRegistration: false,
        confirmVerify: false,
        genericError: false
    })

})

router.post('/login', isUserLogged, (req, res) => {

    const { email, password } = req.body;
    console.log(email, password);

})


export default router;