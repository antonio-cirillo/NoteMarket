const mongoose = require('mongoose');
const { Users } = require('../models.js');

const bcrypt = require('bcrypt');
require('dotenv').config();

module.exports = async function (context, req) {

    // Get email and password
    const email = (req.query.email || (req.body && req.body.email));
    const password = (req.query.password) || (req.body && req.body.password)

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Declare response
    let response;

    try {

        // Connect to database
        mongoose.connect(process.env['MONGO_URI']);

        // Get user from database by email
        const user = await Users.findOne({
            email: email
        });

        // Check if user exist
        if (!user || user.password != hashedPassword) { 
            response = { error: "credentialError" };
        } 
        // Check user status    
        else if (user.status === "notVerified") {
            response = { error: "notVerifiedError"};
        } 
        // Successful login
        else {
            response = user;
        }

    } catch (error) {
        // Return generic error
        response = { error: "genericError" };
    }

    // Return results
    context.res = {
        body: response
    };

}