import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';

// Import routers
import router from './router/router.js';

// Set __dirname in ES6
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create server
const app = express();

// Set session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

// Config env
dotenv.config();

// Set views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set assets
app.use(express.static(path.join(__dirname, 'public')));

// Delegate handling to router.js
app.use('/', router);

// Listening...
const listener = app.listen(process.env.PORT || 3000, () => {
    console.log(`Your app is listening on port: ${listener.address().port}`);
})