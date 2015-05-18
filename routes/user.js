var express         = require('express');
var router          = express.Router();
var request         = require('request');
var coin            = require('../config/cannacoin.js');
var crypto          = require('crypto');
var speakeasy       = require('speakeasy');
var mongoose        = require('mongoose');
var User            = require('../models/user');
var swisscex        = require('../libs/swisscex');
/* ---------------------------- Configure Speakeasy/One-Time-Password key and settings. */

// Initiate variable for secret key used to generate OTP
var speakeasy_secret = process.env.SPEAKEASY_SECRET;

// Configure Time OTP and use a custom 60 second refresh.
speakeasy.totp({key: speakeasy_secret, step: 

// ------------------------- USER SETTINGS 

/* GET user id. */
router.get('/', function(req, res) {
    var db = req.db;
    var user = req.session.passport.user;
    
    db.collection('users').findById(user, function(err, result) {
        res.send(result);
    });    
});

//TODO: Implement user add
/* POST to adduser. */
router.post('/add', function(req, res) {
    var db = req.db;
    
    db.collection('users').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

//TODO: Implement subUsers
/* POST to adduser. */ 
router.post('/addSubUser', function(req, res) {
    var db = req.db;
    var user = req.session.passport.user;
    
    db.collection('users').updateById( { _id: user }, {$set: {fullname: "test" }}, function(err, result) {
        res.send(
            (err === null) ? { msg: 'Success!' } : { msg: err }
        );
    });
});

/* POST to update user (password). */
router.post('/update', function(req, res) {
    var db = req.db;
    var user = req.session.passport.user;

    // Validate that both passwordNew and passwordNewConfirm form input match
    if(req.body.passwordNew == req.body.passwordNewConfirm){
        
        // Validate that input password matches hashed password
        if(req.user.validPassword(req.body.currentPassword)){
            
            // Check if user has 2F Enabled
            if(req.user.apiKeys.google2fa.enabled == true){
                
                // GET OTP server side using Speakeasy (for verification against user input)
                var verifyOTP = speakeasy.time({key: req.user.apiKeys.google2fa.base32, encoding: 'base32'});
                
                // Verify form input OTP vs verifyOTP if true, continue
                if(req.body.google2fa == verifyOTP){

                    // Hash new password using User model.method generateHash()
                    var newPassword = req.user.generateHash(req.body.passwordNew)

                    db.collection('users').updateById(user, { $set: { "local.password": newPassword } }, function(err, result){
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
                
                var newPassword = req.user.generateHash(req.body.passwordNew)
                

                db.collection('users').updateById(user, { $set: { "local.password": newPassword } }, function(err, result){
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
        } else {
            var response = {
                    success: false,
                    message: 'Incorrect password'
                };

            res.json(response);
        }
    } else{
        var response = {
            success: false,
            message: 'New passwords did not match'
        };

        res.json(response);
    }
});

/* DELETE to deleteuser. */
router.delete('/deleteuser/:id', function(req, res) {
    var db = req.db;
    var userToDelete = req.params.id;
    db.collection('users').removeById(userToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

/* Generate new API Key. */
router.get('/newapikey', function(req, res) {
    var db = req.db;
    var user = req.session.passport.user;

    crypto.randomBytes(32, function(ex, buf) {
        var apiKey = buf.toString('hex');

         db.collection('users').updateById(user, { $set: { "apiKeys.cannapay": apiKey } }, function(err, result){
                
            if(err){
                res.send({success: false, message: JSON.stringify(err)})
            }

            res.send({success: true, message: 'API Generated!', data: { apiKey: apiKey }});   

        });
    });
});

// ------------------------- 2FA 

/* ENABLE Google 2FA. */
router.get('/enable2fa', function(req, res) {
    var db = req.db;
    var user = req.session.passport.user;
    var generateOTP = speakeasy.generate_key({length: 1, google_auth_qr: true, symbols: false, name: "CannaPay"});
    
    db.collection('users').updateById(user, { $set: { "apiKeys.google2fa": { ascii: generateOTP.ascii, hex: generateOTP.hex, base32: generateOTP.base32, google_auth_url: generateOTP.google_auth_qr,  enabled: true } } }, function(err, result){
        
        if(err){
            res.send({success: false, message: err})
        }

        res.send({success: true, message: '2FA Enabled!', data: { google_auth_qr: generateOTP.google_auth_qr } } );   
    });
});

/* DISABLE Google 2FA. */
router.get('/disable2fa', function(req, res) {
    var db = req.db;
    var user = req.session.passport.user;
    var defaultImg = 'images/2fa.jpg';

    db.collection('users').updateById(user, { $set: { "apiKeys.google2fa": { google_auth_url: defaultImg, enabled: false } } }, function(err, result){
        if(err){
            res.send({success: false, message: err})
        }

        res.send({success: true, message: '2FA Disabled!'});   
    });
});

/* ENABLE Google 2FA. */
router.post('/enableFobfuscate', function(req, res) {
    var db = req.db;
    var user = req.session.passport.user;
    
    db.collection('users').updateById(user, { $set: { "apiKeys.yubiKey": {enabled: true, uuid: req.body.uuid} } } , function(err, result){
        if(err){
            res.send({success: false, message: err});
        }

        res.send({success: true, message: 'Fobfuscate Enabled!', data: { enabled: true, uuid: req.body.yubiKeyUuid } } );   
    });
});

/* DISABLE Google 2FA. */
router.post('/disableFobfuscate', function(req, res) {
    var db = req.db;
    var user = req.session.passport.user;

    db.collection('users').updateById(user, { $set: { "apiKeys.yubiKey": {enabled: false, uuid: null} } }, function(err, result){
        if(err){
            res.send({success: false, message: err})
        }
        res.send({success: true, message: 'Fobfuscate Disabled!'});   
    });
});

// ------------------------- CANNACOIND 
/* GET Address balances for user */
router.get('/balance', function(req, res) {
    var db = req.db;
    var user = req.session.passport.user

    db.collection('users').findById(user, function(err, result) {
        coin.getaddressesbyaccount(result.local.email, function(err, addresses) {
            if(err) {
                res.send('Error: Server error reteriving account address, please try again or contact the administrator');
            }
            if(addresses.length == 0){
                var response = {
                    success: false,
                    message: "You don't have any addresses!"
                  
                };

                res.json(response); 
            } else{
                coin.getBalance(result.local.email, function(err, balance) {

                    if(err) {
                        response = {
                            success: false,
                            message: "Error: Server getbalance command failed, please try again or contact the administrator"
                        }

                        res.json(response); 
                    }

                    var response = {
                        success: true,
                        data : {
                            label: result.local.email,
                            addresses: addresses,
                            balance: balance.toFixed(8)
                        }
                    };
                
                   res.json(response);


                });
            }
        });  
    });       
});

// Get coin daemon balance on server (Optional parameters: count, from)
router.get('/tx', function(req, res) {
    if(!req.query.count){
        req.query.count = 10;
    }
    if(!req.query.from){
        req.query.from = 0;
    }

    var db = req.db;
    var user = req.session.passport.user
    var countTx = parseInt(req.query.count);
    var fromTx = parseInt(req.query.from);

    db.collection('users').findById(user, function(err, result) {
        coin.listtransactions(result.local.email, countTx, fromTx, function(err, tx) {
            if(err) {
                var response = {
                    success: false,
                    message: "Error: Server error reteriving account tx, please try again or contact the administrator."
                }
                res.send(response);
            }
            
            if(tx.length == 0){
                var response = {
                    success: false,
                    message: "This account has no transactions."
                    }

                res.json(response); 
            } else{
                function newestFirst(a,b) {
                    if (a.time > b.time)
                        return -1;
                    if (a.time < b.time)
                        return 1;
                    return 0;
                }

                
                var response = {

                        success: true,
                        tx: tx.sort(newestFirst)
                        
                    };
                
               res.json(response);
            }

        });  
    });       
});

/* GET Address balances for user */
router.get('/newaddress', function(req, res) {
    var db = req.db;
    var user = req.session.passport.user

    db.collection('users').findById(user, function(err, result) {
        coin.getnewaddress(result.local.email, function(err, address) {
            if(err) {
                res.send({
                    success: false,
                    message: 'Error: Server error generating new address, please try again or contact the administrator'
                });
            } else{
                var response = {
                        success: true,
                        data:{
                            address: address
                        }
                        
                    };
               res.json(response);
            }
        });
    });       
});

/* GET SERVER DAEMON WITHDRAW. */
router.post('/withdraw', function(req, res) {
    var db = req.db;
    var user = req.user.local.email;
    var withdrawaddress = req.body.withdrawaddress;
    var feeAddress = process.env.CANNAPAY.FEE_ADDRESS;

    var amount = req.body.amount;

    coin.getaccountaddress(user, function(err, address) {
        if(err) {
            var response = {
                success : false,
                message  : "Error reteriving account address."
            };
            res.json(response);
        }
        coin.validateaddress(withdrawaddress, function(err, valid) {
            if(err){
                var response = {
                    success : false,
                    message  : "Unable to get response from server validateaddress command."
                };
                res.json(response);
            }

            var valid = valid.isvalid;
            
            if(!valid){
                var response = {
                    success : false,
                    message  : "The withdraw address you've entered is not a valid address."
                };
                res.send(response);
            }
            if(valid){
                var transaction = {};
                transaction[withdrawaddress] = parseFloat(amount);
                transaction[feeAddress] = parseFloat(amount*.01);
               
                coin.sendMany(user, transaction, function(err, txid) {
                    if(err){
                        response = {
                            success         : false,
                            message         : err.message
                        };

                        res.send(response);

                    } else{
                        var tx = {
                            userId          : req.user._id,
                            user            : req.user.local.email,
                            origin          : "Cannpay",
                            type            : "withdraw",
                            withdrawaddress : withdrawaddress,
                            amount          : amount,
                            transactionid   : txid,
                            timestamp       : (Date.now()/1000).toFixed(0)
                        };

                        var db = req.db;
    
                        db.collection('transactions').insert(tx, function(err, result){
                            response = {
                                success         : true,
                                message         : 'Sent' + tx.amount + ' to' + tx.withdrawaddress +''
                            };

                            res.send(response);
                        });
                    }  
                });
            }
        });
    });
});

// ------------------------- BITTREX 

/* GET Bittrex API. */
router.get('/bittrex', function(req, res) {
    var db = req.db;
    var user = req.session.passport.user;

    db.collection('users').findById(user, function(err, result) {
        if(err){
            res.send({success: false, message: "Database error: problem querying user"});
        } 

        if(!result.apiKeys.bittrexApiKey && !result.apiKeys.bittrexApiKey){
            res.send({success: false, message: "No Bittrex API or Private Key"});
        } else{ 
            // Configure Bittrex API Keys
            var apiKey = result.apiKeys.bittrexApiKey;
            var privateKey = result.apiKeys.bittrexPrivateKey;
            
            // Create Nonce using Unix Time Code
            var nonce = (Date.now()/1000).toFixed(0);

            //HMAC 
            var apiPath = 'account/getbalances';
            var apiUrl = 'https://bittrex.com/api/v1.1/' + apiPath + '?apikey=' + apiKey + '&nonce=' + nonce;
            
            //HMAC Hash output
            var hash = crypto.createHmac('sha512', privateKey).update(apiUrl).digest('hex');

            // Create HTTP Request to send to Bittrex
            request({
                uri: apiUrl,
                method: "GET",
                headers: {
                  'apisign': hash
                },
                timeout: 10000,
                followRedirect: false,
                maxRedirects: 10
                }, function(error, response, body) {

                    res.send(body);

            });  
        }
    });   
});

/* GET Bittrex API. */
router.post('/bittrex/apikeys', function(req, res) {
    var db = req.db;
    var user = req.session.passport.user;
    
    if(req.body.bittrexApiKey && req.body.bittrexPrivateKey){      
        db.collection('users').updateById(user, { $set: { "apiKeys.bittrexApiKey": req.body.bittrexApiKey } }, function(err, result){
            if(err){
                res.send({success: false, message: JSON.stringify(err)})
            }
            db.collection('users').updateById(user, { $set: { "apiKeys.bittrexPrivateKey": req.body.bittrexPrivateKey } }, function(err, result){
                if(err){
                    res.send({success: false, message: JSON.stringify(err)})
                }

                var response = {
                    success: true,
                    message: 'Bittrex API keys updated successfully!'
                };

                res.json(response);
            });
        });
    } else {
        var response = {
                success: false,
                message: 'Please enter both Public & Private API Keys!'
            };
        res.json(response);
    }
});

/* GET Bittrex API. */
router.post('/bittrex/withdraw', function(req, res) {
    var db = req.db;
    var user = req.session.passport.user;

    db.collection('users').findById(user, function(err, result) {
        if(err){
            res.json({success: false, message: "Database error: problem querying user"});
        } 

        if(!result.apiKeys.bittrexApiKey && !result.apiKeys.bittrexApiKey){
            res.json({success: false, message: "No Bittrex API or Private Key"});
        } else{ 
            // Configure Bittrex API Keys
            var apiKey = result.apiKeys.bittrexApiKey;
            var privateKey = result.apiKeys.bittrexPrivateKey;
            var withdrawaddress = req.body.withdrawaddress;
            var amount = req.body.amount;
            var currency = req.body.currency;

            // 1% Developers fee (NOT YET IMPLEMENTED)
            var feeAddress = process.env.CANNAPAY.FEE_ADDRESS;
            var btcFeeAddress = process.env.CANNAPAY.BTC_FEE_ADDRESS;
            
            // Create Nonce using Unix Time Code
            var nonce = (Date.now()/1000).toFixed(0);

            //HMAC 
            var apiPath = 'account/withdraw';
            var apiParams = '&currency='+req.body.currency+'&quantity='+req.body.amount+'&address='+req.body.withdrawaddress
            var apiUrl = 'https://bittrex.com/api/v1.1/' + apiPath + '?apikey=' + apiKey + '&nonce=' + nonce + apiParams;
            
            //HMAC Hash output
            var hash = crypto.createHmac('sha512', privateKey).update(apiUrl).digest('hex');

            // Create HTTP Request to send to Bittrex
            request({
                uri: apiUrl,
                method: "GET",
                headers: {
                  'apisign': hash
                },
                timeout: 10000,
                followRedirect: false,
                maxRedirects: 10
                }, function(error, response, body) {
                    body = JSON.parse(body);
                    console.log(body.success)
                    
                    if(error){
                        res.json({
                            success : false,
                            message  : error
                        });
                    }

                    if(body.success == true){
                        res.json({
                            success : true,
                            result: {uuid: body.result.uuid}
                        });
                    } 
                    if(body.success == false){
                        res.json({
                            success : false,
                            message: body.message
                        });
                    } 
                }
            );  
        };  
    });
});


/* Generate new API Key. */
router.get('/resetattempts', function(req, res) {
    var db = req.db;
    var user = req.session.passport.user;
   
    db.collection('users').updateById(user, { $set: { "local.failedAttempts": 0 } }, function(err, result){
        
    if(err){
        res.send({success: false, message: JSON.stringify(err)})
    }

    res.send({success: true, message: 'Password counter reset!'});   

    });
});


// route middleware to make sure
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page

  res.redirect('/login');
}

// route middleware to make sure
function validateApiKey(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.params.apiKey)
    return next();

  // if they aren't redirect them to the home page

  res.redirect('/login');
}

module.exports = router;