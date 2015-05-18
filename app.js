// Headers created with: http://patorjk.com/software/taag/#p=display&h=0&v=1&f=ANSI%20Shadow&t=CANNAPAY
//
//   ██████╗ █████╗ ███╗   ██╗███╗   ██╗ █████╗ ██████╗  █████╗ ██╗   ██╗
//  ██╔════╝██╔══██╗████╗  ██║████╗  ██║██╔══██╗██╔══██╗██╔══██╗╚██╗ ██╔╝
//  ██║     ███████║██╔██╗ ██║██╔██╗ ██║███████║██████╔╝███████║ ╚████╔╝ 
//  ██║     ██╔══██║██║╚██╗██║██║╚██╗██║██╔══██║██╔═══╝ ██╔══██║  ╚██╔╝  
//  ╚██████╗██║  ██║██║ ╚████║██║ ╚████║██║  ██║██║     ██║  ██║   ██║   
//   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝   ╚═╝   
//   v1.0 created by. SubCreative (aka. Josh Dellay)              
//--v                                                  
// Used to load env variables                                                             
var assert          = require('assert');
var env             = require('node-env-file');

// Load any undefined ENV variables form a specified file.
env(__dirname + '/process.env');

var express         = require('express');
var http            = require('http');
var app             = express();
var debug           = require('debug')('nodeAPI2');
var path            = require('path');
var favicon         = require('static-favicon');
var logger          = require('morgan');
var bodyParser      = require('body-parser');
var flash           = require('connect-flash');
var cookieParser    = require('cookie-parser');
var passport        = require('passport');
var passportLocal   = require('passport-local');
var session         = require('express-session');
var speakeasy       = require('speakeasy');
var qr              = require('qr-image');
var configDB        = require('./config/database.js');
var Trade           = require('./models/trade');
var tradeEngine     = require('./engine/tradeengine');

// Database
var MongoOplog      = require('mongo-oplog');
var oplog           = MongoOplog(process.env.MONGO_OPLOG, process.env.MONGO_COLLECTION).tail();
var MongoStore      = require('connect-mongo')(session);
var mongoose        = require('mongoose');
var mongo           = require('mongoskin');

// Database Connections
var db = mongo.db(process.env.MONGO_DB, {native_parser:process.env.MONGO_DB_NATIVE_PARSER});
mongoose.connect(process.env.MONGO_DB);

/* Configure Speakeasy/One-Time-Password key and settings.  
   Initiate variable for secret key used to generate OTP.
*/
var speakeasy_secret = process.env.SPEAKEASY_SECRET;

// Configure Time OTP and use a custom 60 second refresh.
speakeasy.totp({key: speakeasy_secret, step: process.env.SPEAKEASY_STEP});
var generateOTP = speakeasy.generate_key({length: process.env.SPEAKEASY_LENGTH, google_auth_qr: process.env.SPEAKEASY_GOOGLE_AUTH_QR, symbols: process.env.SPEAKEASY_SYMBOLS, name: process.env.SPEAKEASY_APPNAME});

/* ---------------------------- END Configure Speakeasy/One-Time-Password key and settings.  */

// Set server port & environment
app.set('port', process.env.PORT || 3000);
app.set('env', process.env.ENV_VARIABLE || 'development');

// Include passport (login/auth system) config
require('./config/passport')(passport); // pass passport for configuration

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Enable favicon
app.use(favicon());

// Log activity to console
//app.use(logger('dev'));

// bodyParser settings
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

// Config Session/Cookies
app.use(cookieParser());
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'test123',
    store: new MongoStore({
      db : 'sessions'
    })
  }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req,res,next) { 
    res.header("X-powered-by", "Cannapay v1.0 | A SubCreative Design - 2014")
    res.locals.session = req.session;
    //process.env.DEBUG = true;
    if(process.env.DEBUG){
        res.redirect('http://cannapay.io')
    }
    req.db = db;
    next();
});

// Routes
var routes = require('./routes/index');
var users = require('./routes/users');
var user = require('./routes/user');
var invoices = require('./routes/invoices');
var login = require('./routes/login');
var resetpw = require('./routes/resetpw');
var rates = require('./routes/rates');
var trade = require('./routes/trade');
var api = require('./routes/api');

//Enable routes
app.use('/', routes);
app.use('/login', login);
app.use('/resetpw', resetpw);
app.use('/user', user);
app.use('/users', users);
app.use('/invoices', invoices);
app.use('/rates', rates);
app.use('/trade', trade);
app.use('/api', api);

/*
        MONGOOPLOG - CURRENTLY WORKING BUT DISABLED UNTIL FURTHER IMPLEMENTATIONS

var newTrade = new Trade();
oplog.on('op', function (data) {
  //console.log('op: ');
});

oplog.on('insert', function (doc) {
    
    //Pull best last price from each exchange and assign to variable.
    var lastPrice = 0.69696969;

    if(doc.o.type == 'Stop Loss'){
        if(doc.o.enabled == true){
            if(doc.o.target){

                db.collection('users').findById(doc.o.user_Id, function(err, result) {
                    var bittrexApiKey = result.apiKeys.bittrexApiKey;
                    var bittrexPrivateKey = result.apiKeys.bittrexPrivateKey;
                
                    console.log('User '+ result.local.email + ' placed a new stop loss target order @ '+doc.o.target);
                    
                    newTrade.sellLimit('bittrex', bittrexApiKey, bittrexPrivateKey, doc.o, function(sell){
                        console.log(sell)
                    });
    
                });   
            }
            if(doc.o.percent){
                console.log('percent: '+ lastPrice)
                //buyLimit(bittrex);
            }
        }

       // console.log(doc.o.type);
    }   
});

oplog.on('update', function (doc) {
    
    if(doc.o.type == 'Stop Loss'){
        if(doc.o.enabled == false){

            db.collection('users').findById(doc.o.user_Id, function(err, result) {
                
                var bittrexApiKey = result.apiKeys.bittrexApiKey;
                var bittrexPrivateKey = result.apiKeys.bittrexPrivateKey;
                
                db.collection('trades').find({_id: doc.o._id}, function(err, result) {
                    
                    newTrade.cancelOrder('bittrex', bittrexApiKey, bittrexPrivateKey, doc.o.uuid, function(sell){
                        if(sell.success == true){
                            console.log(sell);
                        }
                        if(sell.success == false){
                            console.log(sell);
                        }
                    });
                });

            });   
        }
    }
});

oplog.on('delete', function (doc) {
  console.log('delete: ' + doc.op);
});

oplog.on('error', function (error) {
  console.log('error: ' + error);
});

oplog.on('end', function () {
  console.log('Stream ended');
});

oplog.stop(function () {
  console.log('server stopped');
});
 */
/*
        END
        MONGOOPLOG 

 */

process.on('uncaughtException', function (exception) {
    console.log(exception);
})

/// error handlers
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
} 

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
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

var server = app.listen(app.get('port'), function() {
  console.log('CannaPay server listening on port ' + server.address().port);
});

var io = require('socket.io').listen(server);
var tradeIo = require('./engine/socket').trade(io);

module.exports = app;
