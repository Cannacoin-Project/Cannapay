var express 		= require('express');
var router 			= express.Router();
var passport        = require('passport');
var passportlocal   = require('passport-local');
var speakeasy 		= require('speakeasy');
/* ---------------------------- Configure Speakeasy/One-Time-Password key and settings. */

// Initiate variable for secret key used to generate OTP
var speakeasy_secret = process.env.SPEAKEASY_SECRET;

// Configure Time OTP and use a custom 60 second refresh.
speakeasy.totp({key: speakeasy_secret, step: process.env.SPEAKEASY_STEP});

/* ---------------------------- END Configure Speakeasy/One-Time-Password key and settings. */

/* ---------------------------- Routes */

// Login homepage
router.get('/', function(req, res) {
	res.render('login', { message: req.flash('loginMessage') });
});

// Login post logic
router.post('/', passport.authenticate('local-login', {
	successRedirect : '/', // redirect to the secure profile section
	failureRedirect : '/login', // redirect back to the signup page if there is an error
	failureFlash : true // allow flash messages
}));

// Route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

module.exports = router;
