const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true},
    password: { type: String, required: true},
    name: { type: String, required: true},
    surname: { type: String, required: true},
    dob: { type: Date, required: true },
    status: { type: String, required: true},
    activeToken: String,
    activeExpires: Date
}, {
    versionKey: false
});

module.exports = {

    Users: mongoose.model('Users', userSchema)

}