const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const keys = require('../config/keys');

// Step 0: Remember to add your MongoDB information in one of the following ways!
var connect = keys.mongodb.dbURI || require('./connect');
mongoose.connect(connect);

var userSchema = mongoose.Schema({
    username: {
        type: String,
        required: false
    }, 
    googleId: {
        type: String, 
        required: false
    }
});

var User = mongoose.model('User', userSchema);

module.exports = {
    User: User
};