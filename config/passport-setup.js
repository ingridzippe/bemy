const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys');

passport.use(
    new GoogleStrategy({
        // options for strategy
        callbackURL: "/auth/google/redirect",
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret
    }, () => {
        // passport callback function
        console.log("passport callback function fired")
    })
)



   // google client id 
   //  116800683709-k505ql23fc6g8qs9pssdlekdokl0h38f.apps.googleusercontent.com

   // google client secret 
   // XPAfdx2yqDSuhULEC_bbgsNp