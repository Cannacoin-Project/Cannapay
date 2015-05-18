var express         = require('express');
var router          = express.Router();
var request         = require('request');
var mongoose        = require('mongoose');
var crypto          = require('crypto');
var Trade           = require('../models/trade');
var newTrade        = new Trade();

//GET ORDER HISTORY @ EXCHANGE 
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

//GET OPEN ORDERS @ EXCHANGE
router.get('/openorders', function(req, res){
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
            message: 'Market parameter required! (eg. BTC-LTC)'
        }
        res.send(response);
    }
    if(req.query.exchange && req.query.market){
        newTrade.getOpenOrders(req.query.exchange, req.user.apiKeys.bittrexApiKey, req.user.apiKeys.bittrexPrivateKey, req.query, function(openOrders){
            res.json(openOrders);
        });
    } else {
        var response = {
            success: false,
            message: 'Failed to get history, if this problem persists please contact the site admin!'
        }
        res.send(response);
    } 
});

//GET ORDER HISTORY @ CANNAPY
router.get('/history', function(req, res){
   
    var db = req.db;
   
    Trade.find({ user_Id : req.user._id }, function (err, docs) {

        if(docs != ''){
            response = {
                success: true,
                data: docs
            }
            
            res.send(response);
        }
        if(err){
            response = {
                success: false,
                message: err
            }
            
            res.send(response);
        }
        else{
            response = {
                success: false,
                message: 'There are no trades for this user'
            }
            
            res.send(response);
        }
        

    });    
});

module.exports = router;