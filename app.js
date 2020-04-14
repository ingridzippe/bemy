"use strict";

var express = require('express');
var app = express();
var path = require('path');
const https = require('https');
const http = require('http');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


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

app.get('/', function(req, res) {
  res.render('index')
});

app.get('/linkedin', function(req, res) {
	console.log("linkedin");
	res.redirect("https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=78w1f2pk5r3x2y&redirect_uri=https://secret-fjord-13510.herokuapp.com/auth/linkedin/callback&state=fooobar&scope=r_liteprofile%20r_emailaddress%20w_member_social");
});

app.get('/auth/linkedin/callback', function(req, res) {
	console.log("callback");

	const accessCode = req.query.code;
	var clientId = "78w1f2pk5r3x2y";
	var clientSecret = "7XrmOoEUZC27RAUN";
	var accessToken = null;

	const Http = new XMLHttpRequest();
	const url='https://www.linkedin.com/oauth/v2/accessToken?client_id='+clientId+'&client_secret='+clientSecret+'&grant_type=authorization_code&redirect_uri=https://secret-fjord-13510.herokuapp.com/auth/linkedin/callback&code='+accessCode;
	Http.open("GET", url);
	Http.send();
	Http.onreadystatechange = (e) => {
		console.log("type of HttpResonseText");
		console.log(typeof Http.responseText);
		accessToken = Http.responseText.slice(17, Http.responseText.length-23);
		console.log(accessToken);

		// This sample code will make a request to LinkedIn's API to retrieve and print out some
		// basic profile information for the user whose access token you provide.
		// Replace with access token for the r_liteprofile permission
		if (accessToken != null) {

		// printing info
		const options = {
			host: 'api.linkedin.com',
			path: '/v2/me',
			method: 'GET',
			headers: {
			'Authorization': `Bearer ${accessToken}`,
			'cache-control': 'no-cache',
			'X-Restli-Protocol-Version': '2.0.0'
			}
		};
		const profileRequest = https.request(options, function(res) {
			let data = '';
			res.on('data', (chunk) => {
			data += chunk;
			});
			res.on('end', () => {
			console.log('gets in here?')
			const profileData = JSON.parse(data);
			var lastName = profileData.localizedLastName;
			var firstName = profileData.localizedFirstName;
			});
		});
		profileRequest.end();

		// print image photo
		// GET https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~digitalmediaAsset:playableStreams))
		// const options2 = {
		//   host: 'api.linkedin.com',
		//   path: '/v2/me?projection=(id,profilePicture(displayImage~digitalmediaAsset:playableStreams))',
		//   method: 'GET',
		//   headers: {
		//     'Authorization': `Bearer ${accessToken}`,
		//     'cache-control': 'no-cache',
		//     'X-Restli-Protocol-Version': '2.0.0'
		//   }
		// };
		// const profileRequest2 = https.request(options2, function(res) {
		//   let data = '';
		//   res.on('data', (chunk) => {
		//     data += chunk;
		//   });
		//   res.on('end', () => {
		//     console.log('prints email?')
		//     const profileData = JSON.parse(data);

		//     console.log("profileData");
		//     console.log(profileData);

		//     console.log("JSON.stringify(profileData, 0, 2)");
		//     console.log(JSON.stringify(profileData, 0, 2));
			
		//     console.log("profileData.elements");
		//     console.log(profileData.elements);

		//     var profileString = JSON.stringify(profileData.elements);
		//     console.log(profileString);
			// var profileArray = profileString.split(`"`);
			// console.log(profileArray);
		//   });
		// });
		// profileRequest2.end();


		// printing email
		const options2 = {
			host: 'api.linkedin.com',
			path: '/v2/emailAddress?q=members&projection=(elements*(handle~))',
			method: 'GET',
			headers: {
			'Authorization': `Bearer ${accessToken}`,
			'cache-control': 'no-cache',
			'X-Restli-Protocol-Version': '2.0.0'
			}
		};
		const profileRequest2 = https.request(options2, function(res) {
			let data = '';
			res.on('data', (chunk) => {
			data += chunk;
			});
			res.on('end', () => {
			console.log('prints email')
			const profileData = JSON.parse(data);
			console.log(profileData);
		
			console.log("JSON.stringify(profileData, 0, 2)");
			console.log(JSON.stringify(profileData, 0, 2));
		
			console.log("profileData.elements");
			console.log(profileData.elements);
		
			// var profileString = JSON.stringify(profileData.elements);
			// console.log(profileString);
			// var profileArray = profileString.split(`"`);
			// console.log(profileArray);
			});
		});
		profileRequest2.end();


		}

	}

	res.render('login')
});



var port = process.env.PORT || 8080;
app.listen(port);
console.log('Express started. Listening on port %s', port);
