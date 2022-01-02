const mongoose = require('mongoose');
const { Catalog } = require('../models.js');

const bcrypt = require('bcrypt');
require('dotenv').config();

module.exports = async function (context, req) {

    // Get _id
    const _id = (req.query._id || (req.body && req.body._id));

    try {

        // Connect to database
        await mongoose.connect(process.env['MONGO_URI']);

        // Get item by id
        const item = await Catalog.findById(_id).exec();

        // If id match
        if (item) {
            // Return catalog
            context.res = { body: item };
        } 
        // If id doesn't match
        else {
            // Return error
            context.res = { body: { error: true } };
            return;
        }

    } catch (error) {
        // Return error
        context.res = { body: { error: true } };
        return;
    }

}