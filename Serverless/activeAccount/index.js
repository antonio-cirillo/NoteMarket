const mongoose = require('mongoose');
const { Users } = require('../models.js');

require('dotenv').config();

module.exports = async function (context, req) {

    // Get token
    const token = (req.query.token || (req.body && req.body.token));

    try {

        // Connect to database
        mongoose.connect(process.env['MONGO_URI']);

        // Active account by token
        const user = await Users.findOne({ activeToken: token }).exec();

        // If activeToken doesn't match
        if (!user) {
            context.res = { body: { error: true } };
            return;
        }

        // Get epoch time of active expires
        const activeExpires = new Date(user.activeExpires).getTime();

        // Check if activeExpires >= Date.now()
        if (activeExpires < Date.now()) {
            // Delete user from database
            Users.deleteOne({ activeToken: token });
            context.res = { body: { error: true } };
            return;
        }

        // Update status of user and delete activeToken and activeExpires
        const update = await Users.updateOne({
            activeToken: token
        }, {
            activeToken: '',
            activeExpires: '',
            status: 'verified'
        }).exec();

        // Check update
        if (update.acknowledged) {
            context.res = { body: { error: false } };
            return;
        } else {
            context.res = { body: { error: true } };
            return;
        }

    } catch (error) {
        // Return generic error
        context.res = { body: { error: true } };
        return;
    }

}