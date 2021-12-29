import express from 'express';
import dotenv from 'dotenv';
import router from './routers/routers.js';

// Create server
const app = express();

// Config env
dotenv.config();

// Delegate handler to router
app.use('/', router);

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log(`Your app is listening on port: ${listener.address().port}`);
})