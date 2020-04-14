const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const keys = require('../config/keys');

// Step 0: Remember to add your MongoDB information in one of the following ways!
var connect = keys.mongodb.dbURI || require('./connect');
mongoose.connect(connect);

const userSchema = new Schema({
    username: String,
    googleId: String
});

const User = mongoose.model('user', userSchema);

module.exports = User;