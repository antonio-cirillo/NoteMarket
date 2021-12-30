const mongoose = require('mongoose');
const { Users } = require('../models.js');

const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();

module.exports = async function (context, req) {
    
    // Get email, password, confirmPassword, name, surname
    const email = (req.query.email || (req.body && req.body.email));
    const password = (req.query.password || (req.body && req.body.password));
    const dob = (req.query.dob || (req.body && req.body.dob));
    const name = (req.query.name || (req.body && req.body.name));
    const surname = (req.query.surname || (req.body && req.body.surname));

    // Declare response
    let response;

    try {

        // Connect to database
        mongoose.connect(process.env['MONGO_URI']);

        // Get user from database by email
        const user = await Users.findOne({
            email: email
        });

        // If email already exists
        if (user) {
            context.res = { body: { error: "emailAlreadyExistsError" } };
            return;
        }
    
        // Registration successful
        crypto.randomBytes(20, (err, buf) => {
            
            // Generate token for registration
            const activeToken = buf.toString('hex');
            const activeExpires = Date.now() + 24 * 3600 * 1000;

            const hashedPassword = bcrypt.hashSync(password, 12);

            // Create user
            const user = new Users({
                email: email,
                password: hashedPassword,
                name: name,
                surname: surname,
                dob: dob,
                status: "notVerified",
                activeToken: activeToken,
                activeExpires: activeExpires            
            }).save();

            // Return token
            context.res = { body: { activeToken: activeToken } };
            return;

        });

    } catch (error) {
        // Return generic error
        context.res = { body: { error: "genericError" } };
        return;
    }

}