var express         = require('express');
var router          = express.Router();
var request         = require('request');
var mongoose        = require('mongoose');
var crypto          = require('crypto');
var Trade           = require('../models/trade');
var newTrade        = new Trade();
var swisscex        = require('../libs/swisscex');

//GET ORDER HISTORY (Required: exchange, market.  Optional pareters: count (default 25))
router.get('/orderhistory', function(req, res){
    if(!req.query.exchange){
        var response = {
            success: false,
            message: 'Exchange parameter required!'
        }
        res.send(response);
    }
    if(!req.query.count){
        req.query.count = 25;
    }
    if(req.query.count && req.query.exchange){
        newTrade.getOrderHistory(req.query.exchange, req.user.apiKeys.bittrexApiKey, req.user.apiKeys.bittrexPrivateKey, req.query, function(orderHistory){
            res.json(orderHistory)
        });
    }
});

//GET OPEN ORDERS (Required: exchange, market.  Optional pareters: count (default 25))
router.get('/openorders', function(req, res){
    if(!req.query.exchange){
        var response = {
            success: false,
            message: 'Exchange parameter required!'
        }
        res.send(response);
    }
    if(req.query.exchange){
        newTrade.getOpenOrders(req.query.exchange, req.user.apiKeys.bittrexApiKey, req.user.apiKeys.bittrexPrivateKey, req.query, function(openOrders){
            res.json(openOrders);
        });
    }
});

//CREATE NEW BUY LIMIT ORDER (Required: exchange, enabled(t/f), percent/target, currency, amount)
router.get('/buylimit', function(req, res) {
    var db = req.db;
    var user = req.user._id;

    // Create/Enable New Stop Loss 
    if(req.query.enabled == 'true') {
        if(!req.query.type){
            response = {
                success: false,
                message: 'Type parameter required, Target price or Stop Loss percentage. (eg. type=target, type=percent)'
            }
            res.send(response);
        }
        if(!req.query.market){
            response = {
                success: false,
                message: 'Market parameter required.'
            }
            res.send(response);
        }
        if(!req.query.rate){
            response = {
                success: false,
                message: 'Rate parameter required. (eg. 0.00002500)'
            }
            res.send(response);
        }
        if(!req.query.quantity){
            response = {
                success: false,
                message: 'Quantity parameter required.'
            }
            res.send(response);
        }

        var startAskPrice = '';

        // Create new document for target stop loss
        if(req.query.type == 'target'){
            newTrade.buyLimit('bittrex', req.user.apiKeys.bittrexApiKey, req.user.apiKeys.bittrexPrivateKey, req.query, function(buy){
                
                if(buy.success == true) {

                    // Insert Trade if all validation successful
                    db.collection('trades').insert({user_Id: user, type: 'buyLimit', exchange: req.query.exchange, enabled: req.query.enabled, completed: false, market: req.query.market, quantity: req.query.quantity, tradeType: req.query.type, rate: req.query.rate, uuid: buy.result.uuid, timestamp: Date.now(), modifiedTimeStamp: Date.now()}, function(err, result) {
                        if(err){
                            var response = {
                                success: false,
                                message: err
                            }
                            res.send(response);
                        }
                        
                        if(result !== ''){
                            var response = {
                                success: true,
                                message: 'New buyLimit added at a target point of '+req.query.rate+' '+req.query.market+'!'
                            }
                            res.send(response);
                        } 
                    });
                }
                if(buy.success == false){
                    res.send(buy); 
                }
            });
        }
        
        // Create new document for percentage stop loss
        if(req.query.type == 'percent'){
            newTrade.buyLimit('bittrex', req.user.apiKeys.bittrexApiKey, req.user.apiKeys.bittrexPrivateKey, req.query, function(buy){
                if(buy.success == true) {
                    // Insert Trade if all validation successful
                    db.collection('trades').insert({user_Id: user, type: 'buyLimit', exchange: req.query.exchange, enabled: req.query.enabled, currency: req.query.currency, quantity: req.query.quantity, tradeType: req.query.type, rate: req.query.rate, uuid: buy.result.uuid, timestamp: Date.now(), modifiedTimeStamp: Date.now()}, function(err, result) {
                        if(err){
                            var response = {
                                success: failed,
                                message: err
                            }
                            res.send(response);
                        }
                   
                        if(result !== ''){
                            var response = {
                                success: true,
                                message: 'New Stop Loss added at -'+req.query.rate+'% for '+req.query.market+'!'
                            }
                            res.send(response);
                        } 
                    }); 
                }
                if(buy.success == false){
                    res.send(buy); 
                }
            });
        }
    }
    // Disable Stop Loss 
    else if(req.query.enabled == 'false') {
        if(req.query.tradeId){
            // Insert Trade if all validation successful
            Trade.update({"_id": req.query.tradeId, user_Id: user}, { $set: { enabled: req.query.enabled, modifiedTimeStamp: Date.now() } }, function(err, result){
                if(err){
                    res.send(err)
                }

                response = {
                    success: true,
                    message: req.query.tradeId+' disabled'
                }

                res.send(response)
            }); 
        } 
        else{
            response = {
                success: false,
                message: 'tradeId required'
            }
            
            res.send(response);
        }  
    } 
    // Update Stop Loss 
    else if(req.query.update == 'true') {
        if(req.query.tradeId){

            // Insert Trade if all validation successful
            Trade.update({"_id": req.query.tradeId, user_Id: user}, { $set: { enabled: req.query.update, modifiedTimeStamp: Date.now() } }, function(err, result){
                    
                if(err){ res.send(err) }

                response = { success: true, message: req.query.tradeId+' updated' };
                res.send(response);

            }); 
            
        } 
        else{
        
            response = { success: false, message: 'tradeId required' }
            res.send(response);
        }
    } 
    else{
        response = { success: false, message: 'Enabled (true/false) or Update parameter required.' }
        res.send(response);
    }
});

//CREATE NEW SELL LIMIT ORDER (Required: exchange, enabled(t/f), percent/target, currency, amount)
router.get('/selllimit', function(req, res) {
    var db = req.db;
    var user = req.user._id;

    // Create/Enable New Stop Loss 
    if(req.query.enabled == 'true') {
        if(!req.query.type){
            response = {
                success: false,
                message: 'Type parameter required, Target price or Stop Loss percentage. (eg. type=target, type=percent)'
            }
            res.send(response);
        }
        if(!req.query.market){
            response = {
                success: false,
                message: 'Market parameter required.'
            }
            res.send(response);
        }
        if(!req.query.rate){
            response = {
                success: false,
                message: 'Rate parameter required. (eg. 0.00002500)'
            }
            res.send(response);
        }
        if(!req.query.quantity){
            response = {
                success: false,
                message: 'Quantity parameter required.'
            }
            res.send(response);
        }

        var startAskPrice = '';

        // Create new document for target stop loss
        if(req.query.type == 'target'){
            newTrade.sellLimit('bittrex', req.user.apiKeys.bittrexApiKey, req.user.apiKeys.bittrexPrivateKey, req.query, function(sell){
                if(sell.success == true) {
                    // Insert Trade if all validation successful
                    db.collection('trades').insert({user_Id: user, type: 'sellLimit', exchange: req.query.exchange, enabled: req.query.enabled, completed: false, market: req.query.market, quantity: req.query.quantity, tradeType: req.query.type, rate: req.query.rate, uuid: sell.result.uuid, timestamp: Date.now(), modifiedTimeStamp: Date.now()}, function(err, result) {
                        if(err){
                            var response = {
                                success: failed,
                                message: err
                            }
                            res.send(response);
                        }
                
                        if(result !== ''){
                            var response = {
                                success: true,
                                message: 'New sellLimit added at a target point of '+req.query.rate+' '+req.query.market+'!'
                            }
                            res.send(response);
                        } 
                    });
                }
                if(sell.success == false){
                    res.send(sell); 
                }
            });
        }
        // Create new document for percentage stop loss
        if(req.query.type == 'percent'){

            newTrade.sellLimit('bittrex', req.user.apiKeys.bittrexApiKey, req.user.apiKeys.bittrexPrivateKey, req.query, function(sell){
                if(sell.success == true) {
                    // Insert Trade if all validation successful

                    db.collection('trades').insert({user_Id: user, type: 'sellLimit', exchange: req.query.exchange, enabled: req.query.enabled, currency: req.query.currency, quantity: req.query.quantity, tradeType: req.query.type, rate: req.query.rate, uuid: sell.result.uuid, timestamp: Date.now(), modifiedTimeStamp: Date.now()}, function(err, result) {

                        if(err){
                            var response = {
                                success: failed,
                                message: err
                            }
                            res.send(response);
                        }
                   
                        if(result !== ''){
                            var response = {
                                success: true,
                                message: 'New Stop Loss added at -'+req.query.rate+'% for '+req.query.market+'!'
                            }
                            res.send(response);
                        } 

                    }); 
                }
                if(sell.success == false){
                    res.send(sell); 
                }
            });
        }
    }
    // Disable Stop Loss 
    else if(req.query.enabled == 'false') {
        if(req.query.tradeId){
            // Insert Trade if all validation successful
            Trade.update({"_id": req.query.tradeId, user_Id: user}, { $set: { enabled: req.query.enabled, modifiedTimeStamp: Date.now() } }, function(err, result){
                if(err){
                    res.send(err)
                }

                response = {
                    success: true,
                    message: req.query.tradeId+' disabled'
                }

                res.send(response)
            }); 
            
        } 
        else{
            response = {
                success: false,
                message: 'tradeId required'
            }
            
            res.send(response);
        }  
    } 

    // Update Stop Loss 
    else if(req.query.update == 'true') {
        if(req.query.tradeId){
            // Insert Trade if all validation successful
            Trade.update({"_id": req.query.tradeId, user_Id: user}, { $set: { enabled: req.query.update, modifiedTimeStamp: Date.now() } }, function(err, result){
                if(err){ res.send(err) }

                response = { success: true, message: req.query.tradeId+' updated' };
                res.send(response);
            }); 
        } 
        else{
        
            response = { success: false, message: 'tradeId required' }
            res.send(response);
        }
    } 

    else{
        response = { success: false, message: 'Enabled (true/false) or Update parameter required.' }
        res.send(response);
    }
});

//PLACE BUY ORDER 
router.get('/buy', function(req, res){
    var db = req.db;
    if(!req.query.exchange){
        var response = {
            success: false,
            message: 'Exchange parameter required!'
        }
        res.send(response);
    }
    
    if(req.query.exchange == 'bittrex'){

        newTrade.buyMarket('bittrex', req.user.apiKeys.bittrexApiKey, req.user.apiKeys.bittrexPrivateKey, req.query, function(buy){
        
            if(buy.success == true) {

                // Insert Trade if all validation successful
                db.collection('trades').insert({user_Id: user, type: 'marketBuy', exchange: req.query.exchange, enabled: true, completed: false, market: req.query.market, quantity: req.query.quantity, rate: req.query.rate, uuid: sell.result.uuid, timestamp: Date.now(), modifiedTimeStamp: Date.now()}, function(err, result) {
                    if(err){
                        var response = {
                            success: failed,
                            message: err
                        }
                        res.send(response);
                    }
                    
                    if(result !== ''){
                        var response = {
                            success: true,
                            message: 'New '+req.query.exchange+' '+req.query.market+' order placed at '+req.query.rate+' for '+req.query.quantity+' coin(s)!'
                        }
                        res.send(response);
                    } 
                });
            }
            if(buy.success == false){
                res.send(buy); 
            }
        });
    }
    if(req.query.exchange == 'swisscex'){
        var payload = {
            
            symbol: req.query.symbol,
            side: 'BUY',
            qty: req.query.qty,
            price: req.query.price,
            
        }

        console.log(payload)
        swisscex('POST', 'order/new', payload, function(order){
            console.log(order)
            res.send(order)
        })
    }   
});

//PLACE SELL ORDER
router.get('/sell', function(req, res){
    var db = req.db;

    if(req.query.exchange.toLowerCase() == 'bittrex'){
        newTrade.sellMarket('bittrex', req.user.apiKeys.bittrexApiKey, req.user.apiKeys.bittrexPrivateKey, req.query, function(sell){
            if(sell.success == true) {
                // Insert Trade if all validation successful
                db.collection('trades').insert({user_Id: user, type: 'marketSell', exchange: req.query.exchange, enabled: 'true', completed: false, market: req.query.market, quantity: req.query.quantity, rate: req.query.rate, uuid: sell.result.uuid, timestamp: Date.now(), modifiedTimeStamp: Date.now()}, function(err, result) {
                    if(err){
                        var response = {
                            success: false,
                            message: err
                        }
                        res.send(response);
                    }
            
                    if(result !== ''){
                        var response = {
                            success: true,
                            message: 'New '+req.query.exchange+' '+req.query.market+' order placed at '+req.query.rate+' for '+req.query.quantity+' coin(s)!'
                        }
                        res.send(response);
                    } 
                });
            }
            if(sell.success == false){
                res.send(sell); 
            }
        });
    }  
    if(req.query.exchange == 'swisscex'){
        var payload = {
            
            symbol: req.query.symbol,
            side: 'SELL',
            qty: req.query.qty,
            price: req.query.price,
            
        }

        console.log(payload)
        swisscex('POST', 'order/new', payload, function(order){
            console.log(order)
            res.send(order)
        })
    } 
});

//CANCEL ORDER BY UUID
router.get('/cancel', function(req, res){
    
    var db = req.db;

    if(!req.query.exchange){
        var response = {
            success: false,
            message: 'Exchange parameter required!'
        }
        res.send(response);
    }
    if(!req.query.uuid){
        var response = {
            success: false,
            message: 'uuid parameter required!'
        }
        res.send(response);
    }
    if(req.query.exchange && req.query.uuid){
        newTrade.cancelOrder(req.query.exchange, req.user.apiKeys.bittrexApiKey, req.user.apiKeys.bittrexPrivateKey, req.query, function(cancel){
            if(cancel.success == true){
         
                
                Trade.findOne({uuid: req.query.uuid}).remove( function(error, result){
                   var response = {
                        success: true,
                        message: 'Order UUID: '+req.query.uuid+' canceled successfully!' 
                    }
                    res.send(response);
                    res.json(result);
                });    
            }
            if(cancel.success == false){
                res.json(cancel)
            }
            
        });
    }
});

//GET CANNAPAY TRADE HISTORY
router.get('/history', function(req, res){
   
    var db = req.db;
    db.collection('trades').find({user_Id: req.user._id}, function (err, docs) {
        docs.toArray(function(err, array){
            
            if(array.length > 0){
                var response = {
                    success: true,
                    data: array
                }
                res.send(response)
            }
            
            if(err){
                var response = {
                    success: false,
                    message: err
                }
                res.send(response)
            } 
        })
    });    
});

//GET MARKET ORDERBOOKS
router.get('/orderbook', function(req, res){
    if(!req.query.exchange){
        var response = {
            success: false,
            message: 'Exchange parameter required!'
        }
        res.send(response);
    }
    if(!req.query.market){
        var response = {
            success: false,
            message: 'Market parameter required! (eg. Bittrex = BTC-CCN, Swisscex = CCN_BTC)'
        }
        res.send(response);
    }
    req.query.exchange = (req.query.exchange).toLowerCase()
    if(req.query.exchange == 'bittrex' && req.query.market){
        newTrade.getOrderBook(req.query.exchange, req.user.apiKeys.bittrexApiKey, req.user.apiKeys.bittrexPrivateKey, req.query, function(orderBook){
            res.json(orderBook);
        });
    }
    if(req.query.exchange == 'swisscex' && req.query.market){
        swisscex('GET', 'orderbook/'+req.query.market+'_BTC', {}, function(orderbook){
            res.send(orderbook)
        })
    }
});

//GET MARKET HISTORY
router.get('/markethistory', function(req, res){
    if(!req.query.exchange){
        var response = {
            success: false,
            message: 'Exchange parameter required!'
        }
        res.send(response);
    }
    if(!req.query.market){
        var response = {
            success: false,
            message: 'Market parameter required!'
        }
        res.send(response);
    }
    if(!req.query.market){
        req.query.market = ''
    }
    if(req.query.exchange && req.query.market){
        newTrade.getMarketHistory(req.query.exchange, req.query, function(marketHistory){
            res.json(marketHistory);
        });
    }
});

///////// CUSTOM
//PLACE BUY ORDER 
router.get('/buyladder', function(req, res){
    
    if(!req.query.exchange){
       var response = {
            success: false, 
            message: 'Exchange paramtere required. (eg. exchange=bittrex).'
        }
        res.send(response)
    }

    var exchange = (req.query.exchange).toLowerCase();

    if(exchange !== 'bittrex' && exchange !== 'swisscex'){
       var response = {
            success: false, 
            message: 'Invalid exchange paramtere, please try again. (eg. exchange=bittrex).'

        }
        res.send(response)
    }
    if(!req.query.market){
       var response = {
            success: false, 
            message: 'Market paramtere required. (eg. BTC-CCN).'
        }
        res.send(response)
    }
    if(!req.query.startPrice){
       var response = {
            success: false, 
            message: 'startPrice paramtere required. (eg. startPrice=0.00001337).'
        }
        res.send(response)
    }
    if(!req.query.stopPrice){
       var response = {
            success: false, 
            message: 'stopPrice paramtere required. (eg. stopPrice=0.00001337).'
        }
        res.send(response)
    }
    if(!req.query.spread){
       var response = {
            success: false, 
            message: 'spread paramtere required. (eg. spread=0.00000050)'
        }
        res.send(response)
    }
    if(!req.query.quantity){
       var response = {
            success: false, 
            message: 'Quantity paramtere required. (eg. quantity=3000)'
        }
        res.send(response)
    }
    
    var db = req.db;
    var market = req.query.market.toUpperCase();
    var startPrice = Number(req.query.startPrice).toFixed(8);
    var stopPrice = Number(req.query.stopPrice).toFixed(8);
    var spread = Number(req.query.spread).toFixed(8);

    newTrade.buyLadder(exchange, req.user.apiKeys.bittrexApiKey, req.user.apiKeys.bittrexPrivateKey, req.query, function(buyLadder){
            if(buyLadder.success == true){
                // Insert Trade if all validation successful
                db.collection('trades').insert({user_Id: req.user._id, type: 'buyLadder', exchange: exchange, enabled: true, market: market, quantity: req.query.quantity, start: startPrice, stop: stopPrice, spread: spread, orderGroup: buyLadder, timestamp: Date.now(), modifiedTimeStamp: Date.now()}, function(err, result) {
                    if(err){
                        var response = {
                            success: false,
                            message: err
                        }
                        res.send(response);
                    }
                    
                    if(result !== ''){
                        var response = {
                            success: true,
                            message: 'New '+req.query.exchange+' '+req.query.market+' buy ladder created! (Start: '+req.query.startPrice+' Stop: '+req.query.quantity+' Spread: '+req.query.spread+' Quantity: '+req.query.quantity+' NumTrades: '+((stopPrice-startPrice)/spread).toFixed(0)+')'
                        }
                        res.send(response);
                    } 
                
                    db.close();
                });
            } else {
                res.send(buyLadder);
            }
            
            
      
        
    });  
});

//PLACE SELL ORDER 
router.get('/sellladder', function(req, res){
    
    if(!req.query.exchange){
       var response = {
            success: false, 
            message: 'Exchange paramtere required. (eg. exchange=bittrex).'
        }
        res.send(response)
    }

    var exchange = (req.query.exchange).toLowerCase();

    if(exchange !== 'bittrex' && exchange !== 'swisscex'){
       var response = {
            success: false, 
            message: 'Invalid exchange paramtere, please try again. (eg. exchange=bittrex).'

        }
        res.send(response)
    }
    if(!req.query.market){
       var response = {
            success: false, 
            message: 'Market paramtere required. (eg. BTC-CCN).'
        }
        res.send(response)
    }
    if(!req.query.startPrice){
       var response = {
            success: false, 
            message: 'startPrice paramtere required. (eg. startPrice=0.00001337).'
        }
        res.send(response)
    }
    if(!req.query.stopPrice){
       var response = {
            success: false, 
            message: 'stopPrice paramtere required. (eg. stopPrice=0.00001337).'
        }
        res.send(response)
    }
    if(!req.query.spread){
       var response = {
            success: false, 
            message: 'spread paramtere required. (eg. spread=0.00000050)'
        }
        res.send(response)
    }
    if(!req.query.quantity){
       var response = {
            success: false, 
            message: 'Quantity paramtere required. (eg. quantity=3000)'
        }
        res.send(response)
    }
    
    var db = req.db;
    var market = req.query.market.toUpperCase();
    var startPrice = Number(req.query.startPrice).toFixed(8);
    var stopPrice = Number(req.query.stopPrice).toFixed(8);
    var spread = Number(req.query.spread).toFixed(8);

    newTrade.sellLadder(exchange, req.user.apiKeys.bittrexApiKey, req.user.apiKeys.bittrexPrivateKey, req.query, function(sellLadder){
            if(sellLadder.success == true){
                // Insert Trade if all validation successful
                db.collection('trades').insert({user_Id: req.user._id, type: 'sellLadder', exchange: exchange, enabled: true, market: market, quantity: req.query.quantity, start: startPrice, stop: stopPrice, spread: spread, orderGroup: sellLadder, timestamp: Date.now(), modifiedTimeStamp: Date.now()}, function(err, result) {
                    if(err){
                        var response = {
                            success: false,
                            message: err
                        }
                        res.send(response);
                    }
                    
                    if(result !== ''){
                        var response = {
                            success: true,
                            message: 'New '+req.query.exchange+' '+req.query.market+' sell ladder created! (Start: '+req.query.startPrice+' Stop: '+req.query.quantity+' Spread: '+req.query.spread+' Quantity: '+req.query.quantity+' NumTrades: '+((stopPrice-startPrice)/spread).toFixed(0)+')'
                        }
                        res.send(response);
                    } 
                
                    db.close();
                });
            } else {
                res.send(sellLadder);
            }
            
            
      
        
    });  
});

//CANCEL LADDER
router.get('/cancelLadder', function(req,res){

    var db = req.db;
    
    if(!req.query.exchange){
        var response = {
            success: false, 
            message: 'Exchange paramtere required. (eg. exchange=bittrex).'
        }
        res.send(response)
    }

    var exchange = (req.query.exchange).toLowerCase();

    if(exchange !== 'bittrex' && exchange !== 'swisscex'){
       var response = {
            success: false, 
            message: 'Invalid exchange paramtere, please try again. (eg. exchange=bittrex).'

        }
        res.send(response)
    }


    db.collection('trades').findById(req.query.id, function(error, ladder){
        
        if(ladder == null){
            var response = {
                success: false,
                message: 'Ladder id does not exist!' 
            }
            res.send(response);
        }

        for(var i = 0; i <= ladder.orderGroup.result.length; i++){
            
            if(ladder.orderGroup.result[i] != undefined && ladder.orderGroup.result[i].success == true){

                req.query.uuid = ladder.orderGroup.result[i].result.uuid;

                newTrade.cancelOrder(exchange, req.user.apiKeys.bittrexApiKey, req.user.apiKeys.bittrexPrivateKey, req.query, function(cancel){
                    
                    if(cancel.success == true || cancel.message == 'ORDER_NOT_OPEN'){
                            
                        Trade.findOne({_id: req.query.id}).remove( function(error, result){
                            
                            if(error){
                                var response = {
                                    success: false,
                                    message: 'Error removing order from DB, if this problem persists please contact the site admin!' 
                                }
                                res.send(response);
                            } 

                        });    
                    }
                    
                })    
            }

            if(i == ladder.orderGroup.result.length){
                var response = {
                    success: true,
                    message: 'Ladder canceled successfully!' 
                }
                res.send(response);
            }
            
                
        }  
    })
});

//GET OPEN ORDERS (Required: exchange, market.  Optional pareters: count (default 25))
router.get('/openladders', function(req, res){
    if(!req.query.exchange){
       var response = {
            success: false, 
            message: 'Exchange paramtere required. (eg. exchange=bittrex).'
        }
        res.send(response)
    } else {
        var exchange = (req.query.exchange).toLowerCase();
    }

    if(exchange !== 'bittrex' && exchange !== 'swisscex'){
       var response = {
            success: false, 
            message: 'Invalid exchange paramtere, please try again. (eg. exchange=bittrex).'

        }
        res.send(response)
    }

    if(!req.query.market){
       var response = {
            success: false, 
            message: 'Market paramtere required. (eg. BTC-CCN).'
        }
        res.send(response)
    } else {
        var market = (req.query.market).toUpperCase()
    }

    var db = req.db;

    db.collection('trades').find({user_Id: req.user._id, type: /Ladder/}, function (err, docs) {
        docs.toArray(function(err, array){
            if(array.length > 0){
                var response = {
                    success: true,
                    data: array
                }
                res.send(response)
            }
            else if(err){
                var response = {
                    success: false,
                    message: err
                }
                res.send(response)
            } else {
                 var response = {
                    success: false,
                    message: "Failed to get trade history, either this user has no trade hisotry or there was a problem, if you are certain this user has trades and this problem persists please contact the site admin."
                }
                res.send(response)
            }
        })
    });    
});
////////// END CUSTOM

module.exports = router;