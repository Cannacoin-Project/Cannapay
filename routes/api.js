var express     = require('express');
var request     = require('request');
var router      = express.Router();

var timestamp = (Date.now()/1000).toFixed(0);

// GET Blockchain.info Rates
router.get('/', function(req, res) {
    res.redirect('/api/v1')
});

router.get('/v1', verifyApiKey, function(req, res) {
    res.send({success: true, message: 'Cannapay API v1.0 Coming soon!'})
});

router.get('/v1/invoices', verifyApiKey, function(req, res) {
    res.send({success: true, message: 'single invoice'})
});

router.get('/v1/invoice/create', verifyApiKey, function(req, res) {
    res.send({success: true, message: 'create invoice'})
});

router.get('/v1/invoice/modify', verifyApiKey, function(req, res) {
    res.send({success: true, message: 'modify invoice'})
});

router.get('/v1/invoice/delete', verifyApiKey, function(req, res) {
    res.send({success: true, message: 'delete invoice'})
});
// Route middleware to verify API Key (Working)
function verifyApiKey(req, res, next){
    db = req.db     

    db.collection('users').findOne({'apiKeys.cannapay': req.query.apikey }, function(error, response){
         if(response){

            return next();   

         } else {

            response = {
                success: false,
                message: 'Invalid Cannapay API key, please verifiy you\'re using the correct public key and try again.'
            }
            
            res.send(response);
         }
         
    })
}

module.exports = router;