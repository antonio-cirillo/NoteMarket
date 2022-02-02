const mongoose = require('mongoose');
const { Users, Catalog } = require('../models.js');

require('dotenv').config();

module.exports = async function (context, req) {

    // Get email
    const email = (req.query.email || (req.body && req.body.email));

    try {

        // Connect to database
        await mongoose.connect(process.env['MONGO_URI']);

        // Get user from database by email
        const user = await Users.findOne({
            email: email
        });

        const items = [];
        // Get items buyed
        for (const _id of user.itemsBuyed) {
            const item = await Catalog.findById(_id).exec();
            items.push(item);
        }

        // Return items
        context.res = { body: items };

    } catch (error) {
        // Return error
        context.res = { body: { error: true } };
        return;
    }

}