const mongoose = require('mongoose');
const { Catalog } = require('../models.js');

require('dotenv').config();

module.exports = async function (context, req) {

    // Get email
    const email = (req.query.email || (req.body && req.body.email));

    try {

        // Connect to database
        await mongoose.connect(process.env['MONGO_URI']);

        // Get items by emailModerator
        const items = await Catalog.find({
            emailModerator: email
        }).exec();

        // Return items
        context.res = { body: items };

    } catch (error) {
        // Return error
        context.res = { body: { error: true } };
        return;
    }

}