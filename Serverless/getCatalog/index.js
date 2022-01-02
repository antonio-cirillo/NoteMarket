const mongoose = require('mongoose');
const { Catalog } = require('../models.js');

const bcrypt = require('bcrypt');
require('dotenv').config();

module.exports = async function (context, req) {

    // Get title
    const title = (req.query.title || (req.body && req.body.title));

    try {

        // Connect to database
        await mongoose.connect(process.env['MONGO_URI']);

        // Declare catalog object
        let catalog;

        // Query database
        if (title) {
            // Use filter
            catalog = await Catalog.find({
                "title": { "$regex": title, "$options": "i" },
                "status": "verified"
            });
        } else {
            // Get all
            catalog = await Catalog.find({
                "status": "verified"
            });
        }

        // Return catalog
        context.res = { body: catalog };

    } catch (error) {
        // Return error
        context.res = { body: { error: true } };
        return;
    }

}