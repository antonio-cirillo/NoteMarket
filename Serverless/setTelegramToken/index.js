const mongoose = require('mongoose');
const { Users } = require('../models.js');

require('dotenv').config();

module.exports = async function (context, req) {

    // Get email and password
    const email = (req.query.email || (req.body && req.body.email));
    const telegramToken = (req.query.telegramToken || (req.body && req.body.telegramToken));

    try {

        // Connect to database
        await mongoose.connect(process.env['MONGO_URI']);

        // Update telegramToken
        const update = await Users.updateOne({ email: email }, {
            telegramToken: telegramToken
        }).exec();

        context.res = { body: { flag: update.acknowledged } };
        return;

    } catch (error) {
        // Return generic error
        context.res = { body: { error: true } };
        return;
    }

}