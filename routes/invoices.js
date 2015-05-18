var express = require('express');
var router = express.Router();

// Load invoices page
router.get('/', function(req, res) {
    res.render('invoices')
});

// Load invoices page
router.get('/list', function(req, res) {
    var db = req.db;
    db.collection('invoices').find().toArray(function (err, items) {
        res.json(items);
    });
});

// Post new invoice
router.post('/addinvoice', function(req, res) {
    var db = req.db;
    db.collection('invoices').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

// Delete invoice by :id route
router.delete('/delete/:id', function(req, res) {
    var db = req.db;
    var invoiceToDelete = req.params.id;
    db.collection('invoices').removeById(invoiceToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

module.exports = router;