// HEADERS GENERATED @ http://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=YOURTEXTHERE
// SUBHEADER GENERATED @ http://patorjk.com/software/taag/#p=display&f=Bigfig&t=Test
// app/models/trade.js
// load the things we need
var mongoose            = require('mongoose');
var crypto              = require('crypto');
var request             = require('request');
var async               = require('async');

// Define the schema for our trade model
var tradeSchema         = mongoose.Schema({
    user_Id             : String,
    uuid                : String,
    enabled             : Boolean,
    completed           : Boolean,
    order               : String,
    market              : String,
    type                : String,
    exchange            : String,
    quantity            : Number,
    start               : Number,
    stop                : Number,
    spread              : Number,
    rate                : Number,
    timestamp           : Date,
    modifiedTimeStamp   : Date,
       
});
//////////////////////////////////////////////////////////
//
//  ██████╗ ██╗████████╗████████╗██████╗ ███████╗██╗  ██╗
//  ██╔══██╗██║╚══██╔══╝╚══██╔══╝██╔══██╗██╔════╝╚██╗██╔╝
//  ██████╔╝██║   ██║      ██║   ██████╔╝█████╗   ╚███╔╝ 
//  ██╔══██╗██║   ██║      ██║   ██╔══██╗██╔══╝   ██╔██╗ 
//  ██████╔╝██║   ██║      ██║   ██║  ██║███████╗██╔╝ ██╗
//  ╚═════╝ ╚═╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
//  v1.1 API Client/Mongoose Schema Library
//  created by. SubCreative (aka. Josh Dellay)                                                             
//
    //     __                           __    
    //    |__)     |_  | .  _      /\  |__) | 
    //    |    |_| |_) | | (_     /--\ |    | 
    //
    //--v
        // Get all market summaries @ Bittrex
        tradeSchema.methods.getMarketSummary = function (exchange, marketSummary) {
            if(!exchange){
                marketSummary({success: false, message: 'Exchange parameter is required'})
            }
            if(exchange.toLowerCase() != 'bittrex' && exchange.toLowerCase() !=  'swisscex'){
                marketSummary({success: false, message: 'The exchange you\'ve provided is not a valid exchange.'})
            }
            if(exchange.toLowerCase() == 'bittrex'){

                // Create HTTP Request to send to Bittrex
                request({
                    uri: 'https://bittrex.com/api/v1.1/public/getmarketsummaries',
                    method: "GET",
                    timeout: 10000,
                    followRedirect: false,
                    maxRedirects: 10
                }, function(error, response, body) {
                    
                    if(body){
                        body = JSON.parse(body);
                        marketSummary(body);
                    }
                    if(error){
                        console.log(error)
                    }
                        

                });   
            } 

            if(exchange.toLowerCase() == 'swisscex'){

                // Configure Swisscex API Keys
                var apiKey = req.user.apiKeys.swisscexApiKey;
                var privateKey = req.user.apiKeys.swisscexPrivateKey


                // Create Nonce using Unix Time Code
                var nonce = new Date().getTime();
                
                //API Route
                var apiMethod = 'account';
                var apiUrl = 'apiKey=' + apiKey + '&nonce=' + nonce;
                
                //HMAC 
                var hash = crypto.createHmac('sha256', privateKey).update(apiUrl).digest('hex');
                
                // Apend newly created HMAC hash to end of query string.
                var apiUrl = 'http://api.swisscex.com/v2/' + apiMethod + '?' + apiUrl + '&hash=' + hash;

                request({
                    uri: apiUrl,
                    method: "GET",
                    timeout: 10000,
                    followRedirect: false,
                    maxRedirects: 10
                    }, function(error, response, body) {
                        
                        body = JSON.parse(body);
                        balance(body)


                });  
            } 
        }

        // Get all market/order history @ Bittrex
        tradeSchema.methods.getMarketHistory = function (exchange, params, marketHistory) {
            if(!exchange){
                marketSummary({success: false, message: 'Exchange parameter is required'})
            }
            if(exchange.toLowerCase() != 'bittrex' && exchange.toLowerCase() !=  'swisscex'){
                marketSummary({success: false, message: 'The exchange you\'ve provided is not a valid exchange.'})
            }
            if(exchange.toLowerCase() == 'bittrex'){
                if(!params.count){
                    params.count = 50;
                }
                // Create HTTP Request to send to Bittrex
                request({
                    uri: 'https://bittrex.com/api/v1.1/public/getmarkethistory?market='+params.market+'&count='+params.count+'',
                    method: "GET",
                    timeout: 10000,
                    followRedirect: false,
                    maxRedirects: 10
                }, function(error, response, body) {
                    
                    if(body){
                        body = JSON.parse(body);
                        marketHistory(body);
                    }
                    if(error){
                        marketHistory(error)
                    }
                        

                });   
            } 

            if(exchange.toLowerCase() == 'swisscex'){

                // Configure Swisscex API Keys
                var apiKey = req.user.apiKeys.swisscexApiKey;
                var privateKey = req.user.apiKeys.swisscexPrivateKey


                // Create Nonce using Unix Time Code
                var nonce = new Date().getTime();
                
                //API Route
                var apiMethod = 'account';
                var apiUrl = 'apiKey=' + apiKey + '&nonce=' + nonce;
                
                //HMAC 
                var hash = crypto.createHmac('sha256', privateKey).update(apiUrl).digest('hex');
                
                // Apend newly created HMAC hash to end of query string.
                var apiUrl = 'http://api.swisscex.com/v2/' + apiMethod + '?' + apiUrl + '&hash=' + hash;

                request({
                    uri: apiUrl,
                    method: "GET",
                    timeout: 10000,
                    followRedirect: false,
                    maxRedirects: 10
                    }, function(error, response, body) {
                        
                        body = JSON.parse(body);
                        balance(body)


                });  
            } 
        }
    //     _                          _  _ ___
    //    |_) __ o     _ _|_ _       |_||_) | 
    //    |   |  | \_/(_| |_(/_      | ||  _|_
    // 
    //--v
        // Get balacne @ Bittrex
        tradeSchema.methods.getBalance = function (exchange, apiKey, privateKey, balance) {
            if(!exchange){
                balance({success: false, message: 'Exchange parameter is required'})
            }
            if(exchange.toLowerCase() != 'bittrex' && exchange.toLowerCase() !=  'swisscex'){
                balance({success: false, message: 'The exchange you\'ve provided is not a valid exchange.'})
            }
            if(exchange.toLowerCase() == 'bittrex'){
                
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
                    
                    if(body){
                        body = JSON.parse(body);
                        balance(body);
                    }
                    if(error){
                        console.log(error)
                    }
                        

                });   
            } 

            if(exchange.toLowerCase() == 'swisscex'){

                // Configure Swisscex API Keys
                var apiKey = req.user.apiKeys.swisscexApiKey;
                var privateKey = req.user.apiKeys.swisscexPrivateKey


                // Create Nonce using Unix Time Code
                var nonce = new Date().getTime();
                
                //API Route
                var apiMethod = 'account';
                var apiUrl = 'apiKey=' + apiKey + '&nonce=' + nonce;
                
                //HMAC 
                var hash = crypto.createHmac('sha256', privateKey).update(apiUrl).digest('hex');
                
                // Apend newly created HMAC hash to end of query string.
                var apiUrl = 'http://api.swisscex.com/v2/' + apiMethod + '?' + apiUrl + '&hash=' + hash;

                request({
                    uri: apiUrl,
                    method: "GET",
                    timeout: 10000,
                    followRedirect: false,
                    maxRedirects: 10
                    }, function(error, response, body) {
                        
                        body = JSON.parse(body);
                        balance(body)


                });  
            } 
            return 'zinga';
        }

        //Standard Buy Order (Currently disabled by Bittrex)
        tradeSchema.methods.buyMarket = function(exchange, apiKey, privateKey, params, buy){
            if(exchange.toLowerCase() != 'bittrex' && exchange.toLowerCase() !=  'swisscex'){
                buy({success: false, message: 'The exchange you\'ve provided is not a valid exchange.'})
            }

            if(!params.market){
                response = {
                    success: false,
                    message: 'Market parameter required.'
                }
                buy({succes: false, message: 'test'});
            }
            if(!params.quantity){
                response = {
                    success: false,
                    message: 'Quantity parameter required.'
                }
                buy(response);
            }
            if(!params.rate){
                response = {
                    success: false,
                    message: 'Rate parameter required. (eg. 0.00002500)'
                }
                buy(response);
            }
            if(exchange.toLowerCase() == 'bittrex'){

                // Create Nonce using Unix Time Code
                var nonce = (Date.now()/1000).toFixed(0);

                //HMAC 
                var apiPath = 'market/buymarket';
                var apiParams = '&market=' + params.market + '&quantity=' + params.quantity + '&rate=' + params.rate;
                var apiUrl = 'https://bittrex.com/api/v1.1/' + apiPath + '?apikey=' + apiKey + '&nonce=' + nonce + apiParams;

                //HMAC Hash output
                var hash = crypto.createHmac('sha512', privateKey).update(apiUrl).digest('hex');

                // Create HTTP Request to send to Bittrex
                request({
                    uri: apiUrl,
                    method: "GET",
                    timeout: 10000,
                    followRedirect: false,
                    maxRedirects: 10
                }, function(error, response, body) {
                    
                        if(error){
                            body = JSON.parse(error);
                            buy(error)
                        }
                        body = JSON.parse(body);

                        buy(body)

                });   
            } 

            if(exchange.toLowerCase() == 'swisscex'){

                // Configure Swisscex API Keys
                var apiKey = req.user.apiKeys.swisscexApiKey;
                var privateKey = req.user.apiKeys.swisscexPrivateKey


                // Create Nonce using Unix Time Code
                var nonce = new Date().getTime();
                
                //API Route
                var apiMethod = 'account';
                var apiUrl = 'apiKey=' + apiKey + '&nonce=' + nonce;
                
                //HMAC 
                var hash = crypto.createHmac('sha256', privateKey).update(apiUrl).digest('hex');
                
                // Apend newly created HMAC hash to end of query string.
                var apiUrl = 'http://api.swisscex.com/v2/' + apiMethod + '?' + apiUrl + '&hash=' + hash;

                request({
                    uri: apiUrl,
                    method: "GET",
                    timeout: 10000,
                    followRedirect: false,
                    maxRedirects: 10
                    }, function(error, response, body) {
                        if(error){
                            sell({success: false, message: 'Bittrex API failed'})
                        }
                        body = JSON.parse(body);
                        balance(body)


                });  
            } 
        }

        //Regular Sell Order (Disabled Currently by Bittrex)
        tradeSchema.methods.sellMarket = function(exchange, apiKey, privateKey, params, sell){
            if(exchange.toLowerCase() != 'bittrex' && exchange.toLowerCase() !=  'swisscex'){
                sell({success: false, message: 'The exchange you\'ve provided is not a valid exchange.'})
            }

            if(!params.market){
                response = {
                    success: false,
                    message: 'Market parameter required.'
                }
                sell({succes: false, message: 'test'});
            }
            if(!params.quantity){
                response = {
                    success: false,
                    message: 'Quantity parameter required.'
                }
                sell(response);
            }
            if(!params.rate){
                response = {
                    success: false,
                    message: 'Rate parameter required. (eg. 0.00002500)'
                }
                sell(response);
            }
            if(exchange.toLowerCase() == 'bittrex'){

                // Create Nonce using Unix Time Code
                var nonce = (Date.now()/1000).toFixed(0);

                //HMAC 
                var apiPath = 'market/sellmarket';
                var apiParams = '&market=' + params.market + '&quantity=' + params.quantity + '&rate=' + params.rate;
                var apiUrl = 'https://bittrex.com/api/v1.1/' + apiPath + '?apikey=' + apiKey + '&nonce=' + nonce + apiParams;

                //HMAC Hash output
                var hash = crypto.createHmac('sha512', privateKey).update(apiUrl).digest('hex');

                // Create HTTP Request to send to Bittrex
                request({
                    uri: apiUrl,
                    method: "GET",
                    timeout: 10000,
                    followRedirect: false,
                    maxRedirects: 10
                }, function(error, response, body) {
                    
                        if(error){
                            body = JSON.parse(error);
                            sell(error)
                        }
                        body = JSON.parse(body);

                        sell(body)

                });   
            } 

            if(exchange.toLowerCase() == 'swisscex'){

                // Configure Swisscex API Keys
                var apiKey = req.user.apiKeys.swisscexApiKey;
                var privateKey = req.user.apiKeys.swisscexPrivateKey


                // Create Nonce using Unix Time Code
                var nonce = new Date().getTime();
                
                //API Route
                var apiMethod = 'account';
                var apiUrl = 'apiKey=' + apiKey + '&nonce=' + nonce;
                
                //HMAC 
                var hash = crypto.createHmac('sha256', privateKey).update(apiUrl).digest('hex');
                
                // Apend newly created HMAC hash to end of query string.
                var apiUrl = 'http://api.swisscex.com/v2/' + apiMethod + '?' + apiUrl + '&hash=' + hash;

                request({
                    uri: apiUrl,
                    method: "GET",
                    timeout: 10000,
                    followRedirect: false,
                    maxRedirects: 10
                    }, function(error, response, body) {
                        if(error){
                            sell({success: false, message: 'Bittrex API failed'})
                        }
                        body = JSON.parse(body);
                        balance(body)


                });  
            } 
        }

        // buyLimit order @ Bittrex
        tradeSchema.methods.buyLimit = function(exchange, apiKey, privateKey, tradeData, buy, result){
            if(!exchange){
                buy({success: false, message: 'Exchange parameter is required'})
            }
            if(exchange.toLowerCase() != 'bittrex' && exchange.toLowerCase() !=  'swisscex'){
                buy({success: false, message: 'The exchange you\'ve provided is not a valid exchange.'})
            }
            if(exchange.toLowerCase() == 'bittrex'){

                // Create Nonce using Unix Time Code
                var nonce = (Date.now()/1000).toFixed(0);

                //HMAC 
                var apiPath = 'market/buylimit';
                var apiParams = '&market=' +tradeData.market + '&quantity=' + tradeData.quantity + '&rate=' + tradeData.rate;
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
                        buy(body)

                });   
            } 

            if(exchange.toLowerCase() == 'swisscex'){

                // Configure Swisscex API Keys
                var apiKey = req.user.apiKeys.swisscexApiKey;
                var privateKey = req.user.apiKeys.swisscexPrivateKey


                // Create Nonce using Unix Time Code
                var nonce = new Date().getTime();
                
                //API Route
                var apiMethod = 'account';
                var apiUrl = 'apiKey=' + apiKey + '&nonce=' + nonce;
                
                //HMAC 
                var hash = crypto.createHmac('sha256', privateKey).update(apiUrl).digest('hex');
                
                // Apend newly created HMAC hash to end of query string.
                var apiUrl = 'http://api.swisscex.com/v2/' + apiMethod + '?' + apiUrl + '&hash=' + hash;

                request({
                    uri: apiUrl,
                    method: "GET",
                    timeout: 10000,
                    followRedirect: false,
                    maxRedirects: 10
                    }, function(error, response, body) {
                        
                        body = JSON.parse(body);
                        buy(body)


                });  
            } 
        }

        // sellLimit order @ Bittrex
        tradeSchema.methods.sellLimit = function(exchange, apiKey, privateKey, tradeData, sell){
            if(!exchange){
                sell({success: false, message: 'Exchange parameter is required'})
            }
            if(exchange.toLowerCase() != 'bittrex' && exchange.toLowerCase() !=  'swisscex'){
                sell({success: false, message: 'The exchange you\'ve provided is not a valid exchange.'})
            }
            if(exchange.toLowerCase() == 'bittrex'){

            

                // Create Nonce using Unix Time Code
                var nonce = (Date.now()/1000).toFixed(0);

                //HMAC 
                var apiPath = 'market/selllimit';
                var apiParams = '&market=' +tradeData.market + '&quantity=' + tradeData.quantity + '&rate=' + tradeData.rate;
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
                        sell(body)

                });   
            } 

            if(exchange.toLowerCase() == 'swisscex'){

                // Configure Swisscex API Keys
                var apiKey = req.user.apiKeys.swisscexApiKey;
                var privateKey = req.user.apiKeys.swisscexPrivateKey


                // Create Nonce using Unix Time Code
                var nonce = new Date().getTime();
                
                //API Route
                var apiMethod = 'account';
                var apiUrl = 'apiKey=' + apiKey + '&nonce=' + nonce;
                
                //HMAC 
                var hash = crypto.createHmac('sha256', privateKey).update(apiUrl).digest('hex');
                
                // Apend newly created HMAC hash to end of query string.
                var apiUrl = 'http://api.swisscex.com/v2/' + apiMethod + '?' + apiUrl + '&hash=' + hash;

                request({
                    uri: apiUrl,
                    method: "GET",
                    timeout: 10000,
                    followRedirect: false,
                    maxRedirects: 10
                    }, function(error, response, body) {
                        
                        body = JSON.parse(body);
                        sell(body)


                });  
            } 
        }

        // cancel order @ Bittrex
        tradeSchema.methods.cancelOrder = function(exchange, apiKey, privateKey, params, cancel){
            
            if(!exchange){
                cancel({success: false, message: 'Exchange parameter is required'})
            }
            if(exchange.toLowerCase() != 'bittrex' && exchange.toLowerCase() !=  'swisscex'){
                cancel({success: false, message: 'The exchange you\'ve provided is not a valid exchange.'})
            }
            if(exchange.toLowerCase() == 'bittrex'){

                // Create Nonce using Unix Time Code
                var nonce = (Date.now()/1000).toFixed(0);

                //HMAC 
                var apiPath = 'market/cancel';
                var apiParams = '&UUID=' + params.uuid;
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
                        cancel(body)

                });   
            } 

            if(exchange.toLowerCase() == 'swisscex'){

                // Create Nonce using Unix Time Code
                var nonce = new Date().getTime();
                
                //API Route
                var apiMethod = 'account';
                var apiUrl = 'apiKey=' + apiKey + '&nonce=' + nonce;
                
                //HMAC 
                var hash = crypto.createHmac('sha256', privateKey).update(apiUrl).digest('hex');
                
                // Apend newly created HMAC hash to end of query string.
                var apiUrl = 'http://api.swisscex.com/v2/' + apiMethod + '?' + apiUrl + '&hash=' + hash;

                request({
                    uri: apiUrl,
                    method: "GET",
                    timeout: 10000,
                    followRedirect: false,
                    maxRedirects: 10
                    }, function(error, response, body) {
                        
                        body = JSON.parse(body);
                        sell(body)


                });  
            } 
        }

        // get order by UUID @ Bittrex
        tradeSchema.methods.getOrder = function(exchange, apiKey, privateKey, order){
            if(!exchange){
                order({success: false, message: 'Exchange parameter is required'})
            }
            if(exchange.toLowerCase() != 'bittrex' && exchange.toLowerCase() !=  'swisscex'){
                order({success: false, message: 'The exchange you\'ve provided is not a valid exchange.'})
            }
            if(exchange.toLowerCase() == 'bittrex'){

                // Configure Bittrex API Keys
                var apiKey = req.user.apiKeys.bittrexApiKey;
                var privateKey = req.user.apiKeys.bittrexPrivateKey;

                // Create Nonce using Unix Time Code
                var nonce = (Date.now()/1000).toFixed(0);

                //HMAC 
                var apiPath = 'account/getorder';
                var apiParams = '&uuid=' + req.body.uuid;
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
                        order(body)

                });   
            } 

            if(exchange.toLowerCase() == 'swisscex'){

                // Configure Swisscex API Keys
                var apiKey = req.user.apiKeys.swisscexApiKey;
                var privateKey = req.user.apiKeys.swisscexPrivateKey


                // Create Nonce using Unix Time Code
                var nonce = new Date().getTime();
                
                //API Route
                var apiMethod = 'account';
                var apiUrl = 'apiKey=' + apiKey + '&nonce=' + nonce;
                
                //HMAC 
                var hash = crypto.createHmac('sha256', privateKey).update(apiUrl).digest('hex');
                
                // Apend newly created HMAC hash to end of query string.
                var apiUrl = 'http://api.swisscex.com/v2/' + apiMethod + '?' + apiUrl + '&hash=' + hash;

                request({
                    uri: apiUrl,
                    method: "GET",
                    timeout: 10000,
                    followRedirect: false,
                    maxRedirects: 10
                    }, function(error, response, body) {
                        
                        body = JSON.parse(body);
                        sell(body)


                });  
            } 
        }

        // get order history @ Bittrex
        tradeSchema.methods.getOrderHistory = function(exchange, apiKey, privateKey, params, orderHistory){
            if(!exchange){
                orderHistory({success: false, message: 'Exchange parameter is required'})
            }
            if(exchange.toLowerCase() != 'bittrex' && exchange.toLowerCase() !=  'swisscex'){
                orderHistory({success: false, message: 'The exchange you\'ve provided is not a valid exchange.'})
            }
            if(exchange.toLowerCase() == 'bittrex'){
                if(!params.count){
                    params.count = 50;
                }
                // Create Nonce using Unix Time Code
                var nonce = (Date.now()/1000).toFixed(0);

                //HMAC 
                var apiPath = 'account/getorderhistory';
                var apiParams = '&market=' + params.market + '&count=' + params.count;
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
                        orderHistory(body)

                });   
            } 

            if(exchange.toLowerCase() == 'swisscex'){

                // Create Nonce using Unix Time Code
                var nonce = new Date().getTime();
                
                //API Route
                var apiMethod = 'account';
                var apiUrl = 'apiKey=' + apiKey + '&nonce=' + nonce;
                
                //HMAC 
                var hash = crypto.createHmac('sha256', privateKey).update(apiUrl).digest('hex');
                
                // Apend newly created HMAC hash to end of query string.
                var apiUrl = 'http://api.swisscex.com/v2/' + apiMethod + '?' + apiUrl + '&hash=' + hash;

                request({
                    uri: apiUrl,
                    method: "GET",
                    timeout: 10000,
                    followRedirect: false,
                    maxRedirects: 10
                    }, function(error, response, body) {
                        
                        body = JSON.parse(body);
                        orderHistory(body)


                });  
            } 
        }

        // get open orders @ Bittrex
        tradeSchema.methods.getOpenOrders = function(exchange, apiKey, privateKey, params, openOrders){
            
            if(exchange.toLowerCase() == 'bittrex'){
                
                // Create Nonce using Unix Time Code
                var nonce = (Date.now()/1000).toFixed(0);

                //HMAC 
                var apiPath = 'market/getopenorders';
                
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
                    if(error){
                        openOrders(JSON.parse(error));
                    }
                    if(body){
                        openOrders(JSON.parse(body));
                    }
                });   
            } 

            if(exchange.toLowerCase() == 'swisscex'){

                
                // Create Nonce using Unix Time Code
                var nonce = new Date().getTime();
                
                //API Route
                var apiMethod = 'account';
                var apiUrl = 'apiKey=' + apiKey + '&nonce=' + nonce;
                
                //HMAC 
                var hash = crypto.createHmac('sha256', privateKey).update(apiUrl).digest('hex');
                
                // Apend newly created HMAC hash to end of query string.
                var apiUrl = 'http://api.swisscex.com/v2/' + apiMethod + '?' + apiUrl + '&hash=' + hash;

                request({
                    uri: apiUrl,
                    method: "GET",
                    timeout: 10000,
                    followRedirect: false,
                    maxRedirects: 10
                    }, function(error, response, body) {
                        
                        body = JSON.parse(body);
                        sell(body)


                });  
            } 
        }

        // get order book for specific market @ Bittrex
        tradeSchema.methods.getOrderBook = function(exchange, apiKey, privateKey, params, orderBook){
            if(!exchange){
                orderBook({success: false, message: 'Exchange parameter is required'})
            }
            if(exchange.toLowerCase() != 'bittrex' && exchange.toLowerCase() !=  'swisscex'){
                orderBook({success: false, message: 'The exchange you\'ve provided is not a valid exchange.'})
            }
            if(!params.market){
                orderBook({success: false, message: 'Market parameter required'})
            }
            if(!params.type){
                params.type = 'both';
            }
            if(exchange.toLowerCase() == 'bittrex'){
                
                // Create Nonce using Unix Time Code
                var nonce = (Date.now()/1000).toFixed(0);

                //HMAC 
                var apiPath = 'public/getorderbook';
                var apiParams = '?market=' + params.market + '&type=' + params.type;
                if(!params.depth){
                    apiParams += '&depth=20' + params.depth 
                }
                var apiUrl = 'https://bittrex.com/api/v1.1/' + apiPath + apiParams;

                // Create HTTP Request to send to Bittrex
                request({
                    uri: apiUrl,
                    method: "GET",
                    timeout: 10000,
                    followRedirect: false,
                    maxRedirects: 10
                }, function(error, response, body) {
                    if(error){
                        orderBook(JSON.parse(error));
                    }
                    if(body){
                        orderBook(JSON.parse(body));
                    }
                    

                });   
            } 

            if(exchange.toLowerCase() == 'swisscex'){

                
                // Create Nonce using Unix Time Code
                var nonce = new Date().getTime();
                
                //API Route
                var apiMethod = 'account';
                var apiUrl = 'apiKey=' + apiKey + '&nonce=' + nonce;
                
                //HMAC 
                var hash = crypto.createHmac('sha256', privateKey).update(apiUrl).digest('hex');
                
                // Apend newly created HMAC hash to end of query string.
                var apiUrl = 'http://api.swisscex.com/v2/' + apiMethod + '?' + apiUrl + '&hash=' + hash;

                request({
                    uri: apiUrl,
                    method: "GET",
                    timeout: 10000,
                    followRedirect: false,
                    maxRedirects: 10
                    }, function(error, response, body) {
                        
                        body = JSON.parse(body);
                        sell(body)


                });  
            } 
        }
    //     __                     _  _ ___
    //    /      _ _|_ _ __      |_||_) | 
    //    \__|_|_>  |_(_)|||     | ||  _|_
    // 
    //--v
        // buyLimit order @ Bittrex (Req Parameters: exchange, market, quantity, start, stop)
        tradeSchema.methods.buyLadder = function(exchange, apiKey, privateKey, tradeData, buyLadder){
            
            if(exchange == 'bittrex'){
                
                var quantity = parseFloat(tradeData.quantity);
                var start = parseFloat(tradeData.startPrice);   
                var stop = parseFloat(tradeData.stopPrice);
                var spread = parseFloat(tradeData.spread);
                var tradeNum = Math.floor((stop-start)/spread);

                if(tradeNum >= 75){
                    var response = {
                        success: false,
                        message: 'Max number of allowed trades is 75.'
                    }
                    buyLadder(response);
                }
            
                //Define execution function
                function execute(callback){
                    var reqLoopI = 0;
                    var result = []; 

                    //Define reqLoop function
                    function reqLoop(){
                        if (reqLoopI <= tradeNum){

                            // Create Nonce using Unix Time Code
                            var nonce = (Date.now()/1000).toFixed(0);

                            //HMAC 
                            var apiPath = 'market/buylimit';
                            var apiParams = '&market=' +tradeData.market + '&quantity=' + quantity/tradeNum + '&rate=' + (start+(spread*reqLoopI)).toFixed(8);
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
                                }, 
                                function(error, response, body) {
                                    if(error){ 
                                        buyLadder(JSON.parse(error));
                                    } 
                                    if(body){
                                        body = JSON.parse(body);
                                        
                                        // Push results of request to results array
                                        result.push(body);

                                        reqLoopI++; // Increment Loop Counter
                                        reqLoop();  // Restart loop
                                    }
                                }
                            );
                        } else{
                            // Return results of combined trades to main execution
                            callback(result);
                        }
                    }
                    reqLoop();  // Start request loop
                }
                // Start execution of buyLadder requests
                execute(function(callback){
                    error = 0;
                    errorMsg = [];
                    errorLoopTicker = 0;
                    for(var i=0; i <= callback.length; i++){
                        
                        if(callback[i] != undefined){
                            if(callback[i].success == false){
                                error++
                                errorMsg.push(callback[i].message);
                            }

                            if(error == callback.length){
                                var response = {
                                    success: false,
                                    message: errorMsg
                                }
                                // Return requests result back to trade.Schema.method
                                buyLadder(response);
                            } 

                        }

                        if(errorLoopTicker == callback.length && error != callback.length){
                            console.log('errors: ' + error + ' length:' +callback.length  )
                            var response = {
                                success: true,
                                result: callback
                            } 

                            // Return requests result back to trade.Schema.method
                            buyLadder(response);
                            console.log(response)
                        }
                        errorLoopTicker++
                    }
                });
            }
        }
        
        // sellLimit order @ Bittrex (Req Parameters: exchange, market, quantity, start, stop)
        tradeSchema.methods.sellLadder = function(exchange, apiKey, privateKey, tradeData, sellLadder){
            
            if(exchange == 'bittrex'){
                
                var quantity = parseFloat(tradeData.quantity);
                console.log(quantity)
                var start = parseFloat(tradeData.startPrice);   
                var stop = parseFloat(tradeData.stopPrice);
                var spread = parseFloat(tradeData.spread);
                var tradeNum = Math.floor((stop-start)/spread);
                 

            
                //Define execution function
                function execute(callback){
                    var reqLoopI = 0;
                    var result = []; 

                    //Define reqLoop function
                    function reqLoop(){
                        if (reqLoopI <= tradeNum){

                            // Create Nonce using Unix Time Code
                            var nonce = (Date.now()/1000).toFixed(0);

                            //HMAC 
                            var apiPath = 'market/selllimit';
                            var apiParams = '&market=' +tradeData.market + '&quantity=' + quantity/tradeNum + '&rate=' + (start+(spread*reqLoopI)).toFixed(8);
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
                                }, 
                                function(error, response, body) {
                                    if(error){ orderBook(JSON.parse(error));
                                    }
                                    body = JSON.parse(body);
                                    
                                    // Push results of request to results array
                                    result.push(body);

                                    reqLoopI++; // Increment Loop Counter
                                    reqLoop();  // Restart loop
                                }
                            );
                        } else{

                            // Return results of combined trades to main execution
                            callback(result);
                       
                        }
                    }


                    reqLoop();  // Start request loop
                 
                }

                // Start execution of sellLadder requests
                execute(function(callback){
                    error = 0;
                    errorMsg = [];
                    errorLoopTicker = 0;
                    for(var i=0; i <= callback.length; i++){
                        
                        if(callback[i] != undefined){
                            if(callback[i].success == false){
                                error++
                                errorMsg.push(callback[i].message);
                            }

                            if(error == callback.length){
                                var response = {
                                    success: false,
                                    message: errorMsg
                                }
                                // Return requests result back to trade.Schema.method
                                sellLadder(response);
                            } 

                        }

                        if(errorLoopTicker == callback.length && error != callback.length){
                            console.log('errors: ' + error + ' length:' +callback.length  )
                            var response = {
                                success: true,
                                result: callback
                            } 

                            // Return requests result back to trade.Schema.method
                            sellLadder(response);
                            console.log(response)
                        }
                        errorLoopTicker++
                    }
                });
            }
        }
    
// create the model for trade and expose it to our app
module.exports = mongoose.model('Trade', tradeSchema);
