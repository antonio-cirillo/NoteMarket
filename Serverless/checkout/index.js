const mongoose = require('mongoose');
const { Users } = require('../models.js');
require('dotenv').config();

module.exports = async function (context, req) {

    // Get _ids
    const email = (req.query.email || (req.body && req.body.email));
    const _ids = (req.query._ids || (req.body && req.body._ids));

    try {

        // Connect to database
        await mongoose.connect(process.env['MONGO_URI']);

        const update = await Users.updateOne({
            email: email
        }, {
            $push: { itemsBuyed: _ids }
        }).exec();

        // Check update
        if (!update.acknowledged) {
            context.res = { body: { error: true } };
            return;
        }

        const user = await Users.findOne({ email: email });

        // Return true
        context.res = { 
            body: { 
                itemsBuyed: user.itemsBuyed, 
                error: false
            }
        };

    } catch (error) {
        // Return error
        context.res = { body: { error: true } };
        return;
    }

}