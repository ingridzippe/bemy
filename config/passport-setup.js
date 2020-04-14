const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys');
const User = require('../models/user-model');
var models = require('../models/user-model');

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
        // new models.User({
        //     username: profile.displayName,
        //     googleId: profile.id
        // }).save().then((newUser) => {
        //     console.log('new user created' + newUser);
        // })


        // check if user already exists in database 
        User.findOne({googleId: profile.id}).then((currentUser) => {
            if (currentUser) {
                // already have user
                console.log("user is", currentUser);
            } else {
                // if not, create new user
                new User({
                    username: profile.displayName, 
                    googleId: profile.id
                }).save().then((newUser) => {
                    console.log('new user created');
                    console.log(newUser);
                })
            }
        })
        // var u = new models.User({
        //     username: profile.displayName,
        //     googleId: profile.id
        // });
        // console.log(u);
        // u.save(function(err, user) {
        //     if (err) {
        //         console.log(err);
        //         // res.status(500).redirect('/index');
        //         return;
        //     }
        //     console.log("new user created");
        //     console.log(user);
        //     // res.redirect('/index');
        // });
    })
)



   // google client id 
   //  116800683709-k505ql23fc6g8qs9pssdlekdokl0h38f.apps.googleusercontent.com

   // google client secret 
   // XPAfdx2yqDSuhULEC_bbgsNp