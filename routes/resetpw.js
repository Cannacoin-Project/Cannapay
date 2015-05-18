var express         = require('express');
var router          = express.Router();
var mongoose        = require('mongoose');
var User            = require('../models/user');
var nodemailer      = require('nodemailer');

var transporter     = nodemailer.createTransport({
    service: process.env.NODEMAILER_SERVICE,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
    }
});

/* ---------------------------- Configure Speakeasy/One-Time-Password key and settings. */
var speakeasy       = require('speakeasy');

// Initiate variable for secret key used to generate OTP
var speakeasy_secret = process.env.SPEAKEASY_SECRET;

// Configure Time OTP and use a custom 60 second refresh.
speakeasy.totp({key: speakeasy_secret, step: process.env.SPEAKEASY_STEP});

// Reset PW page
router.get('/', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('resetpw', { message: req.flash('signupMessage') });
});

// Reset PW page
router.post('/', function(req, res) {
    var db = req.db;

     db.collection('users').findOne({'local.email': req.body.email}, function(err, result) {
        if(err){
     		response = {
     			success: false, 
     			message: err
     		}
     	} 

 		if(result && result.local.passwordReset == false){ 
 			// setup e-mail data with unicode symbols
            var mailOptions = {
                from: process.env.NDOEMAILER_FROM, // sender address
                to: req.body.email, // list of receivers
                subject: 'CannaPay Password Reset', // Subject line
                text: 'To update your password please visit: ' + process.env.CANNAPAY_ROOT_URL + '/resetpw/update?email='+result.local.email+'&hash='+result.local.emailHash,
                html: '<a href="' + process.env.CANNAPAY_ROOT_URL + '/resetpw/update?email='+result.local.email+'&hash='+result.local.emailHash+'">Click here to verify your email!</a>' // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error)
                    res.send({
                        success: false,
                        message: JSON.stringify(error)
                    })
                }else{
                    db.collection('users').update({_id: result._id}, {$set: {'local.passwordReset': true, 'local.passwordReset_timestamp': Date.now()}}, function(err, result){
                        console.log('error: ' + error + ' result: ' + result)
                    });
                    res.send({
                        success: true,
                        message: 'Password reset sent to email: ' + req.body.email
                    })
                }
            });
            
 		} else {
 			response = {
     			success: false, 
     			message: 'Password reset request already submitted.'
     		}
     		res.send(response);
 		}
            
 		db.close();
            
    });    
});

/* POST to update user (password). */
router.get('/update', function(req, res) {
    
    var db = req.db;
    var email = req.query.email;
    var hash = req.query.hash;

    User.findOne({'local.email': email}, function(err, user) {
        if(err){
            response = {
                success: false, 
                message: err
            }
        } 

        if(user){
            if(user.verifiedEmail(user.local.email) && user.local.emailHash == hash){
                res.render('updatepw', {email: email, hash: hash});
            } else {
                res.send({
                    success: false,
                    message: 'Invalid email token.'
                })
            }
        } else {
            res.redirect('/login');
        }
    });
});

router.post('/update', function(req,res){
    var db = req.db;

    // Form elements
    var email = req.body.email;
    var hash = req.body.hash;
    var newPassword = req.body.newPassword;
    var newPasswordConfirm = req.body.newPasswordConfirm;
    var google2fa = req.body.google2fa;

    // Validate that both passwordNew and passwordNewConfirm form input match
    if(newPassword == newPasswordConfirm){
        // Check if user has 2F Enabled
        User.findOne({'local.email': email}, function (error, user){
            if(user.apiKeys.google2fa.enabled == true){
                // GET OTP server side using Speakeasy (for verification against user input)
                var verifyOTP = speakeasy.time({key: req.user.apiKeys.google2fa.base32, encoding: 'base32'});
                
                // Verify form input OTP vs verifyOTP if true, continue
                if(google2fa == verifyOTP){
                    // Hash new password using User model.method generateHash()
                    newPassword = user.generateHash(req.body.newPassword)

                    db.collection('users').updateById(user._id, { $set: { "local.password": newPassword, 'local.passwordReset': false } }, function(err, result){
                        if(err){
                            res.send({
                                success: false, 
                                message: JSON.stringify(err)
                            });
                        }
                        
                        var response = {
                            success: true,
                            message: 'Password updated successfully!'
                        };

                        res.json(response);
                    });
                } else{
                    var response = {
                        success: false,
                        message: 'Invalid Google OTP'
                    };

                    res.json(response);
                }
            } else{
                console.log('new pw: ' + req.body.newPassword)
                var newPassword = user.generateHash(req.body.newPassword)

                db.collection('users').updateById(user._id, { $set: { "local.password": newPassword, 'local.emailHash': user.generateHash(email), 'local.passwordReset': false } }, function(err, result){
                    if(err){
                        res.send({success: false, message: JSON.stringify(err)})
                    }
                    
                    var response = {
                        success: true,
                        message: 'Password updated successfully!'
                    };

                    res.json(response);
                });
            }
        })
    } else{
        var response = {
            success: false,
            message: 'New passwords did not match, please try again.'
        };

        res.json(response);
    }
});

module.exports = router;