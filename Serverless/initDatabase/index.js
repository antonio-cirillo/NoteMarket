const mongoose = require('mongoose');
const { Users, Catalog } = require('../models.js');
const { USERS, CATALOG } = require('../database.js');

require('dotenv').config();

module.exports = async function (context, req) {
    
    try {

        // Connect to database
        mongoose.connect(process.env['MONGO_URI']);

        // Create user
        if (await Users.countDocuments() == 0) {
            await Users.insertMany(USERS);
        }

        // Create catalog
        if (await Catalog.countDocuments() == 0) {
            await Catalog.insertMany(CATALOG);
        }

        // Return confirm
        context.res = { body: { flag: true } };

    } catch (error) {
        // Return error
        context.res = { body: { flag: false } };
    }

}