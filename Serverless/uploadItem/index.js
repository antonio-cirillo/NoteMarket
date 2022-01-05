const mongoose = require('mongoose');
const { Users, Catalog } = require('../models.js');

require('dotenv').config();

module.exports = async function (context, req) {

    // Get title, price, description, image, file, emailVendor
    const title = (req.query.title || (req.body && req.body.title));
    const price = (req.query.price || (req.body && req.body.price)); 
    const description = (req.query.description || (req.body && req.body.description));
    const image = (req.query.image || (req.body && req.body.image));
    const file = (req.query.file || (req.body && req.body.file));
    const emailVendor = (req.query.emailVendor || (req.body && req.body.emailVendor));

    try {

        // Connect to database
        await mongoose.connect(process.env['MONGO_URI']);

        // Find moderator
        const moderator = await Users.find({ moderator: true })
            .sort({ itemsAssigned: 1 }).limit(1).exec();

        // Insert catalog
        const item = new Catalog({
            title: title,
            description: description,
            price: parseFloat(price).toFixed(2),
            image: image,
            file: file,
            emailVendor: emailVendor,
            emailModerator: moderator.email,
            status: 'notVerified',
            comments: [],
            sentiments: { 
                count: 0, 
                analysis: {
                    positive: { 
                        percent: 0,
                        count: 0
                    },
                    negative: {
                        percent: 0,
                        count: 0
                    },
                    neutral: {
                        percent: 0,
                        count: 0
                    },
                }
            }
        }).save();

        // Update counter itemsAssigned for moderator
        moderator.itemsAssigned +=1;
        const update = await Users.replaceOne({ email: moderator.email }, moderator);

        // Check update
        if (update.acknowledged) {
            context.res = { body: item._id };
            return;
        } else {
            context.res = { body: { error: true } };
            return;
        }

    } catch (error) {
        console.log(error);
        // Return generic error
        context.res = { body: { error: true } };
        return;
    }

}