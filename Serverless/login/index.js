const mongoose = require('mongoose');
const { Users } = require('../models.js');

const bcrypt = require('bcrypt');
require('dotenv').config();

module.exports = async function (context, req) {

    // Get email and password
    const email = (req.query.email || (req.body && req.body.email));
    const password = (req.query.password || (req.body && req.body.password));

    try {

        // Connect to database
        mongoose.connect(process.env['MONGO_URI']);

        // Get user from database by email
        const user = await Users.findOne({
            email: email
        });

        // Check if user exist
        if (!user) { 
            context.res = { body: { error: "credentialError" } };
            return;
        } else {
            // Check password
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                context.res = { body: { error: "credentialError" } };
                return;
            }
            // Check user status    
            if (user.status === "notVerified") {
                context.res = { body: { error: "notVerifiedError" } };
                return;
            } 
            // Successful login
            else {
                context.res = { body: user };
                return;
            }
        }

    } catch (error) {
        // Return generic error
        context.res = { body: { error: "genericError" } };
        return;
    }

}