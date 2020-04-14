"use strict";

var express = require('express');
var app = express();
var path = require('path');
const https = require('https');
const http = require('http');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const passportSetup = require('./config/passport-setup');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const cookieSession = require('cookie-session');
var passport = require('passport');
const profileRoutes = require('./routes/profile-routes');
const models = require('./models/user-model');


setInterval(function() {
    http.request('http://afternoon-temple-49384.herokuapp.com/', console.log("here")).end();
    console.log('set interval aAAAAAA')
    console.log('server poked');
}, 300000); // every 5 minutes (300000)


var exphbs = require('express-handlebars');
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({extname: '.hbs'}));
app.set('view engine', '.hbs');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '/public')));

app.set('view engine', 'hbs');
app.use(cookieSession({
	maxAge: 24 * 60 * 60 * 1000,
	keys: [keys.session.cookieKey]
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// connect to mongodb
mongoose.connect(keys.mongodb.dbURI, () => {
	console.log('connected to mongodb')
})

app.use('/profile', profileRoutes);

app.get('/', function(req, res) {
  res.render('index', { user: req.user });
});

app.get('/login'), (req, res) => {
	res.render('login', { user: req.user });
}
app.get('/logout'), (req, res) => {
	req.logout();
	res.redirect('/');
}

var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: keys.facebook.clientID,
    clientSecret: keys.facebook.clientSecret,
	callbackURL: "https://secret-fjord-13510.herokuapp.com/auth/facebook/callback",
	profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, done) {
	//   if (profile != null) {
	// 	  console.log("profile");
	// 	  console.log(profile);
	// 	  var user = profile;
	// 	  done(null, user);
	//   } else {
	// 	  done(err);
	//   }
	  // res.render('index')
    // User.findOrCreate(..., function(err, user) {
    //   if (err) { return done(err); }
    //   done(null, user);
	// });
	console.log("passport callback function fired")
	console.log(profile);
	// new models.User({
	//     username: profile.displayName,
	//     googleId: profile.id
	// }).save().then((newUser) => {
	//     console.log('new user created' + newUser);
	// })


	// check if user already exists in database 
	models.User.findOne({facebookId: profile.id}).then((currentUser) => {
		if (currentUser) {
			// already have user
			console.log("user is", currentUser);
			done(null, currentUser);
		} else {
			// if not, create new user
			new models.User({
				username: profile.displayName, 
				facebookId: profile.id,
				email: profile._json.email
			}).save().then((newUser) => {
				console.log('new user created');
				console.log(newUser);
				done(null, newUser);
			})
		}
	})
  }
));
// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', 
	passport.authenticate('facebook', { scope: ['email', 'user_friends'] }));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/',
									  failureRedirect: '/login' }));
									  

app.get('/auth/google', passport.authenticate('google', {
	scope: ['profile']
}));

app.get('/auth/google/redirect', passport.authenticate('google'), (req, res) => {
	/// res.send(req.user);
	res.redirect('/profile')
});
// app.get('/facebook', function(req, res) {
// 	console.log("facebook");

// 	FB.getLoginStatus(function(response) {
// 		statusChangeCallback(response);
// 		console.log(response);
// 	});
// });


// LINKEDIN STRATEGY
// var LinkedInStrategy = require('passport-linkedin').Strategy;
// passport.use(new LinkedInStrategy({
//     consumerKey: keys.linkedin.apiKey,
//     consumerSecret: keys.linkedin.secretKey,
//     callbackURL: "https://secret-fjord-13510.herokuapp.com/auth/linkedin/callback",
//     profileFields: ['id', 'first-name', 'last-name', 'email-address', 'headline']
//   },
//   function(token, tokenSecret, profile, done) {
// 	console.log("linkedin profile");
// 	console.log(profile);
//     // User.findOrCreate({ linkedinId: profile.id }, function (err, user) {
//     //   return done(err, user);
//     // });
//   }
// ));
// app.get('/auth/linkedin',
// 	passport.authenticate('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }));
// app.get('/auth/linkedin/callback', 
//   	passport.authenticate('linkedin', { failureRedirect: '/login' }),
//   	function(req, res) {
//     	// Successful authentication, redirect home.
//     	res.redirect('/');
// });


var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
passport.use(new LinkedInStrategy({
	clientID: keys.linkedin.clientID,
	clientSecret: keys.linkedin.clientSecret,
	callbackURL: "https://secret-fjord-13510.herokuapp.com/auth/linkedin/callback",
	scope: ['r_emailaddress', 'r_liteprofile'],
	state: true
  }, function(accessToken, refreshToken, profile, done) {
	// asynchronous verification, for effect...
	console.log('linkedin profile');
	console.log(profile);
	console.log("profile.id");
	console.log(profile.id);
	console.log(typeof profile.id);
	console.log("PROFILE JSON EMAILS")
	console.log(profile._json.emails)
	// photo: photos[0].value
	models.User.findOne({linkedinId: profile.id}).then((currentUser) => {
		if (currentUser) {
			// already have user
			console.log("user is", currentUser);
			done(null, currentUser);
		} else {
			// if not, create new user
			new models.User({
				username: profile.displayName, 
				linkedinId: profile.id
			}).save().then((newUser) => {
				console.log('new user created');
				console.log(newUser);
				done(null, newUser);
			})
		}
	})
	// process.nextTick(function () {
	//   // To keep the example simple, the user's LinkedIn profile is returned to
	//   // represent the logged-in user. In a typical application, you would want
	//   // to associate the LinkedIn account with a user record in your database,
	//   // and return that user instead.
	//   return done(null, profile);
	// });
  }));

//   email: profile._json.emails[0].value,
//   photo: photos[0].value,
app.get('/auth/linkedin',
  	passport.authenticate('linkedin'),
  	function(req, res){
    	// The request will be redirected to LinkedIn for authentication, so this
    	// function will not be called.
});
app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
	successRedirect: '/',
	failureRedirect: '/login'
}));








// app.get('/linkedin', function(req, res) {
// 	console.log("linkedin");
// 	res.redirect("https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=78w1f2pk5r3x2y&redirect_uri=https://secret-fjord-13510.herokuapp.com/auth/linkedin/callback&state=fooobar&scope=r_liteprofile%20r_emailaddress%20w_member_social");
// });

// app.get('/auth/linkedin/callback', function(req, res) {
// 	console.log("callback");

// 	const accessCode = req.query.code;
// 	var clientId = "78w1f2pk5r3x2y";
// 	var clientSecret = "7XrmOoEUZC27RAUN";
// 	var accessToken = null;

// 	const Http = new XMLHttpRequest();
// 	const url='https://www.linkedin.com/oauth/v2/accessToken?client_id='+clientId+'&client_secret='+clientSecret+'&grant_type=authorization_code&redirect_uri=https://secret-fjord-13510.herokuapp.com/auth/linkedin/callback&code='+accessCode;
// 	Http.open("GET", url);
// 	Http.send();
// 	Http.onreadystatechange = (e) => {
// 		console.log("type of HttpResonseText");
// 		console.log(typeof Http.responseText);
// 		accessToken = Http.responseText.slice(17, Http.responseText.length-23);
// 		console.log(accessToken);

// 		// This sample code will make a request to LinkedIn's API to retrieve and print out some
// 		// basic profile information for the user whose access token you provide.
// 		// Replace with access token for the r_liteprofile permission
// 		if (accessToken != null) {

// 		// printing info
// 		const options = {
// 			host: 'api.linkedin.com',
// 			path: '/v2/me',
// 			method: 'GET',
// 			headers: {
// 			'Authorization': `Bearer ${accessToken}`,
// 			'cache-control': 'no-cache',
// 			'X-Restli-Protocol-Version': '2.0.0'
// 			}
// 		};
// 		const profileRequest = https.request(options, function(res) {
// 			let data = '';
// 			res.on('data', (chunk) => {
// 			data += chunk;
// 			});
// 			res.on('end', () => {
// 			console.log('gets in here?')
// 			const profileData = JSON.parse(data);
// 			var lastName = profileData.localizedLastName;
// 			var firstName = profileData.localizedFirstName;
// 			});
// 		});
// 		profileRequest.end();

// 		// print image photo
// 		// GET https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~digitalmediaAsset:playableStreams))
// 		const options3 = {
// 		  host: 'api.linkedin.com',
// 		  path: '/v2/me?projection=(id,profilePicture(displayImage~digitalmediaAsset:playableStreams))',
// 		  method: 'GET',
// 		  headers: {
// 		    'Authorization': `Bearer ${accessToken}`,
// 		    'cache-control': 'no-cache',
// 		    'X-Restli-Protocol-Version': '2.0.0'
// 		  }
// 		};
// 		const profileRequest3 = https.request(options3, function(res) {
// 		  let data = '';
// 		  res.on('data', (chunk) => {
// 		    data += chunk;
// 		  });
// 		  res.on('end', () => {
// 		    console.log('prints email?')
// 		    const profileData = JSON.parse(data);

// 		    console.log("profileData");
// 		    console.log(profileData);

// 		    // console.log("JSON.stringify(profileData, 0, 2)");
// 		    // console.log(JSON.stringify(profileData, 0, 2));
			
// 		    // console.log("profileData.elements");
// 		    // console.log(profileData.elements);

// 		    // var profileString = JSON.stringify(profileData.elements);
// 		    // console.log(profileString);
// 			// var profileArray = profileString.split(`"`);
// 			// console.log(profileArray);
// 		  });
// 		});
// 		profileRequest3.end();


// 		// printing email
// 		const options2 = {
// 			host: 'api.linkedin.com',
// 			path: '/v2/emailAddress?q=members&projection=(elements*(handle~))',
// 			method: 'GET',
// 			headers: {
// 			'Authorization': `Bearer ${accessToken}`,
// 			'cache-control': 'no-cache',
// 			'X-Restli-Protocol-Version': '2.0.0'
// 			}
// 		};
// 		const profileRequest2 = https.request(options2, function(res) {
// 			let data = '';
// 			res.on('data', (chunk) => {
// 			data += chunk;
// 			});
// 			res.on('end', () => {
// 			console.log('prints email')
// 			const profileData = JSON.parse(data);
// 			// console.log(profileData);
		
// 			// console.log("JSON.stringify(profileData, 0, 2)");
// 			// console.log(JSON.stringify(profileData, 0, 2));
		
// 			console.log("profileData.elements");
// 			console.log(profileData.elements);
		
// 			// var profileString = JSON.stringify(profileData.elements);
// 			// console.log(profileString);
// 			// var profileArray = profileString.split(`"`);
// 			// console.log(profileArray);
// 			});
// 		});
// 		profileRequest2.end();

// 		}

// 	}

// 	res.render('login')
// });



var port = process.env.PORT || 8080;
app.listen(port);
console.log('Express started. Listening on port %s', port);
