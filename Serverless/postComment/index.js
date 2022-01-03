const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");
const mongoose = require('mongoose');
require('dotenv').config();

const { Catalog } = require('../models.js');
// Authenticate the client with your key and endpoint
const textAnalyticsClient = new TextAnalyticsClient(
    process.env.LANGUAGE_ENDPOINT,  new AzureKeyCredential(process.env.LANGUAGE_KEY));

module.exports = async function (context, req) {

    const email = (req.query.email || (req.body && req.body.email));
    const _id = (req.query._id || (req.body && req.body._id));
    const comment = (req.query.comment || (req.body && req.body.comment));

    try {

        // Connect to database
        await mongoose.connect(process.env['MONGO_URI']);

        // Get item from catalog
        const item = await Catalog.findById(_id).exec();

        // If item doens't exist
        if (!item) {
            // Return error
            context.res = { body: { error: true } };
            return;
        }

        // Add comment
        item.comments.push({
            email: email,
            comment: comment
        });

        // Get analysis from azure
        const sentimentResult = await textAnalyticsClient.analyzeSentiment([ {
            id: '0',
            text: comment,
            language: 'it'
        }]);
        const document = sentimentResult[0].sentiment;

        // Update analysis with new comment
        item.sentiments.count += 1;
        item.sentiments.analysis[document].count += 1;

        for (const sentiment of ['positive', 'negative', 'neutral']) {
            item.sentiments.analysis[sentiment].percent =
                ((item.sentiments.analysis[sentiment].count / item.sentiments.count) * 100).toFixed(2);
        }

        const update = await Catalog.replaceOne({_id: _id }, item).exec();

        // Check update
        if (update.acknowledged) {
            context.res = { body: item.sentiments };
            return;
        } else {
            context.res = { body: { error: true } };
            return;
        }

    } catch (error) {
        // Return error
        context.res = { body: { error: true } };
        return;
    }

}