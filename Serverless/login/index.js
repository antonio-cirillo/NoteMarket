const mongoose = require('mongoose');
const { Users } = require('../schemas.js');
require('dotenv').config();

module.exports = async function (context, req) {

    // Get email and password
    const email = (req.query.email || (req.body && req.body.email));
    const password = (req.query.password) || (req.body && req.body.password)

    // Connect to database
    mongoose.connect(process.env['MONGO_URI']);

    let responseMessage = email;

    responseMessage = await Users.findOne({
        email: email
    });

    context.res = {
        body: responseMessage
    };

}