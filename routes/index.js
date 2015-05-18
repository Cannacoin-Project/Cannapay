var express         = require('express');
var router          = express.Router();
var passport        = require('passport');
var passportlocal   = require('passport-local');
var crypto          = require('crypto');
var request         = require('request');

// Load the twilio module
var twilio = require('twilio');
 
// Create a new REST API client to make authenticated requests against the
// twilio back end
var client = new twilio.RestClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

//TODO: Still need to setup process env and implement more functionality and views for UI. 
router.get('/txt', function(req, res){
  console.log(req.query)
  if(!req.query.phone){
    res.send({
      success: false,
      message: 'Phone number parameter required. (eg. phone=123123123)'
    })
  }
  // Pass in parameters to the REST API using an object literal notation. The
  // REST client will handle authentication and response serialzation for you.
  client.sms.messages.create({
      to:'+12063955603',
      from:'+12406075279',
      body:'This is a test message from Cannapay'
  }, function(error, message) {
      
      // The HTTP request to Twilio will run asynchronously. This callback
      // function will be called when a response is received from Twilio
      // The "error" variable will contain error information, if any.
      // If the request was successful, this value will be "falsy"
      if (!error) {
          // The second argument to the callback will contain the information
          // sent back by Twilio for the request. In this case, it is the
          // information about the text messsage you just sent:
          console.log('Success! The SID for this SMS message is:');
          console.log(message.sid);

          res.send({
            success: true,
            message: 'Txt message confirmed! '+message.sid
          })

          console.log('Message sent on:');
          console.log(message.dateCreated);
      } else {
          res.send({
            success: false,
            message: 'Txt message failed! '+ error.message
          })
          console.log('Oops! There was an error.');
      }
  });
});

// Load homepage
router.get('/', isLoggedIn, function(req, res) {
  res.render('index', {
	 isAuthenticated: req.isAuthenticated(),
	 user: req.user,
	 title: 'CannaPay' 
  });
});

// Load signup page
router.get('/signup', function(req, res) {
    var db = req.db;
    // render the page and pass in any flash data if it exists
    res.render('signup', { message: req.flash('signupMessage') });
});

// Signup post logic
router.post('/signup', 
  passport.authenticate('local-signup', {
    successRedirect : '/login', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  })
);

// Load settings page
router.get('/settings', isLoggedIn, function(req, res) {
    var db = req.db;
    res.render('settings');
});

// Load API documentation
router.get('/apidocs', function(req, res) {
  res.render('apidocs');
});

//Load trade page
router.get('/trade', function(req, res) {
  if(req.query.market){
    var market = req.query.market;  
  } else {
    var market = 'BTC-CCN'
  }
  
  res.render('trade', {market: market});
});

// Show trade history page
router.get('/trades', function(req, res) {
  res.render('trades');
});

// Show order page
router.get('/orders', function(req, res) {
  res.render('orders', {market: req.query.market});
});

// Logout
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/login');
});

// Rout middleware to verify API Key (NO TRUE LOGIC YET, JUST A PLACEHOLDER)
function verifyApiKey(req, res, next){
    if(req.query.apiKey == 1){
      console.log('Passed verification with apiKey = '+req.query.apiKey);
      
      return next();
    }
    else{
      res.redirect('/login')
    }
}

// Route middleware to insure login
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page

  res.redirect('/login');
}

// EXAMPLES ROUTES BELOW FOR CIPHER & APIKEY GEN
// Generate API Key (Example, not used in prod code)
router.get('/apikey', function(req, res) {
  crypto.randomBytes(32, function(ex, buf) {

    var apiKey = buf.toString('hex');

    console.log(' Have %d bytes of random data: %s', buf.length, apiKey);

    res.send({'apikey': apiKey, 'length': ''+buf.length+' Bytes'});
  });
});

// AES Cipher/Encryption Example - TODO: Set secret in process.env
router.get('/cipher', function(req, res){
  // AES 256 ENCRYPTION/DECRYPTION
  var cipherSecret = 'enter a proper cipher secret';

  // Configure encryption algorithm and secret 
  var cipher = crypto.createCipher('aes-256-cbc', cipherSecret);

  // Configure decryption algorithm and secret 
  var decipher = crypto.createDecipher('aes-256-cbc', cipherSecret);

  var toEncrypt = 'fix this length';
  // Insert data to be encrypted as well as input/output encoding.
  cipher.update(toEncrypt, 'utf8', 'base64');

  // Output encrypted data to variable.
  var encryptedData = cipher.final('base64')

  // Insert data to be decrypted in to decipher.update as well as input/output encoding.
  decipher.update(encryptedData, 'base64', 'utf8');

  // Asign decrypted data to variable
  var decryptedData = decipher.final('utf8');

  // Output results to console for verification.
  console.log('encrypted :', encryptedData);
  console.log('decrypted :', decryptedData);

  var response = {
    'Encrypted': encryptedData,
    'Decrypted': decryptedData
  }

  res.send(response)
});

module.exports = router;