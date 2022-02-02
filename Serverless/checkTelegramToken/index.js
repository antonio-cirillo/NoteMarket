const mongoose = require('mongoose');
const { Users } = require('../models.js');

require('dotenv').config();

module.exports = async function (context, req) {

    // Get telegramToken
    const telegramToken = (req.query.telegramToken || (req.body && req.body.telegramToken));

    try {

        // Connect to database
        await mongoose.connect(process.env['MONGO_URI']);

        // Get user from database by telegramToken
        const user = await Users.findOne({
            telegramToken: telegramToken
        });

        // Check if token exist
        if (!user) { 
            context.res = { body: { error: true } };
            return;
        } else {
            // Successful retrive code
            context.res = { body: user.email };
            return;
        }

    } catch (error) {
        // Return generic error
        context.res = { body: { error: true } };
        return;
    }

}