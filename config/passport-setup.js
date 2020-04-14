const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys');
const User = require('../models/user-model');

passport.use(
    new GoogleStrategy({
        // options for strategy
        callbackURL: "/auth/google/redirect",
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret
    }, (accessToken, refreshToken, profile, done) => {
        // passport callback function
        console.log("passport callback function fired")
        console.log(profile);
        new User({
            firstName: "a", 
            lastName: "a",
            googleId: "a"
        }).save().then((newUser) => {
            console.log('new user created' + newUser);
        })
    })
)



   // google client id 
   //  116800683709-k505ql23fc6g8qs9pssdlekdokl0h38f.apps.googleusercontent.com

   // google client secret 
   // XPAfdx2yqDSuhULEC_bbgsNp