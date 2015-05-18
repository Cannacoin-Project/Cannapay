// config/passport.js
// Load form field
var validator       = require('validator');
// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
// load up the user model
var User            = require('../models/user');
var request         = require('request');
var crypto          = require('crypto');

/* ---------------------------- Configure Speakeasy/One-Time-Password key and settings. */
var speakeasy       = require('speakeasy');

// Initiate variable for secret key used to generate OTP
var speakeasy_secret = process.env.SPEAKEASY_SECRET;

// Configure Time OTP and use a custom 60 second refresh.
speakeasy.totp({key: speakeasy_secret, step: process.env.SPEAKEASY_STEP});

/* ---------------------------- END Configure Speakeasy/One-Time-Password key and settings. */

// expose this function to our app using module.exports
module.exports = function(passport) {
    
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
            // asynchronous
            // User.findOne wont fire unless data is sent back
            process.nextTick(function() {

                // Confirm valid email is used for signup
                if(validator.isEmail(email)){
                    
                    // Confirm both password fields
                    if(password == req.body.passwordConfirm){
                        
                        // find a user whose email is the same as the forms email
                        // we are checking to see if the user trying to login already exists
                        User.findOne({ 'local.email' :  email }, function(err, user) {
                            // if there are any errors, return the error
                            if (err) {
                                return done(err);
                            }                            
                            // check to see if theres already a user with that email
                            if (user) {
                                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                            } else {

                                // if there is no user with that email
                                // create the user
                                var newUser = new User();

                                // set the user's local credentials
                                newUser.local.email    = email;
                                newUser.local.emailHash = newUser.generateHash(email);
                                newUser.local.verifiedEmail = false;
                                newUser.local.password = newUser.generateHash(password);
                                newUser.local.registeredTimestamp = Date.now();
                                newUser.username = '';
                                newUser.fullname = '';
                                newUser.age = '';
                                newUser['location'] = '';
                                newUser.gender = '';
                                newUser.apiKeys.yubiKey = '';
                                newUser.apiKeys.cannapay = '';
                                newUser.apiKeys.bittrexApiKey = '';
                                newUser.apiKeys.bittrexPrivateKey = '';
                                newUser.apiKeys.swisscexApiKey = '';
                                newUser.apiKeys.swisscexPrivateKey = '';    
                                newUser.apiKeys.google2fa.google_auth_url = 'images/2fa.jpg';
                                newUser.wallets.cannacoin.label = email;
                                newUser.wallets.cannacoin.address = '';
                                newUser.wallets.cannacoin.balance = '';
                                newUser.wallets.bittrex = '';
                                newUser.wallets.swisscex = '';
                                newUser.subUsers = '';
                                newUser.permissions = '';

                                // save the user
                                newUser.save(function(err) {
                                    if (err)
                                        throw err;
                                return done(null, newUser);
                                });
                            }
                        });
                    } else{
                        
                        return done(null, false, req.flash('signupMessage', 'Passwords did not match.')); 
                    }
                } else{
                  
                    return done(null, false, req.flash('signupMessage', 'Please enter a valid email address.'));
                }
                
            });
    }));


    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form
        
        // Confirm valid email is used for signup
        if(validator.isEmail(email)){
           
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'local.email' :  email }, function(err, user) {
                 
                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'Invalid username or password, please try again.')); // req.flash is the way to set flashdata using connect-flash
                if(user.local.verifiedEmail == false){
                    return done(null, false, req.flash('loginMessage', 'Please contact the admin to activate your beta account (josh@cannacoin.cc).')); // req.flash is the way to set flashdata using connect-flash    
                }
                // if the user is found but the password is wrong
                if (!user.validPassword(password)) {
                    User.update( { _id: user }, {$inc: {"local.failedAttempts" : 1 }}, function(err, result) {});
                    return done(null, false, req.flash('loginMessage', 'Invalid username or password, please try again.')); // create the loginMessage and save it to session as flashdata
                }
                
                //If we have 2FA enabled, check that it's legit   
                if(user.apiKeys.google2fa.enabled == true){
                   
                    var google2faCode = speakeasy.time({key: user.apiKeys.google2fa.base32, encoding: 'base32'});
                    var google2faForm = req.body.google2faCode
                    if(google2faCode == google2faForm) {

                        // all is well, return successful user
                        return done(null, user);

                    } else {
                        //Invalid 2FA Code
                        return done(null, false, req.flash('loginMessage', 'Invalid 2FA Code, please try again.')); // create the loginMessage and save it to session as flashdata

                    }
                } 
            
                if(user.apiKeys.yubiKey.enabled == true){
                    var uuid;
                    //Hook into request for yubikey code.
                    //HMAC 
                    var OTP = req.body.yubiKeyOtp;
                    if(OTP == null || OTP == undefined || OTP == ''){
                        OTP = 'blank request'
                    }
                    var UUID = user.apiKeys.yubiKey.uuid; 
                    var apiKey = process.env.FOBFUSCATE_API_KEY;
                    var apiUrl = process.env.FOBFUSCATE_API_URL;

                    //HMAC Hash output
                    var hash = crypto.createHash('sha256');
                    hash.update(OTP+UUID+apiKey);
                    MAC = hash.digest('hex');

                    // Create HTTP Request to send to Bittrex
                    request.post(apiUrl, {
                        form: {OTP: OTP, MAC: MAC}
                    }, function(error, response, body) {
                        console.log(body)

                        body = JSON.parse(body);
                        if(body.IsSuccess){
                            return done(null, user);
                        } 
                        if(!body.IsSuccess) {
                            return done(null, false, req.flash('loginMessage', 'Error: ' + body.LastError)); // create the loginMessage and save it to session as flashdata   
                        }
                    });                       
                } else {
                    // all is well, return successful user
                    return done(null, user);
                }
            });
        } else {
            return done(null, false, req.flash('loginMessage', 'Please enter a valid email address.'));
        }
    }));
};
