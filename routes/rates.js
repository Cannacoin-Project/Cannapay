var express     = require('express');
var request     = require('request');
var router      = express.Router();

var timestamp = (Date.now()/1000).toFixed(0);

// GET Blockchain.info Rates
router.get('/', function(req, res) {
    var db = req.db;
	var blockchain = 'http://blockchain.info/ticker';
    
    request({url: blockchain, json: true}, function (error, response, body) {
        
        if (error) {
            res.send('Error'+error);
        }
        
        db.collection('rates').insert({data: body, timestamp: timestamp}, function(err, result){
            res.send((err === null) ? { status: 'success', data : body, timestamp: timestamp} : { msg: err });

        });
    });
});

module.exports = router;