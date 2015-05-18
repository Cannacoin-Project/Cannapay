var mongoose        = require('mongoose');
var mongo           = require('mongoskin');

// Database Connections
var db = mongo.db(process.env.MONGO_DB, {native_parser:process.env.MONGO_DB_NATIVE_PARSER});
mongoose.connect(process.env.MONGO_DB);

var Trade           = require('../models/trade');
var newTrade        = new Trade();

// FIND ENABLED TRADES
// TODO: Use npm syncd cron job package
setInterval(function(){
	// Timestamp used for 
	var timestamp = Date.now();
	newTrade.getMarketSummary('bittrex', function(marketSummary){	
		var markets = [];
		var marketPrice = [];
		marketSummary.result.forEach(function (value, index) {
			markets.push(value.MarketName)
			
			var key = value.MarketName
			var obj = {};
			obj[key] = value.High
			marketPrice.push(obj);
		});
		
		db.collection('trades').find({enabled: 'true', completed: false, market: {$in: markets }}, function(err, docs){
			docs.each(function(err,doc){
				for(var k in marketPrice){
						//console.log('Key is: '+ k + ' value is: ' + marketPrice[k]);
				}
				if(err) {
					console.log(err)
				}
				if(doc != null){
					//console.log(doc.type)
					/*
					if(doc.rate > value.Last && timestamp-doc.timestamp/1000 >= 300){
						
						db.collection('test').updateById(doc._id, {$set: {enabled: false, lastRate: value.Last.toFixed(8), modifiedTimestamp: timestamp }}, function(err, result) {
							
							if(err){

								console.log(err)
							} 
				        });
					}
					*/

				} 
			})
		})
	});
},3000)

setInterval(function(){
	// Find trades for Bittrex & update to completed flag to true if completed on bittrex.
	db.collection('trades').find({enabled: 'true', completed: false, exchange: 'bittrex'}, function(err, docs){
		docs.each(function(error, trade){
			if(err){
				console.log(error)
			}
			
			if(trade != null){
				db.collection('users').findById(trade.user_Id, function(error,user){
					if(error){
						console.log(error)
					}

					if(user != null){
						var params = {market: trade.market};
						
						newTrade.getOrderHistory(trade.exchange, user.apiKeys.bittrexApiKey, user.apiKeys.bittrexPrivateKey, params, function(orderHistory){
							if(orderHistory != null) {
								for (var i = 0, l = orderHistory.result.length; i < l; i++) {
							    
							    if(orderHistory.result[i].OrderUuid == trade.uuid){
							    	db.collection('trades').updateById(trade._id, {$set: {completed: true}}, function(err, result) {
							    		if(err){
							    			console.log(err)
							    		} 
							    		else {
							    			console.log('Order moved to completed..')	
							    		}
							    	})
							    }  
							}
						}
						})
					} else {
						db.close()
					}
				})
			} 
		})
		
	})
},3000)
