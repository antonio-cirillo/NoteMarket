const mongoose = require('mongoose');
const { Catalog } = require('../models.js');

require('dotenv').config();

module.exports = async function (context, req) {

    // Get _id
    const _id = (req.query._id || (req.body && req.body._id));
    const flag = (req.query.flag || (req.body && req.body.flag));

    try {

        // Connect to database
        await mongoose.connect(process.env['MONGO_URI']);

        // If item get approved
        if (flag) {
            await Catalog.updateOne({ _id: _id }, {
                emailModerator: null,
                status: "verified"
            }).exec();
        }
        // If item doesn't get approved
        else {
            await Catalog.deleteOne({ _id: _id }).exec();
        }

        context.res = { body: { flag: true } };

    } catch (error) {
        // Return error
        context.res = { body: { error: true } };
        return;
    }

}