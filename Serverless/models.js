const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    surname: String
}, {
    versionKey: false
});

module.exports = {

    Users: mongoose.model('Users', userSchema)

}