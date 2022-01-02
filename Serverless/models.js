const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    dob: { type: Date, required: true },
    status: { type: String, required: true },
    activeToken: String,
    activeExpires: Date,
    itemsBuyed: [{ type: String }],
    itemsSelling: [{ type: String }]
}, {
    versionKey: false
});

const catalogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    file: { type: String, required: true },
    emailVendor: { type: String, required: true },
    status: { type: String, required: true },
    emailModerator: String,
    comments: [{ }]
}, {
    versionKey: false
});

module.exports = {

    Users: mongoose.model('Users', userSchema),
    Catalog: mongoose.model('Catalog', catalogSchema)

}